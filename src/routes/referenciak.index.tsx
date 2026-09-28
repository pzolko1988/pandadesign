import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AuditCtaBlock, ReferenceCard } from "@/components/site/Marketing";
import { fetchPublishedProjects } from "@/lib/public-project";
import { buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/referenciak/")({
  loader: async () => {
    try {
      return { projects: await fetchPublishedProjects(), failed: false };
    } catch (error) {
      console.error("A referenciák nem tölthetők be:", error);
      return { projects: [], failed: true };
    }
  },
  head: () =>
    buildSeoHead({
      title: "Referenciák és esettanulmányok | PandaDesign",
      description:
        "Weboldalak, landing oldalak és webes rendszerek képernyőképekkel: mi volt a kiindulási helyzet, mit készítettünk és milyen technológiával.",
      path: "/referenciak",
    }),
  component: ReferencesIndexPage,
});

const ALL = "Összes";

function ReferencesIndexPage() {
  const { projects, failed } = Route.useLoaderData();
  const [activeCategory, setActiveCategory] = useState(ALL);

  const categories = useMemo(
    () => [
      ALL,
      ...Array.from(
        new Set(projects.map((project) => project.category).filter(Boolean)),
      ),
    ],
    [projects],
  );

  const filteredProjects =
    activeCategory === ALL
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  const hasConcepts = projects.some((project) => project.is_concept);

  return (
    <>
      <section className="relative overflow-hidden border-b bg-secondary/35 py-14 md:py-20">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(900px_450px_at_90%_0%,color-mix(in_oklab,var(--brand)_10%,transparent),transparent)]"
        />
        <div className="container-page relative">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            Munkáink
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Referenciák és esettanulmányok
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
            Minden projektnél leírjuk, mi volt a kiindulási helyzet, mit
            készítettünk, és milyen megoldással. Eredményt csak akkor tüntetünk
            fel, ha az valós és igazolható.
          </p>
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        {failed && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"
          >
            A referenciák átmenetileg nem tölthetők be. Kérjük, frissítsd az
            oldalt néhány perc múlva.
          </div>
        )}

        {!failed && projects.length > 0 && (
          <>
            {categories.length > 2 && (
              <div
                className="mb-8 flex flex-wrap gap-2"
                role="group"
                aria-label="Szűrés kategória szerint"
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={activeCategory === category}
                    onClick={() => setActiveCategory(category)}
                    className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition ${
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

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ReferenceCard key={project.id} project={project} />
              ))}
            </div>

            {hasConcepts && (
              <p className="mt-8 max-w-3xl text-sm leading-relaxed text-ink-soft">
                <span className="font-semibold text-ink">
                  Koncepcióprojekt:
                </span>{" "}
                saját kezdeményezésű mintamunka, nem ügyfélmegrendelés. A
                tervezési és fejlesztési megközelítésünket mutatja be egy
                valószerű üzleti helyzeten keresztül.
              </p>
            )}
          </>
        )}

        {!failed && projects.length === 0 && (
          <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-8 text-center shadow-soft md:p-12">
            <h2 className="text-2xl font-bold text-ink">
              Nézzük meg inkább a te weboldaladat
            </h2>
            <p className="mt-3 text-ink-soft">
              Az esettanulmányok ide kerülnek. Addig is kérj ingyenes auditot:
              15 percben megmutatjuk, mit javítanánk a mostani oldaladon.
            </p>
          </div>
        )}
      </section>

      <AuditCtaBlock
        placement="references"
        title="Ilyen weboldalt szeretnél a saját vállalkozásodnak?"
      />
    </>
  );
}
