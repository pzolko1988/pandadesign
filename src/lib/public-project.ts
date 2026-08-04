import { supabase } from "@/lib/supabase/client";

export type PublicProject = {
  id: string;
  slug: string;
  title: string;
  industry: string;
  category: string;
  description: string;
  image_path: string | null;
  project_url: string;
  is_concept: boolean;
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
};

export async function fetchPublishedProject(
  slug: string,
): Promise<PublicProject | null> {
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, slug, title, industry, category, description, image_path, project_url, is_concept, client_name, location, completed_year, duration_label, challenge, solution, results, services, technologies, content_html, gallery_paths, seo_title, seo_description, cta_title, cta_text, cta_button_text",
    )
    .eq("slug", slug)
    .eq("is_visible", true)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return normalizePublicProject(data as Record<string, unknown>);
}

export function getPortfolioImageUrl(path: string) {
  return supabase.storage.from("portfolio").getPublicUrl(path).data.publicUrl;
}

function normalizePublicProject(
  project: Record<string, unknown>,
): PublicProject {
  return {
    id: normalizeText(project.id),
    slug: normalizeText(project.slug),
    title: normalizeText(project.title),
    industry: normalizeText(project.industry),
    category: normalizeText(project.category),
    description: normalizeText(project.description),
    image_path: normalizeNullableText(project.image_path),
    project_url: normalizeText(project.project_url),
    is_concept: project.is_concept === true,
    client_name: normalizeText(project.client_name),
    location: normalizeText(project.location),
    completed_year: normalizeText(project.completed_year),
    duration_label: normalizeText(project.duration_label),
    challenge: normalizeText(project.challenge),
    solution: normalizeText(project.solution),
    results: normalizeTextList(project.results),
    services: normalizeTextList(project.services),
    technologies: normalizeTextList(project.technologies),
    content_html: normalizeText(project.content_html),
    gallery_paths: normalizeTextList(project.gallery_paths),
    seo_title: normalizeText(project.seo_title),
    seo_description: normalizeText(project.seo_description),
    cta_title: normalizeText(project.cta_title),
    cta_text: normalizeText(project.cta_text),
    cta_button_text: normalizeText(project.cta_button_text),
  };
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeNullableText(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function normalizeTextList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
