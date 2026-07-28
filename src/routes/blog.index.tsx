import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Clock3, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      {
        title: "Blog — PandaDesign",
      },
      {
        name: "description",
        content:
          "Weboldalkészítési, online marketing- és digitális üzleti útmutatók a PandaDesign blogján.",
      },
    ],
  }),
  component: BlogIndexPage,
});

type PublicBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_path: string | null;
  author_name: string;
  published_at: string;
  content_html: string;
};

function BlogIndexPage() {
  const [posts, setPosts] = useState<PublicBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(
          "id, title, slug, excerpt, featured_image_path, author_name, published_at, content_html",
        )
        .eq("status", "published")
        .lte("published_at", new Date().toISOString())
        .order("published_at", {
          ascending: false,
        });

      if (!active) {
        return;
      }

      if (error) {
        setErrorMessage("A blogbejegyzések átmenetileg nem tölthetők be.");
        setLoading(false);
        return;
      }

      setPosts((data ?? []) as PublicBlogPost[]);
      setLoading(false);
    }

    void loadPosts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main>
      <section className="relative overflow-hidden border-b bg-secondary/35 py-16 md:py-24">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(900px_450px_at_90%_0%,color-mix(in_oklab,var(--brand)_10%,transparent),transparent)]"
        />

        <div className="container-page relative">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            Tudástár
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-ink md:text-5xl lg:text-6xl">
            PandaDesign blog
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
            Gyakorlati útmutatók weboldalakról, online jelenlétről,
            teljesítményről és digitális üzleti megoldásokról.
          </p>
        </div>
      </section>

      <section className="container-page py-14 md:py-20">
        {loading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[420px] animate-pulse rounded-2xl border bg-secondary/40"
              />
            ))}
          </div>
        )}

        {!loading && errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && posts.length === 0 && (
          <div className="rounded-2xl border bg-white p-12 text-center shadow-soft">
            <FileText className="mx-auto h-12 w-12 text-ink-soft/30" />

            <h2 className="mt-5 text-xl font-bold text-ink">
              Hamarosan érkeznek az első cikkek
            </h2>

            <p className="mt-2 text-ink-soft">
              Jelenleg nincs publikált blogbejegyzés.
            </p>
          </div>
        )}

        {!loading && !errorMessage && posts.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const imageUrl = post.featured_image_path
                ? supabase.storage
                    .from("blog-media")
                    .getPublicUrl(post.featured_image_path).data.publicUrl
                : "";

              return (
                <Card
                  key={post.id}
                  className="group flex h-full flex-col overflow-hidden border shadow-soft transition hover:-translate-y-1 hover:shadow-elegant"
                >
                  <div className="aspect-[16/9] overflow-hidden border-b bg-gradient-to-br from-brand/10 to-success/10">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="grid h-full place-items-center">
                        <FileText className="h-12 w-12 text-brand/25" />
                      </div>
                    )}
                  </div>

                  <CardContent className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-soft">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(post.published_at)}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" />
                        {readingTime(post.content_html)} perc
                      </span>
                    </div>

                    <h2 className="mt-4 text-xl font-bold leading-tight text-ink">
                      {post.title}
                    </h2>

                    <p className="mt-3 flex-1 text-sm leading-6 text-ink-soft">
                      {post.excerpt}
                    </p>

                    <Link
                      to="/blog/$slug"
                      params={{
                        slug: post.slug,
                      }}
                      className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand transition-all group-hover:gap-2"
                    >
                      Tovább olvasom
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

function readingTime(html: string) {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = text ? text.split(" ").length : 0;

  return Math.max(1, Math.ceil(words / 220));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}
