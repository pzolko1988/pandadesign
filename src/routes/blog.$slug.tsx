import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Clock3, UserRound } from "lucide-react";
import { RichTextContent } from "@/components/site/RichTextContent";
import {
  fetchPublishedBlogPost,
  getPublicBlogImageUrl,
} from "@/lib/public-blog";
import { absoluteUrl, buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await fetchPublishedBlogPost(params.slug);

    if (!post) {
      throw notFound();
    }

    return post;
  },
  head: ({ loaderData: post }) => {
    if (!post) {
      return {};
    }

    const title = post.seo_title.trim() || `${post.title} — PandaDesign`;
    const description = post.seo_description.trim() || post.excerpt;
    const path = `/blog/${post.slug}`;
    const url = absoluteUrl(path);
    const image = getPublicBlogImageUrl(post.featured_image_path);

    return buildSeoHead({
      title,
      description,
      path,
      type: "article",
      image: image || undefined,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description,
        url,
        ...(image ? { image } : {}),
        author: {
          name: post.author_name,
        },
        datePublished: post.published_at,
        inLanguage: "hu-HU",
        publisher: {
          name: "PandaDesign",
        },
      },
    });
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const post = Route.useLoaderData();
  const imageUrl = getPublicBlogImageUrl(post.featured_image_path);

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
