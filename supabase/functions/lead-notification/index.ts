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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
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
    const resendApiKey = requiredEnv("RESEND_API_KEY");
    const notificationFrom = requiredEnv("LEAD_NOTIFICATION_FROM");
    const publicSiteUrl =
      Deno.env.get("PUBLIC_SITE_URL")?.trim() || "https://pandadesign.hu";

    const body = await request.json();

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

    if (isManual) {
      await requireAdmin(request, supabaseUrl);

      lead = await fetchLead(serviceClient, body.lead_id);

      idempotencyKey = `pandadesign-lead-${lead.id}-manual-${Date.now()}`;
    } else {
      verifyWebhookRequest(request);
      const webhook = validateWebhookPayload(body);

      lead = webhook.record;

      idempotencyKey = `pandadesign-lead-${lead.id}-automatic`;
    }

    const attemptNumber = Number(lead.notification_attempts ?? 0) + 1;

    await updateLeadDelivery(serviceClient, lead.id, {
      notification_status: "pending",
      notification_last_attempt_at: new Date().toISOString(),
      notification_attempts: attemptNumber,
      notification_error: null,
    });

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

    let autoreplyResult:
      | {
          status: "disabled" | "sent" | "failed" | "skipped";
          id?: string;
          error?: string;
        }
      | undefined;

    const autoreplyEnabled = parseBoolean(
      Deno.env.get("LEAD_AUTOREPLY_ENABLED"),
    );

    if (isManual) {
      autoreplyResult = {
        status: "skipped",
      };
    } else if (!autoreplyEnabled) {
      autoreplyResult = {
        status: "disabled",
      };
    } else if (!lead.privacy_accepted || !lead.email) {
      autoreplyResult = {
        status: "skipped",
      };
    } else {
      await updateLeadDelivery(serviceClient, lead.id, {
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

        await updateLeadDelivery(serviceClient, lead.id, {
          autoreply_status: "sent",
          autoreply_sent_at: new Date().toISOString(),
          autoreply_email_id: response.id ?? null,
          autoreply_error: null,
        });

        autoreplyResult = {
          status: "sent",
          id: response.id,
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Ismeretlen automatikus válaszhiba.";

        await updateLeadDelivery(serviceClient, lead.id, {
          autoreply_status: "failed",
          autoreply_error: message,
        });

        autoreplyResult = {
          status: "failed",
          error: message,
        };
      }
    }

    if (autoreplyResult) {
      await updateLeadDelivery(serviceClient, lead.id, {
        autoreply_status: autoreplyResult.status,
      });
    }

    return jsonResponse({
      ok: true,
      lead_id: lead.id,
      notification_email_id: adminResult.id ?? null,
      autoreply: autoreplyResult,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Ismeretlen szerverhiba.";

    console.error("Lead notification failed:", message);

    try {
      const body = await cloneJson(request);
      const leadId = isManualPayload(body)
        ? body.lead_id
        : isWebhookPayload(body)
          ? body.record?.id
          : undefined;

      if (leadId) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const secretKey = tryGetSupabaseSecretKey();

        if (supabaseUrl && secretKey) {
          const serviceClient = createClient(supabaseUrl, secretKey, {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          });

          await updateLeadDelivery(serviceClient, leadId, {
            notification_status: "failed",
            notification_error: message.slice(0, 2000),
            notification_last_attempt_at: new Date().toISOString(),
          });
        }
      }
    } catch {
      // Az eredeti hibát nem írjuk felül.
    }

    return jsonResponse(
      {
        error: message,
      },
      500,
    );
  }
});

async function requireAdmin(request: Request, supabaseUrl: string) {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("A manuális küldéshez admin bejelentkezés szükséges.");
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
    throw new Error("Érvénytelen vagy lejárt admin munkamenet.");
  }

  const { data: isAdmin, error: adminError } = await userClient.rpc("is_admin");

  if (adminError || !isAdmin) {
    throw new Error("A művelethez nincs adminisztrátori jogosultság.");
  }
}

function verifyWebhookRequest(request: Request) {
  const expected = requiredEnv("LEAD_WEBHOOK_SECRET");

  const received = request.headers.get("x-webhook-secret")?.trim() ?? "";

  if (!received || !constantTimeEqual(received, expected)) {
    throw new Error("Érvénytelen webhook hitelesítés.");
  }
}

function validateWebhookPayload(value: unknown): DatabaseWebhookPayload & {
  record: LeadRecord;
} {
  if (!isWebhookPayload(value)) {
    throw new Error("A webhook törzse nem megfelelő.");
  }

  if (
    value.type !== "INSERT" ||
    value.schema !== "public" ||
    value.table !== "contact_leads" ||
    !value.record
  ) {
    throw new Error("A webhook csak új contact_leads rekordot fogad.");
  }

  validateLead(value.record);

  return value as DatabaseWebhookPayload & {
    record: LeadRecord;
  };
}

function validateLead(lead: LeadRecord) {
  if (
    !lead.id ||
    !lead.name ||
    !lead.email ||
    !lead.message ||
    !lead.created_at
  ) {
    throw new Error("A lead kötelező adatai hiányoznak.");
  }
}

async function fetchLead(client: SupabaseClient, leadId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(leadId)) {
    throw new Error("A leadazonosító formátuma nem megfelelő.");
  }

  const { data, error } = await client
    .from("contact_leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("A lead nem található.");
  }

  validateLead(data as LeadRecord);

  return data as LeadRecord;
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
    throw new Error(
      result.message ||
        result.name ||
        `A Resend API ${response.status} hibával válaszolt.`,
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
    console.error("A leadértesítési állapot nem frissíthető:", error.message);
  }
}

function getSupabaseKey(
  pluralEnvName: string,
  legacyEnvName: string,
  preferredPrefix: string,
) {
  const legacy = Deno.env.get(legacyEnvName)?.trim();

  if (legacy) {
    return legacy;
  }

  const plural = Deno.env.get(pluralEnvName)?.trim();

  if (!plural) {
    throw new Error(
      `Hiányzó Supabase kulcs: ${pluralEnvName} vagy ${legacyEnvName}.`,
    );
  }

  try {
    const parsed = JSON.parse(plural);
    const values = collectStringValues(parsed);

    const preferred = values.find((value) => value.startsWith(preferredPrefix));

    if (preferred) {
      return preferred;
    }

    if (values[0]) {
      return values[0];
    }
  } catch {
    if (plural.startsWith(preferredPrefix) || plural.length > 20) {
      return plural;
    }
  }

  throw new Error(`A ${pluralEnvName} formátuma nem értelmezhető.`);
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

function collectStringValues(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
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
  return String(value ?? "")
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(value: string | null | undefined) {
  return ["1", "true", "yes", "on", "igen"].includes(
    String(value ?? "")
      .trim()
      .toLowerCase(),
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

async function cloneJson(request: Request) {
  try {
    return await request.clone().json();
  } catch {
    return null;
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
