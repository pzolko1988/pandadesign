import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildSeoHead } from "@/lib/seo";
import { supabase } from "@/lib/supabase/client";
import {
  DEFAULT_SITE_SETTINGS,
  loadSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";

export const Route = createFileRoute("/kapcsolat")({
  head: () =>
    buildSeoHead({
      title: "Weboldal készítés ajánlatkérés — PandaDesign",
      description:
        "Írd meg, milyen weboldalra van szükséged. A PandaDesign rövid időn belül felveszi veled a kapcsolatot.",
      path: "/kapcsolat",
    }),
  component: ContactPage,
});

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  company: string;
  serviceType: string;
  budgetRange: string;
  message: string;
  privacyAccepted: boolean;
  marketingConsent: boolean;
  website: string;
};

const EMPTY_FORM: ContactForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  serviceType: "Céges weboldal",
  budgetRange: "Még nem tudom",
  message: "",
  privacyAccepted: false,
  marketingConsent: false,
  website: "",
};

const SERVICE_OPTIONS = [
  "Landing oldal",
  "Céges weboldal",
  "Webshop",
  "Egyedi webalkalmazás",
  "Meglévő oldal felújítása",
  "Karbantartás és támogatás",
  "Egyéb",
];

const BUDGET_OPTIONS = [
  "100 000 Ft alatt",
  "100 000–250 000 Ft",
  "250 000–500 000 Ft",
  "500 000–1 000 000 Ft",
  "1 000 000 Ft felett",
  "Még nem tudom",
];

function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);

  const [startedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const loaded = await loadSiteSettings();

        if (active) {
          setSettings(loaded);
        }
      } catch (error) {
        console.error("A kapcsolattartási adatok nem tölthetők be:", error);
      }
    }

    void loadSettings();

    return () => {
      active = false;
    };
  }, []);

  function updateField<K extends keyof ContactForm>(
    field: K,
    value: ContactForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  const address = useMemo(
    () =>
      [
        settings.postal_code,
        settings.city,
        settings.address_line,
        settings.country,
      ]
        .filter(Boolean)
        .join(", "),
    [
      settings.postal_code,
      settings.city,
      settings.address_line,
      settings.country,
    ],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (Date.now() - startedAt < 2000) {
      setErrorMessage(
        "A beküldés túl gyors volt. Kérjük, ellenőrizd az adatokat, majd próbáld újra.",
      );
      return;
    }

    if (name.length < 2) {
      setErrorMessage("Kérjük, add meg a nevedet.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Kérjük, adj meg egy érvényes e-mail-címet.");
      return;
    }

    if (message.length < 10) {
      setErrorMessage(
        "Az üzenetnek legalább 10 karakter hosszúnak kell lennie.",
      );
      return;
    }

    if (!form.privacyAccepted) {
      setErrorMessage("Az adatkezelési tájékoztató elfogadása kötelező.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    const params = new URLSearchParams(window.location.search);

    try {
      const { error } = await supabase.rpc("submit_contact_lead", {
        p_name: name,
        p_email: email,
        p_phone: form.phone.trim(),
        p_company: form.company.trim(),
        p_service_type: form.serviceType,
        p_budget_range: form.budgetRange,
        p_message: message,
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
      });

      if (error) {
        throw error;
      }

      setSubmitted(true);
      setForm(EMPTY_FORM);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Az üzenet elküldése nem sikerült. Kérjük, próbáld újra.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="container-page py-20 md:py-28">
        <Card className="mx-auto max-w-2xl border shadow-elegant">
          <CardContent className="p-8 text-center md:p-12">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-soft text-success">
              <CheckCircle2 className="h-8 w-8" />
            </span>

            <h1 className="mt-6 text-3xl font-bold text-ink">
              Köszönjük a megkeresést!
            </h1>

            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink-soft">
              Az üzeneted sikeresen megérkezett. Átnézzük az igényeidet, és a
              lehető leghamarabb felvesszük veled a kapcsolatot.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                variant="cta"
                onClick={() => setSubmitted(false)}
              >
                Új üzenet küldése
              </Button>

              <Button asChild variant="outline">
                <Link to="/">Vissza a főoldalra</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main>
      <section className="relative overflow-hidden border-b bg-secondary/35 py-16 md:py-24">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(800px_400px_at_90%_0%,color-mix(in_oklab,var(--brand)_10%,transparent),transparent)]"
        />

        <div className="container-page relative">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            Kapcsolat
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-ink md:text-5xl lg:text-6xl">
            Mesélj az elképzelésedről
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
            Írd meg, milyen weboldalra vagy fejlesztésre van szükséged. Az első
            egyeztetés díjmentes és nem jár kötelezettséggel.
          </p>
        </div>
      </section>

      <section className="container-page py-14 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <aside className="space-y-5">
            <Card className="border shadow-soft">
              <CardContent className="p-6 md:p-7">
                <h2 className="text-xl font-bold text-ink">Kapcsolattartás</h2>

                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  A megadott adatokat kizárólag a kapcsolatfelvétel és az
                  ajánlat előkészítése céljából kezeljük.
                </p>

                <div className="mt-6 space-y-4">
                  {settings.show_contact_details && settings.email && (
                    <ContactItem
                      icon={Mail}
                      label="E-mail"
                      value={settings.email}
                      href={`mailto:${settings.email}`}
                    />
                  )}

                  {settings.show_contact_details && settings.phone && (
                    <ContactItem
                      icon={Phone}
                      label="Telefon"
                      value={settings.phone}
                      href={`tel:${settings.phone.replace(/\s/g, "")}`}
                    />
                  )}

                  {settings.show_contact_details && address && (
                    <ContactItem icon={MapPin} label="Cím" value={address} />
                  )}

                  {settings.opening_hours && (
                    <ContactItem
                      icon={Clock3}
                      label="Elérhetőség"
                      value={settings.opening_hours}
                    />
                  )}

                  {!settings.email &&
                    !settings.phone &&
                    !address &&
                    !settings.opening_hours && (
                      <p className="rounded-xl bg-secondary/50 px-4 py-3 text-sm text-ink-soft">
                        Küldd el az űrlapot, és rövid időn belül válaszolunk.
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-soft">
              <CardContent className="p-6 md:p-7">
                <div className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                    <ShieldCheck className="h-5 w-5" />
                  </span>

                  <div>
                    <h2 className="font-bold text-ink">
                      Biztonságos adatkezelés
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      A kapcsolatfelvételi adatokat védett adatbázisban
                      tároljuk, és kizárólag az ajánlatkérés kezelésére
                      használjuk.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          <Card className="border shadow-elegant">
            <CardContent className="p-6 md:p-8">
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-ink">Ajánlatkérés</h2>

                <p className="mt-2 text-sm text-ink-soft">
                  A csillaggal jelölt mezők kitöltése kötelező.
                </p>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div
                  aria-hidden="true"
                  className="absolute -left-[10000px] h-px w-px overflow-hidden"
                >
                  <label htmlFor="contact-website">Weboldal</label>

                  <input
                    id="contact-website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(event) =>
                      updateField("website", event.target.value)
                    }
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    id="contact-name"
                    label="Név"
                    required
                    value={form.name}
                    onChange={(value) => updateField("name", value)}
                    autoComplete="name"
                  />

                  <FormField
                    id="contact-email"
                    label="E-mail-cím"
                    type="email"
                    required
                    value={form.email}
                    onChange={(value) => updateField("email", value)}
                    autoComplete="email"
                  />

                  <FormField
                    id="contact-phone"
                    label="Telefonszám"
                    type="tel"
                    value={form.phone}
                    onChange={(value) => updateField("phone", value)}
                    autoComplete="tel"
                  />

                  <FormField
                    id="contact-company"
                    label="Vállalkozás neve"
                    value={form.company}
                    onChange={(value) => updateField("company", value)}
                    autoComplete="organization"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectField
                    id="contact-service"
                    label="Milyen megoldás érdekel?"
                    value={form.serviceType}
                    options={SERVICE_OPTIONS}
                    onChange={(value) => updateField("serviceType", value)}
                  />

                  <SelectField
                    id="contact-budget"
                    label="Tervezett költségkeret"
                    value={form.budgetRange}
                    options={BUDGET_OPTIONS}
                    onChange={(value) => updateField("budgetRange", value)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-2 block text-sm font-semibold text-ink"
                  >
                    Üzenet *
                  </label>

                  <textarea
                    id="contact-message"
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={8}
                    value={form.message}
                    onChange={(event) =>
                      updateField("message", event.target.value)
                    }
                    placeholder="Írd le röviden a vállalkozásodat, a kívánt funkciókat és az elképzelt határidőt."
                    className="w-full resize-y rounded-xl border bg-background px-4 py-3 leading-relaxed outline-none transition focus:ring-2 focus:ring-brand"
                  />

                  <p className="mt-2 text-right text-xs text-ink-soft">
                    {form.message.length}/5000 karakter
                  </p>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
                  <input
                    type="checkbox"
                    required
                    checked={form.privacyAccepted}
                    onChange={(event) =>
                      updateField("privacyAccepted", event.target.checked)
                    }
                    className="mt-1 h-4 w-4"
                  />

                  <span className="text-sm leading-relaxed text-ink-soft">
                    Elolvastam és elfogadom az{" "}
                    <Link
                      to="/adatkezeles"
                      target="_blank"
                      className="font-semibold text-brand hover:underline"
                    >
                      adatkezelési tájékoztatót
                    </Link>
                    . *
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
                  <input
                    type="checkbox"
                    checked={form.marketingConsent}
                    onChange={(event) =>
                      updateField("marketingConsent", event.target.checked)
                    }
                    className="mt-1 h-4 w-4"
                  />

                  <span className="text-sm leading-relaxed text-ink-soft">
                    Hozzájárulok, hogy a PandaDesign később hasznos szakmai
                    tartalmakkal és ajánlatokkal megkeressen. Ez nem kötelező.
                  </span>
                </label>

                <Button
                  type="submit"
                  size="lg"
                  variant="cta"
                  disabled={submitting}
                  className="w-full sm:w-auto"
                >
                  {submitting ? "Küldés..." : "Ajánlatkérés elküldése"}

                  {submitting ? (
                    <Send className="h-4 w-4 animate-pulse" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

type ContactItemProps = {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
};

function ContactItem({ icon: Icon, label, value, href }: ContactItemProps) {
  const content = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
        <Icon className="h-4 w-4" />
      </span>

      <span>
        <span className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
          {label}
        </span>

        <span className="mt-1 block text-sm font-medium text-ink">{value}</span>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex items-center gap-3 rounded-xl border p-3 transition hover:bg-secondary/40"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border p-3">
      {content}
    </div>
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
};

function FormField({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  autoComplete,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-ink">
        {label}
        {required ? " *" : ""}
      </label>

      <input
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
      />
    </div>
  );
}

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-ink">
        {label}
      </label>

      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
