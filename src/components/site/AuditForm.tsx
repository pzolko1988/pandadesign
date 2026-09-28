import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CheckboxField,
  EMAIL_PATTERN,
  SelectField,
  TextAreaField,
  TextField,
  isMissingRpcError,
  normalizeWebsiteUrl,
  readableSubmitError,
} from "@/components/site/FormFields";
import { trackEvent } from "@/lib/analytics";
import { AUDIT_HELP_TOPICS } from "@/lib/marketing-content";
import { supabase } from "@/lib/supabase/client";

type AuditFormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  websiteUrl: string;
  helpTopic: string;
  note: string;
  privacyAccepted: boolean;
  marketingConsent: boolean;
  website: string; // honeypot
};

type FieldErrors = Partial<Record<keyof AuditFormState, string>>;

const EMPTY_FORM: AuditFormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  websiteUrl: "",
  helpTopic: "",
  note: "",
  privacyAccepted: false,
  marketingConsent: false,
  website: "",
};

function validate(form: AuditFormState): FieldErrors {
  const errors: FieldErrors = {};

  if (form.name.trim().length < 2) {
    errors.name = "Kérjük, add meg a nevedet.";
  }

  if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = "Kérjük, adj meg egy érvényes e-mail-címet.";
  }

  if (form.phone.trim() && !/^[+\d\s()/-]{6,30}$/.test(form.phone.trim())) {
    errors.phone = "A telefonszám formátuma nem megfelelő.";
  }

  if (form.company.trim().length < 2) {
    errors.company = "Kérjük, add meg a vállalkozás nevét.";
  }

  if (!normalizeWebsiteUrl(form.websiteUrl)) {
    errors.websiteUrl = "Kérjük, adj meg egy érvényes webcímet (pl. pelda.hu).";
  }

  if (!form.helpTopic) {
    errors.helpTopic = "Kérjük, válaszd ki, miben kérsz segítséget.";
  }

  if (!form.privacyAccepted) {
    errors.privacyAccepted = "Az adatkezelési tájékoztató elfogadása kötelező.";
  }

  return errors;
}

export function AuditForm() {
  const [form, setForm] = useState<AuditFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const startedTracking = useRef(false);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitted) {
      successHeadingRef.current?.focus();
    }
  }, [submitted]);

  function markStarted() {
    if (!startedTracking.current) {
      startedTracking.current = true;
      trackEvent("audit_form_start");
    }
  }

  function update<K extends keyof AuditFormState>(
    field: K,
    value: AuditFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    const nextErrors = validate(form);
    setErrors(nextErrors);

    const firstInvalid = Object.keys(nextErrors)[0];

    if (firstInvalid) {
      document.getElementById(`audit-${firstInvalid}`)?.focus();
      return;
    }

    if (Date.now() - startedAt < 2000) {
      setSubmitError(
        "A beküldés túl gyors volt. Kérjük, ellenőrizd az adatokat, majd próbáld újra.",
      );
      return;
    }

    setSubmitting(true);

    const params = new URLSearchParams(window.location.search);
    const websiteUrl = normalizeWebsiteUrl(form.websiteUrl);
    const shared = {
      p_name: form.name.trim(),
      p_email: form.email.trim(),
      p_phone: form.phone.trim(),
      p_company: form.company.trim(),
      p_privacy_accepted: form.privacyAccepted,
      p_marketing_consent: form.marketingConsent,
      p_source_page: `${window.location.pathname}${window.location.search}`,
      p_referrer: document.referrer,
      p_utm_source: params.get("utm_source") ?? "",
      p_utm_medium: params.get("utm_medium") ?? "",
      p_utm_campaign: params.get("utm_campaign") ?? "",
      p_utm_content: params.get("utm_content") ?? "",
      p_utm_term: params.get("utm_term") ?? "",
      p_user_agent: navigator.userAgent,
      p_website: form.website,
    };

    try {
      const { error } = await supabase.rpc("submit_audit_request", {
        ...shared,
        p_website_url: websiteUrl,
        p_help_topic: form.helpTopic,
        p_note: form.note.trim(),
      });

      if (error && isMissingRpcError(error)) {
        // Tartalék, amíg a 20260928120000 migráció nem fut le: a meglévő,
        // ellenőrzött leadbeküldő függvényt használjuk.
        const fallback = await supabase.rpc("submit_contact_lead", {
          ...shared,
          p_service_type: "Ingyenes weboldal-audit",
          p_budget_range: "Még nem tudom",
          p_message: [
            "Ingyenes weboldal-audit kérés",
            `Weboldal: ${websiteUrl}`,
            `Miben kér segítséget: ${form.helpTopic}`,
            form.note.trim() ? `Megjegyzés: ${form.note.trim()}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        });

        if (fallback.error) {
          throw fallback.error;
        }
      } else if (error) {
        throw error;
      }

      trackEvent("audit_form_submit", { help_topic: form.helpTopic });
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch (error: unknown) {
      console.error("Az audit kérés beküldése sikertelen:", error);
      setSubmitError(readableSubmitError(error));
      window.setTimeout(() => errorRef.current?.focus(), 0);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div role="status" className="py-6 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2
          ref={successHeadingRef}
          tabIndex={-1}
          className="mt-5 text-2xl font-bold text-ink outline-none"
        >
          Megkaptuk az audit kérésedet!
        </h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-soft">
          Átnézzük a weboldaladat, és e-mailben felvesszük veled a kapcsolatot
          egy rövid, 15 perces egyeztetés időpontjával.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/referenciak">Addig megnézem a munkákat</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div
        aria-hidden="true"
        className="absolute -left-[10000px] h-px w-px overflow-hidden"
      >
        <label htmlFor="audit-website-hp">Weboldal</label>
        <input
          id="audit-website-hp"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) => update("website", event.target.value)}
        />
      </div>

      {submitError && (
        <div
          ref={errorRef}
          role="alert"
          tabIndex={-1}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 outline-none"
        >
          {submitError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="audit-name"
          label="Név"
          required
          autoComplete="name"
          maxLength={120}
          value={form.name}
          error={errors.name}
          onFocus={markStarted}
          onChange={(value) => update("name", value)}
        />
        <TextField
          id="audit-email"
          label="E-mail-cím"
          type="email"
          inputMode="email"
          required
          autoComplete="email"
          maxLength={254}
          value={form.email}
          error={errors.email}
          onFocus={markStarted}
          onChange={(value) => update("email", value)}
        />
        <TextField
          id="audit-phone"
          label="Telefonszám"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={30}
          value={form.phone}
          error={errors.phone}
          onFocus={markStarted}
          onChange={(value) => update("phone", value)}
        />
        <TextField
          id="audit-company"
          label="Vállalkozás neve"
          required
          autoComplete="organization"
          maxLength={160}
          value={form.company}
          error={errors.company}
          onFocus={markStarted}
          onChange={(value) => update("company", value)}
        />
      </div>

      <TextField
        id="audit-websiteUrl"
        label="Jelenlegi weboldal címe"
        type="url"
        inputMode="url"
        required
        autoComplete="url"
        maxLength={500}
        placeholder="pelda.hu"
        value={form.websiteUrl}
        error={errors.websiteUrl}
        onFocus={markStarted}
        onChange={(value) => update("websiteUrl", value)}
      />

      <SelectField
        id="audit-helpTopic"
        label="Miben kérsz segítséget?"
        required
        placeholder="Válassz egy lehetőséget"
        options={AUDIT_HELP_TOPICS}
        value={form.helpTopic}
        error={errors.helpTopic}
        onFocus={markStarted}
        onChange={(value) => update("helpTopic", value)}
      />

      <TextAreaField
        id="audit-note"
        label="Megjegyzés"
        rows={4}
        maxLength={2000}
        placeholder="Bármi, amit érdemes tudnunk előre (pl. célközönség, futó kampányok)."
        value={form.note}
        onFocus={markStarted}
        onChange={(value) => update("note", value)}
      />

      <CheckboxField
        id="audit-privacyAccepted"
        required
        checked={form.privacyAccepted}
        error={errors.privacyAccepted}
        onChange={(checked) => update("privacyAccepted", checked)}
      >
        Elolvastam és elfogadom az{" "}
        <Link
          to="/adatkezeles"
          target="_blank"
          className="font-semibold text-brand underline"
        >
          adatkezelési tájékoztatót
        </Link>
        . <span aria-hidden="true">*</span>
      </CheckboxField>

      <CheckboxField
        id="audit-marketingConsent"
        checked={form.marketingConsent}
        onChange={(checked) => update("marketingConsent", checked)}
      >
        Hozzájárulok, hogy a PandaDesign később hasznos szakmai tartalmakkal és
        ajánlatokkal megkeressen. Nem kötelező, bármikor visszavonható.
      </CheckboxField>

      <Button
        type="submit"
        size="lg"
        variant="cta"
        disabled={submitting}
        aria-busy={submitting}
        className="h-auto min-h-12 w-full whitespace-normal py-3 sm:w-auto"
      >
        {submitting ? (
          <>
            Küldés folyamatban…
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          </>
        ) : (
          <>
            Kérem az ingyenes auditot
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </>
        )}
      </Button>
    </form>
  );
}
