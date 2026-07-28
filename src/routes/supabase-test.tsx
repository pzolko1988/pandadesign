import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";

export const Route = createFileRoute("/supabase-test")({
  component: SupabaseTestPage,
});

type HeroContent = {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryButtonText?: string;
};

function SupabaseTestPage() {
  const [content, setContent] = useState<HeroContent | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadHero() {
      try {
        setLoading(true);
        setErrorMessage("");

        const { data, error } = await supabase
          .from("page_sections")
          .select("content")
          .eq("page_slug", "home")
          .eq("section_key", "hero")
          .maybeSingle();

        if (cancelled) {
          return;
        }

        if (error) {
          setErrorMessage(
            [
              `Kód: ${error.code || "nincs"}`,
              `Üzenet: ${error.message || "nincs"}`,
              `Részletek: ${error.details || "nincs"}`,
              `Javaslat: ${error.hint || "nincs"}`,
            ].join("\n"),
          );

          return;
        }

        if (!data) {
          setErrorMessage(
            'A kapcsolat létrejött, de nincs "home / hero" rekord a page_sections táblában.',
          );

          return;
        }

        setContent(data.content as HeroContent);
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : JSON.stringify(error, null, 2),
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadHero();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-background px-6 py-20 text-foreground">
      <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-8 shadow-sm">
        {loading && (
          <p className="text-lg text-muted-foreground">
            Supabase-kapcsolat ellenőrzése...
          </p>
        )}

        {!loading && errorMessage && (
          <div>
            <h1 className="mb-4 text-2xl font-bold text-red-600">
              Supabase-hiba
            </h1>

            <pre className="whitespace-pre-wrap rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </pre>
          </div>
        )}

        {!loading && content && (
          <>
            <div className="mb-6 inline-flex rounded-full bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
              Supabase-kapcsolat sikeres
            </div>

            <p className="mb-3 text-sm font-medium text-muted-foreground">
              {content.eyebrow}
            </p>

            <h1 className="mb-4 text-4xl font-bold tracking-tight">
              {content.title}
            </h1>

            <p className="mb-8 text-lg text-muted-foreground">
              {content.description}
            </p>

            <button
              type="button"
              className="rounded-xl bg-brand px-5 py-3 font-semibold text-white"
            >
              {content.primaryButtonText}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
