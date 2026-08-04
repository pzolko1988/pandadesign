import { supabase } from "@/lib/supabase/client";
import { LEGAL_PAGE_SLUGS } from "@/lib/legal-pages";

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
  const { data, error } = await supabase
    .from("projects")
    .select("slug, updated_at")
    .eq("status", "published")
    .eq("is_visible", true);

  if (error) {
    throw error;
  }

  return (data ?? [])
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
