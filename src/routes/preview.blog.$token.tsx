import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Clock3,
  Eye,
  UserRound,
} from "lucide-react";
import { RichTextContent } from "@/components/site/RichTextContent";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute(
  "/preview/blog/$token",
)({
  component: BlogPreviewPage,
});

type BlogPreview = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  featured_image_path: string | null;
  author_name: string;
  status: "draft" | "published";
  published_at: string | null;
  seo_title: string;
  seo_description: string;
  preview_expires_at: string;
};

function BlogPreviewPage() {
  const { token } = Route.useParams();

  const [post, setPost] =
    useState<BlogPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let active = true;

    async function loadPreview() {
      const { data, error } = await supabase.rpc(
        "get_blog_post_preview",
        {
          p_token: token,
        },
      );

      if (!active) {
        return;
      }

      if (error) {
        setErrorMessage(
          "Az előnézet nem tölthető be.",
        );
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage(
          "Az előnézeti link érvénytelen vagy lejárt.",
        );
        setLoading(false);
        return;
      }

      setPost(data as BlogPreview);
      setLoading(false);
    }

    void loadPreview();

    return () => {
      active = false;
    };
  }, [token]);

  const imageUrl = useMemo(
    () =>
      post?.featured_image_path
        ? supabase.storage
            .from("blog-media")
            .getPublicUrl(
              post.featured_image_path,
            ).data.publicUrl
        : "",
    [post?.featured_image_path],
  );

  if (loading) {
    return (
      <main className="container-page py-20">
        <div className="mx-auto max-w-4xl animate-pulse space-y-6">
          <div className="h-12 rounded bg-muted" />
          <div className="h-6 w-2/3 rounded bg-muted" />
          <div className="aspect-video rounded-3xl bg-muted" />
        </div>
      </main>
    );
  }

  if (errorMessage || !post) {
    return (
      <main className="container-page py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-10 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-700" />

          <h1 className="mt-4 text-2xl font-bold text-amber-900">
            Az előnézet nem érhető el
          </h1>

          <p className="mt-3 text-amber-800">
            {errorMessage}
          </p>

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

  return (
    <main>
      <div className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50/95 px-4 py-3 backdrop-blur">
        <div className="container-page flex flex-col gap-2 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2 font-semibold">
            <Eye className="h-4 w-4" />
            Titkos piszkozat-előnézet
          </span>

          <span>
            Lejár:{" "}
            {formatDate(
              post.preview_expires_at,
            )}
          </span>
        </div>
      </div>

      <article>
        <header className="border-b bg-secondary/30 py-14 md:py-20">
          <div className="container-page">
            <div className="mx-auto max-w-4xl">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                {post.status === "published"
                  ? "Publikált tartalom előnézete"
                  : "Piszkozat"}
              </span>

              <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink md:text-5xl lg:text-6xl">
                {post.title}
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-soft">
                {post.excerpt}
              </p>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-soft">
                <span className="inline-flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  {post.author_name}
                </span>

                {post.published_at && (
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(
                      post.published_at,
                    )}
                  </span>
                )}

                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {readingTime(
                    post.content_html,
                  )}{" "}
                  perc olvasás
                </span>
              </div>
            </div>
          </div>
        </header>

        {imageUrl && (
          <div className="container-page pt-10">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border shadow-elegant">
              <img
                src={imageUrl}
                alt={post.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="container-page py-12 md:py-16">
          <RichTextContent
            html={post.content_html}
            className="mx-auto max-w-3xl"
          />
        </div>
      </article>
    </main>
  );
}

function readingTime(html: string) {
  const words = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 220));
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
