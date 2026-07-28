import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Clock3, UserRound } from "lucide-react";
import { RichTextContent } from "@/components/site/RichTextContent";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/blog/$slug")({
  head: () => ({
    meta: [
      {
        title: "Blogbejegyzés — PandaDesign",
      },
    ],
  }),
  component: BlogPostPage,
});

type PublicBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  featured_image_path: string | null;
  author_name: string;
  published_at: string;
  seo_title: string;
  seo_description: string;
};

function BlogPostPage() {
  const { slug } = Route.useParams();

  const [post, setPost] = useState<PublicBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPost() {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(
          "id, title, slug, excerpt, content_html, featured_image_path, author_name, published_at, seo_title, seo_description",
        )
        .eq("slug", slug)
        .eq("status", "published")
        .lte("published_at", new Date().toISOString())
        .maybeSingle();

      if (!active) {
        return;
      }

      if (error) {
        setErrorMessage("A blogbejegyzés átmenetileg nem tölthető be.");
        setLoading(false);
        return;
      }

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const loadedPost = data as PublicBlogPost;

      setPost(loadedPost);
      synchronizeHead(loadedPost);
      setLoading(false);
    }

    void loadPost();

    return () => {
      active = false;
    };
  }, [slug]);

  const imageUrl = useMemo(
    () =>
      post?.featured_image_path
        ? supabase.storage
            .from("blog-media")
            .getPublicUrl(post.featured_image_path).data.publicUrl
        : "",
    [post?.featured_image_path],
  );

  if (loading) {
    return (
      <main className="container-page py-20">
        <div className="mx-auto max-w-4xl animate-pulse space-y-6">
          <div className="h-5 w-32 rounded bg-muted" />
          <div className="h-14 rounded bg-muted" />
          <div className="h-6 w-2/3 rounded bg-muted" />
          <div className="aspect-video rounded-3xl bg-muted" />
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="container-page py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-10 text-center shadow-soft">
          <h1 className="text-3xl font-bold text-ink">
            A bejegyzés nem található
          </h1>

          <p className="mt-3 text-ink-soft">
            Lehet, hogy a cikket visszavonták vagy megváltozott a címe.
          </p>

          <Link
            to="/blog"
            className="mt-7 inline-flex items-center gap-2 font-semibold text-brand hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Vissza a bloghoz
          </Link>
        </div>
      </main>
    );
  }

  if (errorMessage || !post) {
    return (
      <main className="container-page py-20">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {errorMessage || "A blogbejegyzés nem tölthető be."}
        </div>
      </main>
    );
  }

  return (
    <main>
      <article>
        <header className="border-b bg-secondary/30 py-14 md:py-20">
          <div className="container-page">
            <div className="mx-auto max-w-4xl">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Vissza a bloghoz
              </Link>

              <h1 className="mt-7 text-4xl font-bold tracking-tight text-ink md:text-5xl lg:text-6xl">
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

                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(post.published_at)}
                </span>

                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {readingTime(post.content_html)} perc olvasás
                </span>
              </div>
            </div>
          </div>
        </header>

        {imageUrl && (
          <div className="container-page -mt-1 pt-10">
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

function synchronizeHead(post: PublicBlogPost) {
  const title = post.seo_title.trim() || `${post.title} — PandaDesign`;

  const description = post.seo_description.trim() || post.excerpt;

  document.title = title;

  setMeta('meta[name="description"]', "name", "description", description);

  setMeta('meta[property="og:title"]', "property", "og:title", title);

  setMeta(
    'meta[property="og:description"]',
    "property",
    "og:description",
    description,
  );
}

function setMeta(
  selector: string,
  attribute: "name" | "property",
  key: string,
  content: string,
) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.content = content;
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
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}
