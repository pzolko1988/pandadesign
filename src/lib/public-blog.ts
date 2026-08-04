import { supabase } from "@/lib/supabase/client";

export type PublicBlogPost = {
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

export async function fetchPublishedBlogPost(
  slug: string,
): Promise<PublicBlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, content_html, featured_image_path, author_name, published_at, seo_title, seo_description",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as PublicBlogPost | null;
}

export function getPublicBlogImageUrl(imagePath: string | null) {
  return imagePath
    ? supabase.storage.from("blog-media").getPublicUrl(imagePath).data.publicUrl
    : "";
}
