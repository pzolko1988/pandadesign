import { supabase } from "@/lib/supabase/client";
import {
  DEFAULT_PRICING_PACKAGES,
  type PricingPackage,
} from "@/lib/marketing-content";

export type PublicPricingPackage = PricingPackage;

export async function fetchVisiblePricingPackages(): Promise<
  PublicPricingPackage[]
> {
  // A "*" lekérdezés a bővített séma (audience, outcome, scope_note)
  // bevezetése előtt és után is működik.
  const { data, error } = await supabase
    .from("pricing_packages")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as Record<string, unknown>[];

  // Amíg a 20260928120000_conversion_repositioning.sql migráció nem fut le,
  // az adatbázisban a régi (Basic/Medium) csomagok vannak. Ilyenkor az új,
  // jóváhagyott csomagstruktúrát mutatjuk a kódbeli tartalékból.
  if (rows.length === 0 || !rows.some((row) => "audience" in row)) {
    return DEFAULT_PRICING_PACKAGES;
  }

  return rows
    .map(normalizePricingPackage)
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
    audience: normalizeText(item.audience),
    outcome: normalizeText(item.outcome),
    scope_note: normalizeText(item.scope_note),
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
