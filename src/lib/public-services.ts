import { supabase } from "@/lib/supabase/client";
import { SERVICE_CATEGORIES } from "@/lib/marketing-content";

export type PublicService = {
  id: string;
  slug: string;
  title: string;
  description: string;
  audience: string;
  highlights: string[];
  technology: string;
  icon_key: string;
  link_url: string;
  sort_order: number;
  is_visible: boolean;
};

const ICON_BY_SLUG: Record<string, string> = {
  "ugyfelszerzo-weboldal": "layers",
  "landing-kampanyoldal": "sparkles",
  webshop: "shopping-bag",
  "egyedi-uzleti-rendszer": "code",
};

export const DEFAULT_SERVICES: PublicService[] = SERVICE_CATEGORIES.map(
  (category, index) => ({
    id: `fallback-${category.slug}`,
    slug: category.slug,
    title: category.title,
    description: category.summary,
    audience: category.audience,
    highlights: category.goals,
    technology: category.technology,
    icon_key: ICON_BY_SLUG[category.slug] ?? "layers",
    link_url: category.landingPath,
    sort_order: (index + 1) * 10,
    is_visible: true,
  }),
);

export async function fetchVisibleServices(): Promise<PublicService[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as Record<string, unknown>[];

  // A migráció előtti, technológia-alapú szolgáltatáslista helyett
  // az üzleti problémák szerinti új struktúrát mutatjuk.
  if (rows.length === 0 || !rows.some((row) => "highlights" in row)) {
    return DEFAULT_SERVICES;
  }

  return rows
    .map(normalizeService)
    .filter((service) => service.id && service.is_visible)
    .sort((left, right) => left.sort_order - right.sort_order);
}

function normalizeService(service: Record<string, unknown>): PublicService {
  return {
    id: normalizeText(service.id),
    slug: normalizeText(service.slug),
    title: normalizeText(service.title),
    description: normalizeText(service.description),
    audience: normalizeText(service.audience),
    highlights: normalizeTextList(service.highlights),
    technology: normalizeText(service.technology),
    icon_key: normalizeText(service.icon_key),
    link_url: normalizeText(service.link_url),
    sort_order:
      typeof service.sort_order === "number" &&
      Number.isFinite(service.sort_order)
        ? service.sort_order
        : 0,
    is_visible: service.is_visible === true,
  };
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeTextList(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}
