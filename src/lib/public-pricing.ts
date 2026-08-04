import { supabase } from "@/lib/supabase/client";

export type PublicPricingPackage = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_label: string;
  currency: string;
  price_suffix: string;
  badge_text: string;
  cta_text: string;
  cta_url: string;
  features: string[];
  sort_order: number;
  is_featured: boolean;
  is_visible: boolean;
};

export async function fetchVisiblePricingPackages(): Promise<
  PublicPricingPackage[]
> {
  const { data, error } = await supabase
    .from("pricing_packages")
    .select(
      "id, slug, name, description, price_label, currency, price_suffix, badge_text, cta_text, cta_url, features, sort_order, is_featured, is_visible",
    )
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((item) => normalizePricingPackage(item as Record<string, unknown>))
    .filter((item) => item.is_visible)
    .sort((left, right) => left.sort_order - right.sort_order);
}

function normalizePricingPackage(
  item: Record<string, unknown>,
): PublicPricingPackage {
  return {
    id: normalizeText(item.id),
    slug: normalizeText(item.slug),
    name: normalizeText(item.name),
    description: normalizeText(item.description),
    price_label: normalizeText(item.price_label),
    currency: normalizeText(item.currency),
    price_suffix: normalizeText(item.price_suffix),
    badge_text: normalizeText(item.badge_text),
    cta_text: normalizeText(item.cta_text),
    cta_url: normalizeText(item.cta_url),
    features: normalizeTextList(item.features),
    sort_order:
      typeof item.sort_order === "number" && Number.isFinite(item.sort_order)
        ? item.sort_order
        : 0,
    is_featured: item.is_featured === true,
    is_visible: item.is_visible === true,
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
