import { supabase } from "@/lib/supabase/client";

export type PublicService = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon_key: string;
  link_url: string;
  sort_order: number;
  is_visible: boolean;
};

export async function fetchVisibleServices(): Promise<PublicService[]> {
  const { data, error } = await supabase
    .from("services")
    .select(
      "id, slug, title, description, icon_key, link_url, sort_order, is_visible",
    )
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((service) => normalizeService(service as Record<string, unknown>))
    .filter((service) => service.id && service.is_visible)
    .sort((left, right) => left.sort_order - right.sort_order);
}

function normalizeService(service: Record<string, unknown>): PublicService {
  return {
    id: normalizeText(service.id),
    slug: normalizeText(service.slug),
    title: normalizeText(service.title),
    description: normalizeText(service.description),
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
