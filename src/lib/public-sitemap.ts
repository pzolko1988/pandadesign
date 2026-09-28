import { supabase } from "@/lib/supabase/client";
import { LEGAL_PAGE_SLUGS } from "@/lib/legal-pages";
import { isPublishableProject } from "@/lib/public-project";

export type SitemapBlogPost = {
  slug: string;
  published_at: string;
  updated_at: string | null;
};

export type SitemapProject = {
  slug: string;
  updated_at: string | null;
};

export type SitemapLegalPage = {
  slug: string;
  updated_at: string | null;
};

export async function fetchPublishedBlogPostsForSitemap(): Promise<
  SitemapBlogPost[]
> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, published_at, updated_at")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString());

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((post) => ({
      slug: normalizeText(post.slug),
      published_at: normalizeText(post.published_at),
      updated_at: normalizeNullableText(post.updated_at),
    }))
    .filter((post) => post.slug);
}

export async function fetchPublishedProjectsForSitemap(): Promise<
  SitemapProject[]
> {
  // A "*" a mobil képernyőkép oszlop bevezetése előtt és után is működik;
  // csak a nyilvánosan is megjelenő (képpel rendelkező) referenciák kerülnek be.
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .eq("is_visible", true);

  if (error) {
    throw error;
  }

  return ((data ?? []) as Record<string, unknown>[])
    .filter((project) =>
      isPublishableProject({
        image_path:
          typeof project.image_path === "string" ? project.image_path : null,
        mobile_image_path:
          typeof project.mobile_image_path === "string"
            ? project.mobile_image_path
            : null,
      }),
    )
    .map((project) => ({
      slug: normalizeText(project.slug),
      updated_at: normalizeNullableText(project.updated_at),
    }))
    .filter((project) => project.slug);
}

export async function fetchPublishedLegalPagesForSitemap(): Promise<
  SitemapLegalPage[]
> {
  const { data, error } = await supabase
    .from("legal_pages")
    .select("slug, updated_at")
    .eq("status", "published")
    .in("slug", LEGAL_PAGE_SLUGS);

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((page) => ({
      slug: normalizeText(page.slug),
      updated_at: normalizeNullableText(page.updated_at),
    }))
    .filter((page) => page.slug);
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeNullableText(value: unknown) {
  return typeof value === "string" && value ? value : null;
}
