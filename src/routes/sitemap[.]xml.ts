import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import {
  fetchPublishedBlogPostsForSitemap,
  fetchPublishedLegalPagesForSitemap,
  fetchPublishedProjectsForSitemap,
} from "@/lib/public-sitemap";
import { absoluteUrl } from "@/lib/seo";

const STATIC_PATHS = [
  "/",
  "/szolgaltatasok",
  "/arak",
  "/referenciak",
  "/blog",
  "/rolunk",
  "/kapcsolat",
] as const;

type SitemapEntry = {
  loc: string;
  lastmod?: string;
};

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [blogPosts, projects, legalPages] = await Promise.all([
          fetchPublishedBlogPostsForSitemap(),
          fetchPublishedProjectsForSitemap(),
          fetchPublishedLegalPagesForSitemap(),
        ]);

        const entries: SitemapEntry[] = [
          ...STATIC_PATHS.map((path) => ({
            loc: absoluteUrl(path),
          })),
          ...blogPosts.map((post) => ({
            loc: absoluteUrl(`/blog/${post.slug}`),
            lastmod: toIsoDate(post.updated_at) ?? toIsoDate(post.published_at),
          })),
          ...projects.map((project) => ({
            loc: absoluteUrl(`/referenciak/${project.slug}`),
            lastmod: toIsoDate(project.updated_at),
          })),
          ...legalPages.map((page) => ({
            loc: absoluteUrl(`/${page.slug}`),
            lastmod: toIsoDate(page.updated_at),
          })),
        ];

        const urls = entries.map((entry) =>
          [
            `  <url>`,
            `    <loc>${escapeXml(entry.loc)}</loc>`,
            entry.lastmod
              ? `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`
              : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control":
              "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});

function toIsoDate(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    };

    return entities[character] ?? character;
  });
}
