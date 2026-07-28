import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  buildAdminEmail,
  buildAutoreplyEmail,
  type LeadRecord,
} from "./email-template.ts";

type DatabaseWebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: LeadRecord | null;
  old_record: LeadRecord | null;
};

type ManualPayload = {
  mode: "manual";
  lead_id: string;
};

type ResendResponse = {
  id?: string;
  message?: string;
  name?: string;
};

type AutoreplyResult = {
  status: "disabled" | "sent" | "failed" | "skipped";
  id?: string;
  error?: string;
};

const MAX_REQUEST_BODY_BYTES = 64 * 1024;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly internalMessage?: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

Deno.serve(async (request) => {
  let failureLeadId: string | undefined;
  let deliveryStarted = false;
  let notificationCompleted = false;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        error: "Csak POST kérés engedélyezett.",
      },
      405,
    );
  }

  try {
    const body = await parseJsonBody(request);

    const resendApiKey = requiredEnv("RESEND_API_KEY");
    const notificationFrom = requiredEnv("LEAD_NOTIFICATION_FROM");
    const publicSiteUrl =
      Deno.env.get("PUBLIC_SITE_URL")?.trim() || "https://pandadesign.hu";

    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const secretKey = getSupabaseKey(
      "SUPABASE_SECRET_KEYS",
      "SUPABASE_SERVICE_ROLE_KEY",
      "sb_secret_",
    );

    const serviceClient = createClient(supabaseUrl, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const isManual = isManualPayload(body);

    let lead: LeadRecord;
    let idempotencyKey: string;
    let attemptNumber: number;

    if (isManual) {
      await requireAdmin(request, supabaseUrl);

      lead = await fetchLead(serviceClient, body.lead_id);
      failureLeadId = lead.id;
      attemptNumber = Number(lead.notification_attempts ?? 0) + 1;

      await startManualDelivery(serviceClient, lead.id, attemptNumber);

      deliveryStarted = true;
      idempotencyKey = `pandadesign-lead-${lead.id}-manual-${attemptNumber}-${Date.now()}`;
    } else {
      verifyWebhookRequest(request);

      const webhook = validateWebhookPayload(body);
      failureLeadId = webhook.record.id;

      // Mindig az adatbázis aktuális rekordját használjuk,
      // nem kizárólag a webhook törzsében érkező másolatot.
      lead = await fetchLead(serviceClient, webhook.record.id);
      attemptNumber = Number(lead.notification_attempts ?? 0) + 1;

      const claimed = await claimAutomaticDelivery(
        serviceClient,
        lead.id,
        attemptNumber,
      );

      if (!claimed) {
        return jsonResponse({
          ok: true,
          lead_id: lead.id,
          skipped: true,
          reason: "already_processing_or_completed",
        });
      }

      deliveryStarted = true;
      idempotencyKey = `pandadesign-lead-${lead.id}-automatic`;
    }

    const recipientList = await resolveNotificationRecipients(serviceClient);

    const adminEmail = buildAdminEmail({
      lead,
      publicSiteUrl,
    });

    const adminResult = await sendResendEmail({
      apiKey: resendApiKey,
      idempotencyKey,
      payload: {
        from: notificationFrom,
        to: recipientList,
        subject: adminEmail.subject,
        html: adminEmail.html,
        text: adminEmail.text,
        reply_to: lead.email,
      },
    });

    await updateLeadDelivery(serviceClient, lead.id, {
      notification_status: "sent",
      notification_sent_at: new Date().toISOString(),
      notification_email_id: adminResult.id ?? null,
      notification_error: null,
    });

    notificationCompleted = true;

    const autoreplyResult = await processAutoreply({
      client: serviceClient,
      lead,
      isManual,
      resendApiKey,
      notificationFrom,
    });

    return jsonResponse({
      ok: true,
      lead_id: lead.id,
      notification_email_id: adminResult.id ?? null,
      autoreply: autoreplyResult,
    });
  } catch (error: unknown) {
    const internalMessage =
      error instanceof HttpError
        ? (error.internalMessage ?? error.message)
        : error instanceof Error
          ? error.message
          : "Ismeretlen szerverhiba.";

    console.error("Lead notification failed:", internalMessage);

    if (deliveryStarted && !notificationCompleted && failureLeadId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const secretKey = tryGetSupabaseSecretKey();

        if (supabaseUrl && secretKey) {
          const serviceClient = createClient(supabaseUrl, secretKey, {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          });

          await tryUpdateLeadDelivery(serviceClient, failureLeadId, {
            notification_status: "failed",
            notification_error: internalMessage.slice(0, 2000),
            notification_last_attempt_at: new Date().toISOString(),
          });
        }
      } catch {
        // Az eredeti hibát nem írjuk felül.
      }
    }

    const status = error instanceof HttpError ? error.status : 500;
    const publicMessage =
      error instanceof HttpError ? error.message : "Belső szerverhiba történt.";

    return jsonResponse(
      {
        error: publicMessage,
      },
      status,
    );
  }
});

async function processAutoreply({
  client,
  lead,
  isManual,
  resendApiKey,
  notificationFrom,
}: {
  client: SupabaseClient;
  lead: LeadRecord;
  isManual: boolean;
  resendApiKey: string;
  notificationFrom: string;
}): Promise<AutoreplyResult> {
  if (isManual) {
    // A manuális admin-újraküldés nem írja felül
    // a korábbi automatikus válasz állapotát.
    return {
      status: "skipped",
    };
  }

  const autoreplyEnabled = parseBoolean(Deno.env.get("LEAD_AUTOREPLY_ENABLED"));

  if (!autoreplyEnabled) {
    await tryUpdateLeadDelivery(client, lead.id, {
      autoreply_status: "disabled",
      autoreply_error: null,
    });

    return {
      status: "disabled",
    };
  }

  if (!lead.privacy_accepted || !lead.email) {
    await tryUpdateLeadDelivery(client, lead.id, {
      autoreply_status: "skipped",
      autoreply_error: null,
    });

    return {
      status: "skipped",
    };
  }

  await tryUpdateLeadDelivery(client, lead.id, {
    autoreply_status: "pending",
    autoreply_error: null,
  });

  try {
    const autoreplyFrom =
      Deno.env.get("LEAD_AUTOREPLY_FROM")?.trim() || notificationFrom;

    const autoreplyEmail = buildAutoreplyEmail(lead);

    const response = await sendResendEmail({
      apiKey: resendApiKey,
      idempotencyKey: `pandadesign-lead-${lead.id}-autoreply`,
      payload: {
        from: autoreplyFrom,
        to: [lead.email],
        subject: autoreplyEmail.subject,
        html: autoreplyEmail.html,
        text: autoreplyEmail.text,
      },
    });

    await tryUpdateLeadDelivery(client, lead.id, {
      autoreply_status: "sent",
      autoreply_sent_at: new Date().toISOString(),
      autoreply_email_id: response.id ?? null,
      autoreply_error: null,
    });

    return {
      status: "sent",
      id: response.id,
    };
  } catch (error: unknown) {
    const message =
      error instanceof HttpError
        ? (error.internalMessage ?? error.message)
        : error instanceof Error
          ? error.message
          : "Ismeretlen automatikus válaszhiba.";

    await tryUpdateLeadDelivery(client, lead.id, {
      autoreply_status: "failed",
      autoreply_error: message.slice(0, 2000),
    });

    return {
      status: "failed",
      error: "Az automatikus válasz elküldése nem sikerült.",
    };
  }
}

async function requireAdmin(request: Request, supabaseUrl: string) {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new HttpError(
      401,
      "A manuális küldéshez admin bejelentkezés szükséges.",
    );
  }

  const publishableKey = getSupabaseKey(
    "SUPABASE_PUBLISHABLE_KEYS",
    "SUPABASE_ANON_KEY",
    "sb_publishable_",
  );

  const userClient = createClient(supabaseUrl, publishableKey, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    throw new HttpError(
      401,
      "Érvénytelen vagy lejárt admin munkamenet.",
      userError?.message,
    );
  }

  const { data: isAdmin, error: adminError } = await userClient.rpc("is_admin");

  if (adminError) {
    throw new HttpError(
      500,
      "Az adminjogosultság nem ellenőrizhető.",
      adminError.message,
    );
  }

  if (!isAdmin) {
    throw new HttpError(403, "A művelethez nincs adminisztrátori jogosultság.");
  }
}

function verifyWebhookRequest(request: Request) {
  const expected = requiredEnv("LEAD_WEBHOOK_SECRET");
  const received = request.headers.get("x-webhook-secret")?.trim() ?? "";

  if (!received || !constantTimeEqual(received, expected)) {
    throw new HttpError(403, "Érvénytelen webhook hitelesítés.");
  }
}

function validateWebhookPayload(value: unknown): DatabaseWebhookPayload & {
  record: LeadRecord;
} {
  if (!isWebhookPayload(value)) {
    throw new HttpError(400, "A webhook törzse nem megfelelő.");
  }

  if (
    value.type !== "INSERT" ||
    value.schema !== "public" ||
    value.table !== "contact_leads" ||
    !value.record
  ) {
    throw new HttpError(400, "A webhook csak új contact_leads rekordot fogad.");
  }

  validateLead(value.record);

  return value as DatabaseWebhookPayload & {
    record: LeadRecord;
  };
}

function validateLead(lead: LeadRecord) {
  if (!isUuid(lead.id)) {
    throw new HttpError(400, "A leadazonosító formátuma nem megfelelő.");
  }

  assertTextLength(lead.name, "A név", 2, 120);
  assertTextLength(lead.email, "Az e-mail-cím", 5, 254);
  assertTextLength(lead.message, "Az üzenet", 10, 5000);

  if (!isEmail(lead.email)) {
    throw new HttpError(400, "Az e-mail-cím formátuma nem megfelelő.");
  }

  if (!lead.created_at || Number.isNaN(Date.parse(lead.created_at))) {
    throw new HttpError(400, "A lead létrehozási dátuma nem megfelelő.");
  }

  assertOptionalMaxLength(lead.phone, "A telefonszám", 80);
  assertOptionalMaxLength(lead.company, "A cégnév", 160);
  assertOptionalMaxLength(lead.service_type, "A szolgáltatástípus", 120);
  assertOptionalMaxLength(lead.budget_range, "A költségkeret", 120);
  assertOptionalMaxLength(lead.source_page, "A forrásoldal", 500);
  assertOptionalMaxLength(lead.referrer, "A hivatkozó oldal", 1000);
  assertOptionalMaxLength(lead.utm_source, "Az UTM source", 250);
  assertOptionalMaxLength(lead.utm_medium, "Az UTM medium", 250);
  assertOptionalMaxLength(lead.utm_campaign, "Az UTM campaign", 250);
}

async function fetchLead(client: SupabaseClient, leadId: string) {
  if (!isUuid(leadId)) {
    throw new HttpError(400, "A leadazonosító formátuma nem megfelelő.");
  }

  const { data, error } = await client
    .from("contact_leads")
    .select(
      [
        "id",
        "name",
        "email",
        "phone",
        "company",
        "service_type",
        "budget_range",
        "message",
        "source_page",
        "referrer",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "marketing_consent",
        "privacy_accepted",
        "created_at",
        "notification_attempts",
      ].join(","),
    )
    .eq("id", leadId)
    .maybeSingle();

  if (error) {
    throw new Error(`A lead nem tölthető be: ${error.message}`);
  }

  if (!data) {
    throw new HttpError(404, "A lead nem található.");
  }

  validateLead(data as LeadRecord);

  return data as LeadRecord;
}

async function startManualDelivery(
  client: SupabaseClient,
  leadId: string,
  attemptNumber: number,
) {
  await updateLeadDelivery(client, leadId, {
    notification_status: "processing",
    notification_last_attempt_at: new Date().toISOString(),
    notification_attempts: attemptNumber,
    notification_error: null,
  });
}

async function claimAutomaticDelivery(
  client: SupabaseClient,
  leadId: string,
  attemptNumber: number,
) {
  const { data, error } = await client
    .from("contact_leads")
    .update({
      notification_status: "processing",
      notification_last_attempt_at: new Date().toISOString(),
      notification_attempts: attemptNumber,
      notification_error: null,
    })
    .eq("id", leadId)
    .in("notification_status", ["pending", "failed"])
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Az automatikus leadértesítés nem foglalható le: ${error.message}`,
    );
  }

  return Boolean(data);
}

async function resolveNotificationRecipients(client: SupabaseClient) {
  const envRecipients = parseRecipientList(
    Deno.env.get("LEAD_NOTIFICATION_TO"),
  );

  if (envRecipients.length > 0) {
    return envRecipients;
  }

  const { data, error } = await client
    .from("site_settings")
    .select("contact_recipient_email, email")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error(`A címzett nem tölthető be: ${error.message}`);
  }

  const recipients = parseRecipientList(
    data?.contact_recipient_email || data?.email,
  );

  if (recipients.length === 0) {
    throw new Error(
      "Nincs beállítva értesítési címzett. Add meg a Weboldal adatai oldalon vagy a LEAD_NOTIFICATION_TO titokban.",
    );
  }

  return recipients;
}

async function sendResendEmail({
  apiKey,
  idempotencyKey,
  payload,
}: {
  apiKey: string;
  idempotencyKey: string;
  payload: {
    from: string;
    to: string[];
    subject: string;
    html: string;
    text: string;
    reply_to?: string;
  };
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey.slice(0, 256),
    },
    body: JSON.stringify(payload),
  });

  const result = (await response.json().catch(() => ({}))) as ResendResponse;

  if (!response.ok) {
    const details =
      result.message ||
      result.name ||
      `A Resend API ${response.status} hibával válaszolt.`;

    throw new HttpError(
      502,
      "Az e-mail-szolgáltató nem fogadta el a küldést.",
      details,
    );
  }

  return result;
}

async function updateLeadDelivery(
  client: SupabaseClient,
  leadId: string,
  changes: Record<string, unknown>,
) {
  const { error } = await client
    .from("contact_leads")
    .update(changes)
    .eq("id", leadId);

  if (error) {
    throw new Error(
      `A leadértesítési állapot nem frissíthető: ${error.message}`,
    );
  }
}

async function tryUpdateLeadDelivery(
  client: SupabaseClient,
  leadId: string,
  changes: Record<string, unknown>,
) {
  try {
    await updateLeadDelivery(client, leadId, changes);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Ismeretlen leadállapot-frissítési hiba.";

    console.error(message);
  }
}

function getSupabaseKey(
  pluralEnvName: string,
  legacyEnvName: string,
  preferredPrefix: string,
) {
  const plural = Deno.env.get(pluralEnvName)?.trim();

  if (plural) {
    const values = parseEnvStringValues(plural);
    const preferred = values.find((value) => value.startsWith(preferredPrefix));

    if (preferred) {
      return preferred;
    }

    throw new Error(
      `A ${pluralEnvName} nem tartalmaz ${preferredPrefix} kezdetű kulcsot.`,
    );
  }

  const legacy = Deno.env.get(legacyEnvName)?.trim();

  if (legacy) {
    return legacy;
  }

  throw new Error(
    `Hiányzó Supabase kulcs: ${pluralEnvName} vagy ${legacyEnvName}.`,
  );
}

function tryGetSupabaseSecretKey() {
  try {
    return getSupabaseKey(
      "SUPABASE_SECRET_KEYS",
      "SUPABASE_SERVICE_ROLE_KEY",
      "sb_secret_",
    );
  } catch {
    return null;
  }
}

function parseEnvStringValues(rawValue: string) {
  try {
    return collectStringValues(JSON.parse(rawValue));
  } catch {
    return [rawValue];
  }
}

function collectStringValues(value: unknown): string[] {
  if (typeof value === "string") {
    return [value.trim()].filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectStringValues);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStringValues);
  }

  return [];
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name)?.trim();

  if (!value) {
    throw new Error(`Hiányzó Edge Function titok: ${name}.`);
  }

  return value;
}

function parseRecipientList(value: string | null | undefined) {
  const recipients = [
    ...new Set(
      String(value ?? "")
        .split(/[;,]/)
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];

  if (recipients.length > 10) {
    throw new Error("Legfeljebb 10 értesítési címzett állítható be.");
  }

  for (const recipient of recipients) {
    if (!isEmail(recipient)) {
      throw new Error(`Érvénytelen értesítési e-mail-cím: ${recipient}`);
    }
  }

  return recipients;
}

function parseBoolean(value: string | null | undefined) {
  return ["1", "true", "yes", "on", "igen"].includes(
    String(value ?? "")
      .trim()
      .toLowerCase(),
  );
}

async function parseJsonBody(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    throw new HttpError(
      415,
      "A kérés Content-Type értéke application/json kell legyen.",
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_REQUEST_BODY_BYTES
  ) {
    throw new HttpError(413, "A kérés törzse túl nagy.");
  }

  const text = await request.text();
  const byteLength = new TextEncoder().encode(text).length;

  if (byteLength > MAX_REQUEST_BODY_BYTES) {
    throw new HttpError(413, "A kérés törzse túl nagy.");
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new HttpError(400, "A kérés törzse nem érvényes JSON.");
  }
}

function assertTextLength(
  value: unknown,
  fieldName: string,
  minimum: number,
  maximum: number,
) {
  if (typeof value !== "string") {
    throw new HttpError(400, `${fieldName} nem megfelelő típusú.`);
  }

  const length = value.trim().length;

  if (length < minimum || length > maximum) {
    throw new HttpError(400, `${fieldName} hossza nem megfelelő.`);
  }
}

function assertOptionalMaxLength(
  value: unknown,
  fieldName: string,
  maximum: number,
) {
  if (value === null || value === undefined || value === "") {
    return;
  }

  if (typeof value !== "string" || value.length > maximum) {
    throw new HttpError(
      400,
      `${fieldName} túl hosszú vagy nem megfelelő típusú.`,
    );
  }
}

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function isEmail(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
  );
}

function constantTimeEqual(left: string, right: string) {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);

  if (a.length !== b.length) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < a.length; index += 1) {
    difference |= a[index] ^ b[index];
  }

  return difference === 0;
}

function isManualPayload(value: unknown): value is ManualPayload {
  return Boolean(
    value &&
    typeof value === "object" &&
    "mode" in value &&
    value.mode === "manual" &&
    "lead_id" in value &&
    typeof value.lead_id === "string",
  );
}

function isWebhookPayload(value: unknown): value is DatabaseWebhookPayload {
  return Boolean(
    value &&
    typeof value === "object" &&
    "type" in value &&
    "table" in value &&
    "schema" in value &&
    "record" in value,
  );
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
