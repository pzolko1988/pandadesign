import { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings";
import { supabase } from "@/lib/supabase/client";

export type PublicHomeSeoSettings = {
  site_name: string;
  base_url: string;
  default_meta_title: string;
  default_meta_description: string;
  og_image_path: string | null;
};

export type PublicHomeSeoFaq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
};

export type PublicHomeSeoData = {
  settings: PublicHomeSeoSettings;
  faqs: PublicHomeSeoFaq[];
  ogImageUrl: string;
};

const FALLBACK_SETTINGS: PublicHomeSeoSettings = {
  site_name: DEFAULT_SITE_SETTINGS.site_name,
  base_url: DEFAULT_SITE_SETTINGS.base_url,
  default_meta_title: DEFAULT_SITE_SETTINGS.default_meta_title,
  default_meta_description: DEFAULT_SITE_SETTINGS.default_meta_description,
  og_image_path: DEFAULT_SITE_SETTINGS.og_image_path,
};

export async function fetchPublicHomeSeoData(): Promise<PublicHomeSeoData> {
  const [settingsResult, faqResult] = await Promise.all([
    supabase
      .from("site_settings")
      .select(
        "site_name, base_url, default_meta_title, default_meta_description, og_image_path",
      )
      .eq("id", 1)
      .maybeSingle(),
    supabase
      .from("faq_items")
      .select("id, question, answer, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (settingsResult.error) {
    throw settingsResult.error;
  }

  if (faqResult.error) {
    throw faqResult.error;
  }

  const settings = normalizeSettings(
    settingsResult.data as Record<string, unknown> | null,
  );
  const faqs = (faqResult.data ?? []).map((faq) =>
    normalizeFaq(faq as Record<string, unknown>),
  );
  const ogImageUrl = settings.og_image_path
    ? supabase.storage.from("site-assets").getPublicUrl(settings.og_image_path)
        .data.publicUrl
    : "";

  return { settings, faqs, ogImageUrl };
}

function normalizeSettings(
  settings: Record<string, unknown> | null,
): PublicHomeSeoSettings {
  if (!settings) {
    return { ...FALLBACK_SETTINGS };
  }

  return {
    site_name: normalizeText(settings.site_name),
    base_url: normalizeText(settings.base_url),
    default_meta_title: normalizeText(settings.default_meta_title),
    default_meta_description: normalizeText(settings.default_meta_description),
    og_image_path: normalizeNullableText(settings.og_image_path),
  };
}

function normalizeFaq(faq: Record<string, unknown>): PublicHomeSeoFaq {
  return {
    id: normalizeText(faq.id),
    question: normalizeText(faq.question),
    answer: normalizeText(faq.answer),
    sort_order: typeof faq.sort_order === "number" ? faq.sort_order : 0,
  };
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeNullableText(value: unknown) {
  return typeof value === "string" && value ? value : null;
}
