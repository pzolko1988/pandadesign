import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/hero")({
  component: AdminHeroPage,
});

type HeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
};

const emptyHero: HeroContent = {
  eyebrow: "",
  title: "",
  description: "",
  primaryButtonText: "",
  primaryButtonUrl: "",
  secondaryButtonText: "",
  secondaryButtonUrl: "",
};

function AdminHeroPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<HeroContent>(emptyHero);
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
        } = await supabase.auth.getSession();

        if (!session) {
          await navigate({
            to: "/admin/login",
            replace: true,
          });

          return;
        }

        const { data, error } = await supabase
          .from("page_sections")
          .select("content")
          .eq("page_slug", "home")
          .eq("section_key", "hero")
          .maybeSingle();

        if (!active) {
          return;
        }

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        if (!data) {
          setErrorMessage("A Hero rekord nem található az adatbázisban.");
          return;
        }

        setForm({
          ...emptyHero,
          ...(data.content as Partial<HeroContent>),
        });
      } catch (error: unknown) {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : "Ismeretlen hiba történt.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadHero();

    return () => {
      active = false;
    };
  }, [navigate]);

  function updateField(field: keyof HeroContent, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("page_sections")
      .update({
        content: form,
        updated_at: new Date().toISOString(),
      })
      .eq("page_slug", "home")
      .eq("section_key", "hero");

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setSuccessMessage("A Hero szakasz sikeresen elmentve.");
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
    <main className="min-h-screen bg-muted/30 px-6 py-14">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            to="/admin/"
            className="text-sm font-semibold text-brand hover:underline"
          >
            ← Vissza az áttekintéshez
          </Link>

          <h1 className="mt-4 text-3xl font-bold">Hero szerkesztése</h1>

          <p className="mt-2 text-muted-foreground">
            Itt módosíthatod a főoldal első szakaszának tartalmát.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border bg-background p-8 shadow-sm"
        >
          <FormField
            label="Kis felső szöveg"
            value={form.eyebrow}
            onChange={(value) => updateField("eyebrow", value)}
          />

          <FormField
            label="Főcím"
            value={form.title}
            onChange={(value) => updateField("title", value)}
          />

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold"
            >
              Leírás
            </label>

            <textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              className="w-full resize-y rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              label="Elsődleges gomb felirata"
              value={form.primaryButtonText}
              onChange={(value) => updateField("primaryButtonText", value)}
            />

            <FormField
              label="Elsődleges gomb hivatkozása"
              value={form.primaryButtonUrl}
              onChange={(value) => updateField("primaryButtonUrl", value)}
            />

            <FormField
              label="Másodlagos gomb felirata"
              value={form.secondaryButtonText}
              onChange={(value) => updateField("secondaryButtonText", value)}
            />

            <FormField
              label="Másodlagos gomb hivatkozása"
              value={form.secondaryButtonUrl}
              onChange={(value) => updateField("secondaryButtonUrl", value)}
            />
          </div>

          {errorMessage && (
            <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
              {successMessage}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand px-6 py-3 font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Mentés..." : "Változtatások mentése"}
            </button>

            <Link
              to="/supabase-test"
              target="_blank"
              className="rounded-xl border bg-background px-6 py-3 font-semibold"
            >
              Előnézet megnyitása
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function FormField({ label, value, onChange }: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
      />
    </div>
  );
}
