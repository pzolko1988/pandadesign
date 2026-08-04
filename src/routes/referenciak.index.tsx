import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buildSeoHead } from "@/lib/seo";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/referenciak/")({
  head: () =>
    buildSeoHead({
      title: "Weboldal referenciák és esettanulmányok — PandaDesign",
      description:
        "Tekintsd meg a PandaDesign weboldal-, webshop- és egyedi fejlesztési projektjeit.",
      path: "/referenciak",
    }),
  component: ReferencesIndexPage,
});

type PublicProject = {
  id: string;
  slug: string;
  title: string;
  industry: string;
  category: string;
  description: string;
  image_path: string | null;
  sort_order: number;
  is_concept: boolean;
  client_name: string;
  completed_year: string;
};

function ReferencesIndexPage() {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [activeCategory, setActiveCategory] = useState("Összes");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, slug, title, industry, category, description, image_path, sort_order, is_concept, client_name, completed_year",
        )
        .eq("is_visible", true)
        .eq("status", "published")
        .order("sort_order", {
          ascending: true,
        });

      if (!active) {
        return;
      }

      if (error) {
        setErrorMessage("A referenciák átmenetileg nem tölthetők be.");
        setLoading(false);
        return;
      }

      setProjects((data ?? []) as PublicProject[]);
      setLoading(false);
    }

    void loadProjects();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => [
      "Összes",
      ...Array.from(
        new Set(projects.map((project) => project.category).filter(Boolean)),
      ),
    ],
    [projects],
  );

  const filteredProjects = useMemo(
    () =>
      activeCategory === "Összes"
        ? projects
        : projects.filter((project) => project.category === activeCategory),
    [activeCategory, projects],
  );

  return (
    <main>
      <section className="relative overflow-hidden border-b bg-secondary/35 py-16 md:py-24">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(900px_450px_at_90%_0%,color-mix(in_oklab,var(--brand)_10%,transparent),transparent)]"
        />

        <div className="container-page relative">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            Munkáink
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-ink md:text-5xl lg:text-6xl">
            Referenciák és esettanulmányok
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
            Koncepciók és megvalósított projektek, részletes tervezési
            folyamattal, technológiákkal és eredményekkel.
          </p>
        </div>
      </section>

      <section className="container-page py-14 md:py-20">
        {!loading && projects.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  activeCategory === category
                    ? "border-brand bg-brand text-white"
                    : "bg-white text-ink hover:bg-secondary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[430px] animate-pulse rounded-2xl border bg-secondary/40"
              />
            ))}
          </div>
        )}

        {!loading && errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && filteredProjects.length === 0 && (
          <div className="rounded-2xl border bg-white p-12 text-center shadow-soft">
            <ImageIcon className="mx-auto h-12 w-12 text-ink-soft/30" />

            <h2 className="mt-5 text-xl font-bold text-ink">
              Nincs megjeleníthető projekt
            </h2>

            <p className="mt-2 text-ink-soft">
              Ebben a kategóriában jelenleg nincs publikált referencia.
            </p>
          </div>
        )}

        {!loading && !errorMessage && filteredProjects.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const imageUrl = project.image_path
                ? supabase.storage
                    .from("portfolio")
                    .getPublicUrl(project.image_path).data.publicUrl
                : "";

              return (
                <Card
                  key={project.id}
                  className="group flex h-full flex-col overflow-hidden border shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
                >
                  <div className="relative aspect-[16/10] overflow-hidden border-b bg-gradient-to-br from-brand/10 to-success/10">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={project.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="grid h-full place-items-center">
                        <ImageIcon className="h-12 w-12 text-brand/25" />
                      </div>
                    )}

                    {project.is_concept && (
                      <span className="absolute left-3 top-3 rounded-full border bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-soft backdrop-blur">
                        Koncepció
                      </span>
                    )}
                  </div>

                  <CardContent className="flex flex-1 flex-col p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">
                      {[project.industry, project.category]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>

                    <h2 className="mt-2 text-xl font-bold leading-tight text-ink">
                      {project.title}
                    </h2>

                    <p className="mt-3 flex-1 text-sm leading-6 text-ink-soft">
                      {project.description}
                    </p>

                    {(project.client_name || project.completed_year) && (
                      <p className="mt-4 text-xs text-ink-soft">
                        {[project.client_name, project.completed_year]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}

                    <Link
                      to="/referenciak/$slug"
                      params={{
                        slug: project.slug,
                      }}
                      className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand transition-all group-hover:gap-2"
                    >
                      Esettanulmány megnyitása
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
