import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  MapPin,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RichTextContent } from "@/components/site/RichTextContent";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/preview/project/$token")({
  component: ProjectPreviewPage,
});

type ProjectPreview = {
  id: string;
  slug: string;
  title: string;
  industry: string;
  category: string;
  description: string;
  image_path: string | null;
  project_url: string;
  is_concept: boolean;
  status: "draft" | "published";
  client_name: string;
  location: string;
  completed_year: string;
  duration_label: string;
  challenge: string;
  solution: string;
  results: string[];
  services: string[];
  technologies: string[];
  content_html: string;
  gallery_paths: string[];
  seo_title: string;
  seo_description: string;
  cta_title: string;
  cta_text: string;
  cta_button_text: string;
  preview_expires_at: string;
};

function ProjectPreviewPage() {
  const { token } = Route.useParams();

  const [project, setProject] = useState<ProjectPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPreview() {
      const { data, error } = await supabase.rpc("get_project_preview", {
        p_token: token,
      });

      if (!active) {
        return;
      }

      if (error) {
        setErrorMessage("Az előnézet nem tölthető be.");
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage("Az előnézeti link érvénytelen vagy lejárt.");
        setLoading(false);
        return;
      }

      setProject(data as ProjectPreview);
      setLoading(false);
    }

    void loadPreview();

    return () => {
      active = false;
    };
  }, [token]);

  const heroImageUrl = useMemo(
    () => (project?.image_path ? getPortfolioUrl(project.image_path) : ""),
    [project?.image_path],
  );

  const galleryUrls = useMemo(
    () =>
      (project?.gallery_paths ?? []).map((path) => ({
        path,
        url: getPortfolioUrl(path),
      })),
    [project?.gallery_paths],
  );

  if (loading) {
    return (
      <main className="container-page py-20">
        <div className="mx-auto max-w-5xl animate-pulse space-y-6">
          <div className="h-14 rounded bg-muted" />
          <div className="h-6 w-2/3 rounded bg-muted" />
          <div className="aspect-video rounded-3xl bg-muted" />
        </div>
      </main>
    );
  }

  if (errorMessage || !project) {
    return (
      <main className="container-page py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-10 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-700" />

          <h1 className="mt-4 text-2xl font-bold text-amber-900">
            Az előnézet nem érhető el
          </h1>

          <p className="mt-3 text-amber-800">{errorMessage}</p>

          <Link
            to="/"
            className="mt-7 inline-flex items-center gap-2 font-semibold text-brand hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Vissza a főoldalra
          </Link>
        </div>
      </main>
    );
  }

  const hasExternalUrl =
    project.project_url.startsWith("https://") ||
    project.project_url.startsWith("http://");

  const hasRichContent =
    project.content_html.replace(/<[^>]*>/g, " ").trim().length > 0;

  return (
    <main>
      <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50/95 px-4 py-3 backdrop-blur">
        <div className="container-page flex flex-col gap-2 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2 font-semibold">
            <Eye className="h-4 w-4" />
            Titkos projekt-előnézet
          </span>

          <span>Lejár: {formatDate(project.preview_expires_at)}</span>
        </div>
      </div>

      <article>
        <header className="relative overflow-hidden border-b bg-secondary/30 py-14 md:py-20">
          <div className="container-page relative">
            <div className="mx-auto max-w-5xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  {[project.industry, project.category]
                    .filter(Boolean)
                    .join(" · ")}
                </span>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  {project.status === "published"
                    ? "Publikált tartalom előnézete"
                    : "Piszkozat"}
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
                <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">
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
              <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">
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

function MetaItem({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
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

function getPortfolioUrl(path: string) {
  return supabase.storage.from("portfolio").getPublicUrl(path).data.publicUrl;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
