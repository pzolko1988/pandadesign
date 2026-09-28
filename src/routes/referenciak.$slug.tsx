import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import { trackEvent } from "@/lib/analytics";
import { AUDIT_PATH } from "@/lib/marketing-content";
import {
  fetchPublishedProject,
  getCapturedReferenceImageUrl,
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
      project.seo_title.trim() || `${project.title} – referencia | PandaDesign`;
    const description = project.seo_description.trim() || project.description;
    const path = `/referenciak/${project.slug}`;
    const url = absoluteUrl(path);
    const imagePath = project.image_path || project.mobile_image_path;
    const image = imagePath ? getPortfolioImageUrl(imagePath) : "";
    const keywords = [...project.services, ...project.technologies];

    return buildSeoHead({
      title,
      description,
      path,
      type: "article",
      image: image || undefined,
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          {
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
            ...(keywords.length > 0 ? { keywords: keywords.join(", ") } : {}),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Főoldal",
                item: absoluteUrl("/"),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Referenciák",
                item: absoluteUrl("/referenciak"),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: project.title,
                item: url,
              },
            ],
          },
        ],
      },
    });
  },
  component: ReferenceDetailPage,
});

function ReferenceDetailPage() {
  const project = Route.useLoaderData();

  useEffect(() => {
    trackEvent("reference_view", {
      project_slug: project.slug,
      project_category: project.category,
    });
  }, [project.slug, project.category]);

  const [capturedDesktopFailed, setCapturedDesktopFailed] =
    useState(false);
  const [capturedMobileFailed, setCapturedMobileFailed] = useState(false);
  const capturedDesktop = getCapturedReferenceImageUrl(project.slug, "desktop");
  const capturedMobile = getCapturedReferenceImageUrl(project.slug, "mobile");
  const desktopUrl = project.image_path
    ? getPortfolioImageUrl(project.image_path)
    : capturedDesktopFailed
      ? ""
      : capturedDesktop;
  const mobileUrl = project.mobile_image_path
    ? getPortfolioImageUrl(project.mobile_image_path)
    : capturedMobileFailed
      ? ""
      : capturedMobile;

  const galleryUrls = useMemo(
    () =>
      project.gallery_paths.map((path) => ({
        path,
        url: getPortfolioImageUrl(path),
      })),
    [project.gallery_paths],
  );

  const hasExternalUrl = /^https?:\/\//.test(project.project_url);
  const hasRichContent =
    project.content_html.replace(/<[^>]*>/g, " ").trim().length > 0;

  const whatWeBuilt = project.solution;

  return (
    <article>
      <header className="relative overflow-hidden border-b bg-secondary/30 py-12 md:py-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(900px_450px_at_90%_0%,color-mix(in_oklab,var(--brand)_10%,transparent),transparent)]"
        />
        <div className="container-page relative">
          <div className="mx-auto max-w-5xl">
            <nav aria-label="Morzsamenü" className="text-sm">
              <Link
                to="/referenciak"
                className="inline-flex items-center gap-2 font-semibold text-brand hover:underline"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Vissza a referenciákhoz
              </Link>
            </nav>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {[project.category, project.industry]
                .filter(Boolean)
                .filter(
                  (value, index, values) => values.indexOf(value) === index,
                )
                .map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand"
                  >
                    {label}
                  </span>
                ))}
              {project.is_concept && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                  Koncepcióprojekt – nem ügyfélmegrendelés
                </span>
              )}
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-ink md:text-5xl">
              {project.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-soft">
              {project.description}
            </p>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-soft">
              {project.client_name && (
                <MetaItem icon={UserRound} value={project.client_name} />
              )}
              {project.location && (
                <MetaItem icon={MapPin} value={project.location} />
              )}
              {project.completed_year && (
                <MetaItem icon={CalendarDays} value={project.completed_year} />
              )}
              {project.duration_label && (
                <MetaItem icon={Clock3} value={project.duration_label} />
              )}
            </div>

            {hasExternalUrl && (
              <Button asChild size="lg" variant="outline" className="mt-7">
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {project.is_concept
                    ? "Élő demó megnyitása"
                    : "Élő weboldal megnyitása"}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">(új lapon nyílik)</span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {(desktopUrl || mobileUrl) && (
        <div className="container-page pt-10">
          <div className="mx-auto flex max-w-6xl items-end gap-4 md:gap-6">
            {desktopUrl && (
              <figure className="min-w-0 flex-1 overflow-hidden rounded-2xl border shadow-elegant">
                <img
                  src={desktopUrl}
                  alt={`${project.title} – asztali nézet`}
                  onError={() => {
                    if (!project.image_path) {
                      setCapturedDesktopFailed(true);
                    }
                  }}
                  className="aspect-[16/10] w-full object-cover object-top"
                />
              </figure>
            )}
            {mobileUrl && (
              <figure
                className={`overflow-hidden rounded-[1.75rem] border-[6px] border-ink bg-ink shadow-elegant ${
                  desktopUrl
                    ? "hidden w-[22%] max-w-[240px] sm:block"
                    : "mx-auto w-full max-w-[300px]"
                }`}
              >
                <img
                  src={mobileUrl}
                  alt={`${project.title} – mobil nézet`}
                  onError={() => {
                    if (!project.mobile_image_path) {
                      setCapturedMobileFailed(true);
                    }
                  }}
                  className="aspect-[9/19] w-full rounded-[1.25rem] object-cover object-top"
                />
              </figure>
            )}
          </div>
        </div>
      )}

      <div className="container-page py-12 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-2">
          {project.challenge && (
            <CaseBlock number="01" title="Kiindulási probléma">
              <p className="whitespace-pre-line leading-7 text-ink-soft">
                {project.challenge}
              </p>
            </CaseBlock>
          )}

          {(whatWeBuilt || project.services.length > 0) && (
            <CaseBlock number="02" title="Mit készítettünk?">
              {whatWeBuilt && (
                <p className="whitespace-pre-line leading-7 text-ink-soft">
                  {whatWeBuilt}
                </p>
              )}
              {project.services.length > 0 && (
                <TagList values={project.services} />
              )}
            </CaseBlock>
          )}

          {project.features.length > 0 && (
            <CaseBlock number="03" title="Fő funkciók">
              <CheckList values={project.features} />
            </CaseBlock>
          )}

          {project.technologies.length > 0 && (
            <CaseBlock number="04" title="Technikai megoldás">
              <TagList values={project.technologies} />
            </CaseBlock>
          )}
        </div>
      </div>

      {project.results.length > 0 && (
        <section className="border-y bg-secondary/30 py-12 md:py-16">
          <div className="container-page">
            <div className="mx-auto max-w-6xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                05
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
                Eredmény
              </h2>
              <div className="mt-8">
                <CheckList values={project.results} />
              </div>
            </div>
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
            <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Képek a projektből
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
                    decoding="async"
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
          <div className="relative max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {project.cta_title || "Hasonló weboldalra van szükséged?"}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-brand-foreground/80 md:text-lg">
              {project.cta_text ||
                "Kezdjük egy ingyenes, 15 perces audittal: megmutatjuk, mit javítanánk a mostani oldaladon."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                variant="cta"
                className="h-auto min-h-12 whitespace-normal py-3"
              >
                <a href={AUDIT_PATH} data-track-placement="reference_detail">
                  Kérem az ingyenes auditot
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-brand-foreground hover:bg-white/10 hover:text-brand-foreground"
              >
                <a href="/kapcsolat" data-track-placement="reference_detail">
                  {project.cta_button_text || "Ajánlatot kérek"}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

function MetaItem({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon className="h-4 w-4" aria-hidden="true" />
      {value}
    </span>
  );
}

function CaseBlock({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-soft md:p-7">
      <span className="font-mono text-xs font-bold tracking-widest text-success">
        {number}
      </span>
      <h2 className="mt-3 text-2xl font-bold text-ink">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function CheckList({ values }: { values: string[] }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {values.map((value) => (
        <li key={value} className="flex gap-3 text-sm leading-6 text-ink">
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0 text-success"
            aria-hidden="true"
          />
          {value}
        </li>
      ))}
    </ul>
  );
}

function TagList({ values }: { values: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {values.map((value) => (
        <li
          key={value}
          className="rounded-full border bg-white px-3 py-1.5 text-sm font-medium text-ink"
        >
          {value}
        </li>
      ))}
    </ul>
  );
}
