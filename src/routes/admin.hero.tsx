import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  DEFAULT_HERO,
  HERO_CONTENT_VERSION,
  type HeroContent,
} from "@/lib/public-home-seo";
import {
  DEFAULT_HERO_VISUAL,
  type HeroVisualContent,
} from "@/lib/marketing-content";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/hero")({
  component: AdminHeroPage,
});

type MainHeroKey = Exclude<keyof HeroContent, "visual">;
type HeroVisualTextKey = Exclude<keyof HeroVisualContent, "keywords">;

function AdminHeroPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<HeroContent>(DEFAULT_HERO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHero() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          await navigate({ to: "/admin/login", replace: true });
          return;
        }

        const { data: isAdmin, error: adminError } =
          await supabase.rpc("is_admin");

        if (adminError) throw adminError;
        if (!isAdmin) {
          throw new Error("Ehhez az oldalhoz nincs adminisztrátori jogosultságod.");
        }

        const { data, error } = await supabase
          .from("page_sections")
          .select("content")
          .eq("page_slug", "home")
          .eq("section_key", "hero")
          .maybeSingle();

        if (!active) return;
        if (error) throw error;
        if (!data) throw new Error("A Hero rekord nem található az adatbázisban.");

        const content =
          data.content && typeof data.content === "object"
            ? (data.content as Record<string, unknown>)
            : {};
        const visual =
          content.visual && typeof content.visual === "object"
            ? (content.visual as Partial<HeroVisualContent>)
            : {};

        setForm({
          ...DEFAULT_HERO,
          ...pickMainHero(content),
          visual: {
            ...DEFAULT_HERO_VISUAL,
            ...visual,
            keywords: Array.isArray(visual.keywords)
              ? visual.keywords
                  .filter((item): item is string => typeof item === "string")
                  .map((item) => item.trim())
                  .filter(Boolean)
              : DEFAULT_HERO_VISUAL.keywords,
          },
        });
      } catch (error: unknown) {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : "Ismeretlen hiba történt.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadHero();
    return () => {
      active = false;
    };
  }, [navigate]);

  function updateField(field: MainHeroKey, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateVisual(field: HeroVisualTextKey, value: string) {
    setForm((current) => ({
      ...current,
      visual: { ...current.visual, [field]: value },
    }));
  }

  function updateKeywords(value: string) {
    setForm((current) => ({
      ...current,
      visual: {
        ...current.visual,
        keywords: value
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 8),
      },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (form.title.trim().length < 5 || form.description.trim().length < 10) {
      setErrorMessage("A főcím és a leírás nem lehet üres.");
      setSaving(false);
      return;
    }

    const payload = {
      ...form,
      version: HERO_CONTENT_VERSION,
      visual: {
        ...form.visual,
        keywords:
          form.visual.keywords.length > 0
            ? form.visual.keywords
            : DEFAULT_HERO_VISUAL.keywords,
      },
    };

    const { error } = await supabase
      .from("page_sections")
      .update({
        content: payload,
        updated_at: new Date().toISOString(),
      })
      .eq("page_slug", "home")
      .eq("section_key", "hero");

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setSuccessMessage("A Hero és a 3D vizuál tartalma sikeresen elmentve.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-muted-foreground">Hero betöltése...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <Link to="/admin" className="text-sm font-semibold text-brand hover:underline">
            ← Vissza az áttekintéshez
          </Link>
          <h1 className="mt-4 text-3xl font-bold">Hero + 3D vizuál szerkesztése</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            A főoldali hero minden látható szövege innen szerkeszthető. A 3D
            mozgás és a rétegek technikai beállításai fixek maradnak, hogy a
            design és a mobilos működés ne törhessen el.
          </p>
        </header>

        {errorMessage && (
          <p className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            {successMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <EditorSection
            title="Fő hero szövegek"
            description="A bal oldali értékesítési üzenet és a két fő CTA."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Kis felső szöveg" value={form.eyebrow} onChange={(v) => updateField("eyebrow", v)} />
              <FormField label="Főcím" value={form.title} onChange={(v) => updateField("title", v)} />
              <div className="md:col-span-2">
                <TextAreaField label="Leírás" value={form.description} onChange={(v) => updateField("description", v)} rows={4} />
              </div>
              <FormField label="Elsődleges gomb felirata" value={form.primaryButtonText} onChange={(v) => updateField("primaryButtonText", v)} />
              <FormField label="Elsődleges gomb hivatkozása" value={form.primaryButtonUrl} onChange={(v) => updateField("primaryButtonUrl", v)} />
              <FormField label="Másodlagos gomb felirata" value={form.secondaryButtonText} onChange={(v) => updateField("secondaryButtonText", v)} />
              <FormField label="Másodlagos gomb hivatkozása" value={form.secondaryButtonUrl} onChange={(v) => updateField("secondaryButtonUrl", v)} />
            </div>
          </EditorSection>

          <EditorSection
            title="3D hero vizuál tartalma"
            description="A jobb oldali animált böngésző-, CRM-, analytics-, automatizáció- és mobilkártya szövegei."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Böngésző domain" value={form.visual.browserDomain} onChange={(v) => updateVisual("browserDomain", v)} />
              <FormField label="Böngésző felső címke" value={form.visual.kicker} onChange={(v) => updateVisual("kicker", v)} />
              <FormField label="Böngésző főcím" value={form.visual.headline} onChange={(v) => updateVisual("headline", v)} />
              <FormField label="Böngésző CTA" value={form.visual.cta} onChange={(v) => updateVisual("cta", v)} />
              <div className="md:col-span-2">
                <TextAreaField label="Böngésző rövid leírás" value={form.visual.copy} onChange={(v) => updateVisual("copy", v)} rows={3} />
              </div>

              <FormField label="CRM címke" value={form.visual.crmLabel} onChange={(v) => updateVisual("crmLabel", v)} />
              <FormField label="CRM státusz" value={form.visual.crmStatus} onChange={(v) => updateVisual("crmStatus", v)} />
              <FormField label="CRM főcím" value={form.visual.crmTitle} onChange={(v) => updateVisual("crmTitle", v)} />
              <FormField label="CRM folyamat szöveg" value={form.visual.crmMeta} onChange={(v) => updateVisual("crmMeta", v)} />

              <FormField label="Analytics címke" value={form.visual.analyticsLabel} onChange={(v) => updateVisual("analyticsLabel", v)} />
              <FormField label="Analytics státusz" value={form.visual.analyticsStatus} onChange={(v) => updateVisual("analyticsStatus", v)} />
              <FormField label="Metrika 1 neve" value={form.visual.metricOneLabel} onChange={(v) => updateVisual("metricOneLabel", v)} />
              <FormField label="Metrika 1 értéke" value={form.visual.metricOneValue} onChange={(v) => updateVisual("metricOneValue", v)} />
              <FormField label="Metrika 2 neve" value={form.visual.metricTwoLabel} onChange={(v) => updateVisual("metricTwoLabel", v)} />
              <FormField label="Metrika 2 értéke" value={form.visual.metricTwoValue} onChange={(v) => updateVisual("metricTwoValue", v)} />
              <FormField label="Metrika 3 neve" value={form.visual.metricThreeLabel} onChange={(v) => updateVisual("metricThreeLabel", v)} />
              <FormField label="Metrika 3 értéke" value={form.visual.metricThreeValue} onChange={(v) => updateVisual("metricThreeValue", v)} />

              <FormField label="Automatizáció címke" value={form.visual.automationLabel} onChange={(v) => updateVisual("automationLabel", v)} />
              <FormField label="Mobil CTA" value={form.visual.phoneButton} onChange={(v) => updateVisual("phoneButton", v)} />
              <FormField label="Automatizáció 1. lépés" value={form.visual.automationNodeOne} onChange={(v) => updateVisual("automationNodeOne", v)} />
              <FormField label="Automatizáció 2. lépés" value={form.visual.automationNodeTwo} onChange={(v) => updateVisual("automationNodeTwo", v)} />
              <FormField label="Automatizáció 3. lépés" value={form.visual.automationNodeThree} onChange={(v) => updateVisual("automationNodeThree", v)} />

              <div className="md:col-span-2">
                <TextAreaField
                  label="Alsó kulcsszavak – soronként egy"
                  value={form.visual.keywords.join("\n")}
                  onChange={updateKeywords}
                  rows={5}
                />
              </div>
            </div>
          </EditorSection>

          <div className="flex flex-wrap gap-3 rounded-2xl border bg-background p-5 shadow-sm">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand px-6 py-3 font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Mentés..." : "Hero változtatások mentése"}
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border bg-background px-6 py-3 font-semibold"
            >
              Főoldal előnézet
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}

function pickMainHero(record: Record<string, unknown>): Partial<HeroContent> {
  const result: Partial<HeroContent> = {};
  const keys: MainHeroKey[] = [
    "eyebrow",
    "title",
    "description",
    "primaryButtonText",
    "primaryButtonUrl",
    "secondaryButtonText",
    "secondaryButtonUrl",
  ];

  for (const key of keys) {
    if (typeof record[key] === "string") {
      (result as Record<string, unknown>)[key] = record[key];
    }
  }

  return result;
}

function EditorSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-background p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">{description}</p>
      {children}
    </section>
  );
}

function FormField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
      />
    </label>
  );
}
