import { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings";
import { supabase } from "@/lib/supabase/client";
import {
  AUDIT_PATH,
  DEFAULT_HERO_VISUAL,
  DEFAULT_PRICING_PACKAGES,
  type HeroVisualContent,
} from "@/lib/marketing-content";
import {
  fetchVisiblePricingPackages,
  type PublicPricingPackage,
} from "@/lib/public-pricing";
import {
  DEFAULT_SERVICES,
  fetchVisibleServices,
  type PublicService,
} from "@/lib/public-services";

export type HeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  visual: HeroVisualContent;
};

// A hero tartalma az adminból szerkeszthető (page_sections.content).
// A 2-es tartalomverziót a 20260928120000 migráció állítja be; a régebbi,
// pozicionálás előtti hero-szöveg helyett addig ez a tartalék jelenik meg.
export const HERO_CONTENT_VERSION = 2;

export const DEFAULT_HERO: HeroContent = {
  eyebrow: "Weboldal készítés vállalkozásoknak",
  title: "Ügyfélszerző weboldalak magyar vállalkozásoknak",
  description:
    "Nem csak szép weboldalt kapsz. Olyan gyors, mérhető és továbbfejleszthető online rendszert építünk, amely érdeklődőket szerez és támogatja a vállalkozásod növekedését.",
  primaryButtonText: "Ingyenes weboldal-audit",
  primaryButtonUrl: AUDIT_PATH,
  secondaryButtonText: "Munkáink megtekintése",
  secondaryButtonUrl: "/referenciak",
  visual: DEFAULT_HERO_VISUAL,
};

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
  category: string;
};

export type PublicHomeSeoData = {
  settings: PublicHomeSeoSettings;
  faqs: PublicHomeSeoFaq[];
  ogImageUrl: string;
  hero: HeroContent;
  services: PublicService[];
  pricing: PublicPricingPackage[];
};

const FALLBACK_SETTINGS: PublicHomeSeoSettings = {
  site_name: DEFAULT_SITE_SETTINGS.site_name,
  base_url: DEFAULT_SITE_SETTINGS.base_url,
  default_meta_title: DEFAULT_SITE_SETTINGS.default_meta_title,
  default_meta_description: DEFAULT_SITE_SETTINGS.default_meta_description,
  og_image_path: DEFAULT_SITE_SETTINGS.og_image_path,
};

export async function fetchPublicHomeSeoData(): Promise<PublicHomeSeoData> {
  const [settingsResult, faqResult, heroResult, servicesResult, pricingResult] =
    await Promise.all([
      supabase
        .from("site_settings")
        .select(
          "site_name, base_url, default_meta_title, default_meta_description, og_image_path",
        )
        .eq("id", 1)
        .maybeSingle(),
      supabase
        .from("faq_items")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("page_sections")
        .select("content")
        .eq("page_slug", "home")
        .eq("section_key", "hero")
        .maybeSingle(),
      // A nem kritikus blokkok hibája nem döntheti el a főoldalt.
      fetchVisibleServices().catch((error: unknown) => {
        console.error("A szolgáltatások nem tölthetők be:", error);
        return DEFAULT_SERVICES;
      }),
      fetchVisiblePricingPackages().catch((error: unknown) => {
        console.error("Az árcsomagok nem tölthetők be:", error);
        return DEFAULT_PRICING_PACKAGES;
      }),
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

  return {
    settings,
    faqs,
    ogImageUrl,
    hero: normalizeHero(heroResult.error ? null : heroResult.data?.content),
    services: servicesResult,
    pricing: pricingResult,
  };
}

function normalizeHero(content: unknown): HeroContent {
  if (!content || typeof content !== "object") {
    return DEFAULT_HERO;
  }

  const record = content as Record<string, unknown>;

  if (
    typeof record.version !== "number" ||
    record.version < HERO_CONTENT_VERSION
  ) {
    return DEFAULT_HERO;
  }

  const pick = (key: Exclude<keyof HeroContent, "visual">) =>
    typeof record[key] === "string" && (record[key] as string).trim()
      ? (record[key] as string)
      : DEFAULT_HERO[key];

  return {
    eyebrow: pick("eyebrow"),
    title: pick("title"),
    description: pick("description"),
    primaryButtonText: pick("primaryButtonText"),
    primaryButtonUrl: pick("primaryButtonUrl"),
    secondaryButtonText: pick("secondaryButtonText"),
    secondaryButtonUrl: pick("secondaryButtonUrl"),
    visual: normalizeHeroVisual(record.visual),
  };
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
    category: typeof faq.category === "string" ? faq.category : "general",
  };
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeNullableText(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function normalizeHeroVisual(value: unknown): HeroVisualContent {
  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const pick = (key: Exclude<keyof HeroVisualContent, "keywords">) =>
    typeof record[key] === "string" && (record[key] as string).trim()
      ? (record[key] as string)
      : DEFAULT_HERO_VISUAL[key];

  const keywords = Array.isArray(record.keywords)
    ? record.keywords
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 8)
    : DEFAULT_HERO_VISUAL.keywords;

  return {
    browserDomain: pick("browserDomain"),
    kicker: pick("kicker"),
    headline: pick("headline"),
    copy: pick("copy"),
    cta: pick("cta"),
    crmLabel: pick("crmLabel"),
    crmStatus: pick("crmStatus"),
    crmTitle: pick("crmTitle"),
    crmMeta: pick("crmMeta"),
    analyticsLabel: pick("analyticsLabel"),
    analyticsStatus: pick("analyticsStatus"),
    metricOneLabel: pick("metricOneLabel"),
    metricOneValue: pick("metricOneValue"),
    metricTwoLabel: pick("metricTwoLabel"),
    metricTwoValue: pick("metricTwoValue"),
    metricThreeLabel: pick("metricThreeLabel"),
    metricThreeValue: pick("metricThreeValue"),
    automationLabel: pick("automationLabel"),
    automationNodeOne: pick("automationNodeOne"),
    automationNodeTwo: pick("automationNodeTwo"),
    automationNodeThree: pick("automationNodeThree"),
    phoneButton: pick("phoneButton"),
    keywords: keywords.length > 0 ? keywords : DEFAULT_HERO_VISUAL.keywords,
  };
}
