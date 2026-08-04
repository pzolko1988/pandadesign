import { DEFAULT_SITE_SETTINGS, getSiteAssetUrl } from "@/lib/site-settings";
import { supabase } from "@/lib/supabase/client";

export type PublicBusinessData = {
  site_name: string;
  legal_name: string;
  tagline: string;
  email: string;
  phone: string;
  address_line: string;
  postal_code: string;
  city: string;
  country: string;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  base_url: string;
  default_meta_title: string;
  default_meta_description: string;
  logo_path: string | null;
  favicon_path: string | null;
  og_image_path: string | null;
  show_contact_details: boolean;
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
};

type PublicBusinessSettings = Omit<
  PublicBusinessData,
  "logoUrl" | "faviconUrl" | "ogImageUrl"
>;

const FALLBACK_BUSINESS_SETTINGS: PublicBusinessSettings = {
  site_name: DEFAULT_SITE_SETTINGS.site_name,
  legal_name: DEFAULT_SITE_SETTINGS.legal_name,
  tagline: DEFAULT_SITE_SETTINGS.tagline,
  email: DEFAULT_SITE_SETTINGS.email,
  phone: DEFAULT_SITE_SETTINGS.phone,
  address_line: DEFAULT_SITE_SETTINGS.address_line,
  postal_code: DEFAULT_SITE_SETTINGS.postal_code,
  city: DEFAULT_SITE_SETTINGS.city,
  country: DEFAULT_SITE_SETTINGS.country,
  facebook_url: DEFAULT_SITE_SETTINGS.facebook_url,
  instagram_url: DEFAULT_SITE_SETTINGS.instagram_url,
  linkedin_url: DEFAULT_SITE_SETTINGS.linkedin_url,
  base_url: DEFAULT_SITE_SETTINGS.base_url,
  default_meta_title: DEFAULT_SITE_SETTINGS.default_meta_title,
  default_meta_description: DEFAULT_SITE_SETTINGS.default_meta_description,
  logo_path: DEFAULT_SITE_SETTINGS.logo_path,
  favicon_path: DEFAULT_SITE_SETTINGS.favicon_path,
  og_image_path: DEFAULT_SITE_SETTINGS.og_image_path,
  show_contact_details: DEFAULT_SITE_SETTINGS.show_contact_details,
};

export async function fetchPublicBusinessData(): Promise<PublicBusinessData> {
  const { data, error } = await supabase
    .from("site_settings")
    .select(
      "site_name, legal_name, tagline, email, phone, address_line, postal_code, city, country, facebook_url, instagram_url, linkedin_url, base_url, default_meta_title, default_meta_description, logo_path, favicon_path, og_image_path, show_contact_details",
    )
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const business = data
    ? normalizeBusinessSettings(data as Record<string, unknown>)
    : { ...FALLBACK_BUSINESS_SETTINGS };

  return {
    ...business,
    logoUrl: getSiteAssetUrl(business.logo_path),
    faviconUrl: getSiteAssetUrl(business.favicon_path),
    ogImageUrl: getSiteAssetUrl(business.og_image_path),
  };
}

function normalizeBusinessSettings(
  business: Record<string, unknown>,
): PublicBusinessSettings {
  return {
    site_name: normalizeText(business.site_name),
    legal_name: normalizeText(business.legal_name),
    tagline: normalizeText(business.tagline),
    email: normalizeText(business.email),
    phone: normalizeText(business.phone),
    address_line: normalizeText(business.address_line),
    postal_code: normalizeText(business.postal_code),
    city: normalizeText(business.city),
    country: normalizeText(business.country),
    facebook_url: normalizeText(business.facebook_url),
    instagram_url: normalizeText(business.instagram_url),
    linkedin_url: normalizeText(business.linkedin_url),
    base_url: normalizeText(business.base_url),
    default_meta_title: normalizeText(business.default_meta_title),
    default_meta_description: normalizeText(business.default_meta_description),
    logo_path: normalizeNullableText(business.logo_path),
    favicon_path: normalizeNullableText(business.favicon_path),
    og_image_path: normalizeNullableText(business.og_image_path),
    show_contact_details: business.show_contact_details === true,
  };
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeNullableText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue || null;
}
