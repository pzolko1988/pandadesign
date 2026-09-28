import { supabase } from "@/lib/supabase/client";

export type PublicProject = {
  id: string;
  slug: string;
  title: string;
  industry: string;
  category: string;
  description: string;
  image_path: string | null;
  mobile_image_path: string | null;
  project_url: string;
  is_concept: boolean;
  client_name: string;
  location: string;
  completed_year: string;
  duration_label: string;
  challenge: string;
  solution: string;
  results: string[];
  features: string[];
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
    .select("*")
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

  const project = normalizePublicProject(data as Record<string, unknown>);

  return isPublishableProject(project) ? project : null;
}

// Valódi referencia akkor is publikálható, ha a képernyőkép még nincs
// feltöltve, de csak akkor, ha élő URL és érdemi esettanulmány-adat is tartozik
// hozzá. Így nem kell generált vagy félrevezető mockupot képként használni.
export function isPublishableProject(project: PublicProject) {
  if (
    project.image_path &&
    BLOCKED_PROJECT_IMAGE_PATHS.includes(project.image_path)
  ) {
    return false;
  }

  const hasRealVisual = Boolean(project.image_path || project.mobile_image_path);
  const hasVerifiedCaseStudy =
    !project.is_concept &&
    /^https?:\/\//.test(project.project_url) &&
    project.challenge.trim().length >= 20 &&
    project.solution.trim().length >= 20;

  return hasRealVisual || hasVerifiedCaseStudy;
}

// A "Fogorvosi rendelő" referenciához feltöltött kép valójában egy generált
// PandaDesign-oldal makett, kitalált statisztikákkal, referenciákkal és
// elérhetőségekkel – nem jelenhet meg. A 20260928120000 migráció a projektet
// is elrejti; ez a lista addig is véd. Valódi képernyőkép feltöltése után
// az útvonal automatikusan megváltozik, így a szűrés nem akadályozza.
const CAPTURED_REFERENCE_SLUGS = new Set([
  "klimaflow",
  "berbeadva",
  "tetojavitas-mesterfokon",
]);

export function getCapturedReferenceImageUrl(
  slug: string,
  viewport: "desktop" | "mobile",
) {
  return CAPTURED_REFERENCE_SLUGS.has(slug)
    ? `/references/${slug}-${viewport}.webp`
    : "";
}

const BLOCKED_PROJECT_IMAGE_PATHS = [
  "f1c91ab0-0f89-4f76-8a7b-975e37edc0a7.png",
];

export async function fetchPublishedProjects(
  limit?: number,
): Promise<PublicProject[]> {
  let query = supabase
    .from("projects")
    .select("*")
    .eq("is_visible", true)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (limit) {
    // A minőségi szűrés miatt több sort kérünk le, mint amennyit megjelenítünk.
    query = query.limit(limit * 3);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const projects = (data ?? [])
    .map((item) => normalizePublicProject(item as Record<string, unknown>))
    .filter(isPublishableProject);

  return limit ? projects.slice(0, limit) : projects;
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
    mobile_image_path: normalizeNullableText(project.mobile_image_path),
    project_url: normalizeText(project.project_url),
    is_concept: project.is_concept === true,
    client_name: normalizeText(project.client_name),
    location: normalizeText(project.location),
    completed_year: normalizeText(project.completed_year),
    duration_label: normalizeText(project.duration_label),
    challenge: normalizeText(project.challenge),
    solution: normalizeText(project.solution),
    results: normalizeTextList(project.results),
    features: normalizeTextList(project.features),
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
