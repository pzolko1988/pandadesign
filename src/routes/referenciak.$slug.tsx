import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RichTextContent } from "@/components/site/RichTextContent";
import {
  fetchPublishedProject,
  getPortfolioImageUrl,
} from "@/lib/public-project";
import { absoluteUrl, buildSeoHead, DEFAULT_SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/referenciak/$slug")({
  loader: async ({ params }) => {
    const project = await fetchPublishedProject(params.slug);

    if (!project) {
      throw notFound();
    }

    return project;
  },
  head: ({ loaderData: project }) => {
    if (!project) {
      return {};
    }

    const title =
      project.seo_title.trim() || `${project.title} — PandaDesign referencia`;
    const description = project.seo_description.trim() || project.description;
    const path = `/referenciak/${project.slug}`;
    const url = absoluteUrl(path);
    const image = project.image_path
      ? getPortfolioImageUrl(project.image_path)
      : "";
    const keywords = [...project.services, ...project.technologies];

    return buildSeoHead({
      title,
      description,
      path,
      type: "article",
      image: image || undefined,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title,
        description,
        url,
        ...(image ? { image } : {}),
        inLanguage: "hu-HU",
        creator: {
          "@type": "Organization",
          name: "PandaDesign",
          url: DEFAULT_SITE_URL,
        },
        ...(project.category ? { genre: project.category } : {}),
        ...(keywords.length > 0 ? { keywords } : {}),
      },
    });
  },
  component: ReferenceDetailPage,
});

function ReferenceDetailPage() {
  const project = Route.useLoaderData();

  const heroImageUrl = useMemo(
    () => (project.image_path ? getPortfolioImageUrl(project.image_path) : ""),
    [project.image_path],
  );

  const galleryUrls = useMemo(
    () =>
      project.gallery_paths.map((path) => ({
        path,
        url: getPortfolioImageUrl(path),
      })),
    [project.gallery_paths],
  );

  const hasExternalUrl =
    project.project_url.startsWith("https://") ||
    project.project_url.startsWith("http://");

  const hasRichContent =
    project.content_html.replace(/<[^>]*>/g, " ").trim().length > 0;

  return (
    <main>
      <article>
        <header className="relative overflow-hidden border-b bg-secondary/30 py-14 md:py-20">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(900px_450px_at_90%_0%,color-mix(in_oklab,var(--brand)_10%,transparent),transparent)]"
          />

          <div className="container-page relative">
            <div className="mx-auto max-w-5xl">
              <Link
                to="/referenciak"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Vissza a referenciákhoz
              </Link>

              <div className="mt-7 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  {[project.industry, project.category]
                    .filter(Boolean)
                    .join(" · ")}
                </span>

                {project.is_concept && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                    Koncepcióprojekt
                  </span>
                )}
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-ink md:text-5xl lg:text-6xl">
                {project.title}
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-soft">
                {project.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-soft">
                {project.client_name && (
                  <MetaItem icon={UserRound} value={project.client_name} />
                )}

                {project.location && (
                  <MetaItem icon={MapPin} value={project.location} />
                )}

                {project.completed_year && (
                  <MetaItem
                    icon={CalendarDays}
                    value={project.completed_year}
                  />
                )}

                {project.duration_label && (
                  <MetaItem icon={Clock3} value={project.duration_label} />
                )}
              </div>

              {hasExternalUrl && (
                <Button asChild size="lg" variant="cta" className="mt-8">
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Élő weboldal megnyitása
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </header>

        {heroImageUrl && (
          <div className="container-page pt-10">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border shadow-elegant">
              <img
                src={heroImageUrl}
                alt={project.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </div>
        )}

        {(project.challenge || project.solution) && (
          <section className="container-page py-12 md:py-16">
            <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-2">
              {project.challenge && (
                <SummaryCard
                  number="01"
                  title="A kihívás"
                  text={project.challenge}
                />
              )}

              {project.solution && (
                <SummaryCard
                  number="02"
                  title="A megoldás"
                  text={project.solution}
                />
              )}
            </div>
          </section>
        )}

        {project.results.length > 0 && (
          <section className="border-y bg-secondary/30 py-12 md:py-16">
            <div className="container-page">
              <div className="mx-auto max-w-6xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                  Eredmények
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
                  Mit értünk el?
                </h2>

                <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {project.results.map((result) => (
                    <div
                      key={result}
                      className="flex gap-3 rounded-2xl border bg-white p-5 shadow-soft"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />

                      <p className="text-sm font-medium leading-6 text-ink">
                        {result}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {(project.services.length > 0 || project.technologies.length > 0) && (
          <section className="container-page py-12 md:py-16">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
              {project.services.length > 0 && (
                <TagGroup
                  title="Elvégzett szolgáltatások"
                  values={project.services}
                />
              )}

              {project.technologies.length > 0 && (
                <TagGroup title="Technológiák" values={project.technologies} />
              )}
            </div>
          </section>
        )}

        {hasRichContent && (
          <section className="container-page py-8 md:py-12">
            <RichTextContent
              html={project.content_html}
              className="mx-auto max-w-3xl"
            />
          </section>
        )}

        {galleryUrls.length > 0 && (
          <section className="container-page py-12 md:py-16">
            <div className="mx-auto max-w-6xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                Galéria
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
                A projekt részletei
              </h2>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {galleryUrls.map((image, index) => (
                  <figure
                    key={image.path}
                    className={`overflow-hidden rounded-2xl border bg-white shadow-soft ${
                      index % 3 === 0 ? "md:col-span-2" : ""
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${project.title} – projektkép ${index + 1}`}
                      loading="lazy"
                      className={`w-full object-cover ${
                        index % 3 === 0 ? "aspect-[16/8]" : "aspect-[4/3]"
                      }`}
                    />
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="container-page py-14 md:py-20">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-brand p-8 text-brand-foreground shadow-elegant md:p-14">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-40 bg-[radial-gradient(600px_300px_at_100%_0%,color-mix(in_oklab,var(--success)_50%,transparent),transparent)]"
            />

            <div className="relative max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {project.cta_title || "Hasonló weboldalra van szükséged?"}
              </h2>

              <p className="mt-4 text-base leading-relaxed text-brand-foreground/80 md:text-lg">
                {project.cta_text ||
                  "Beszéljük át az elképzelésedet egy díjmentes konzultáción."}
              </p>

              <Button asChild size="lg" variant="cta" className="mt-8">
                <Link to="/kapcsolat">
                  {project.cta_button_text || "Ajánlatot kérek"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}

type MetaItemProps = {
  icon: LucideIcon;
  value: string;
};

function MetaItem({ icon: Icon, value }: MetaItemProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon className="h-4 w-4" />
      {value}
    </span>
  );
}

function SummaryCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl border bg-white p-7 shadow-soft">
      <span className="text-xs font-mono font-bold tracking-widest text-success">
        {number}
      </span>

      <h2 className="mt-4 text-2xl font-bold text-ink">{title}</h2>

      <p className="mt-4 whitespace-pre-line leading-7 text-ink-soft">{text}</p>
    </article>
  );
}

function TagGroup({ title, values }: { title: string; values: string[] }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-ink">{title}</h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className="rounded-full border bg-white px-4 py-2 text-sm font-medium text-ink shadow-soft"
          >
            {value}
          </span>
        ))}
      </div>
    </section>
  );
}
