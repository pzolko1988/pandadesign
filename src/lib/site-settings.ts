import { supabase } from "./supabase/client";

export type SiteSettings = {
  id: number;
  site_name: string;
  legal_name: string;
  tagline: string;
  email: string;
  phone: string;
  contact_recipient_email: string;
  address_line: string;
  postal_code: string;
  city: string;
  country: string;
  opening_hours: string;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  base_url: string;
  default_meta_title: string;
  default_meta_description: string;
  logo_path: string | null;
  favicon_path: string | null;
  og_image_path: string | null;
  footer_text: string;
  copyright_text: string;
  show_contact_details: boolean;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 1,
  site_name: "PandaDesign",
  legal_name: "",
  tagline: "Modern weboldalak magyar vállalkozásoknak",
  email: "",
  phone: "",
  contact_recipient_email: "",
  address_line: "",
  postal_code: "",
  city: "",
  country: "Magyarország",
  opening_hours: "",
  facebook_url: "",
  instagram_url: "",
  linkedin_url: "",
  base_url: "https://pandadesign.hu",
  default_meta_title:
    "PandaDesign — Modern weboldalak, amelyek ügyfeleket szereznek",
  default_meta_description:
    "Gyors, mobilbarát és átlátható weboldalakat készítünk magyar vállalkozásoknak – az első ötlettől a hosszú távú üzemeltetésig.",
  logo_path: null,
  favicon_path: null,
  og_image_path: null,
  footer_text:
    "Modern, gyors és könnyen kezelhető weboldalak vállalkozásoknak.",
  copyright_text: "Minden jog fenntartva.",
  show_contact_details: true,
};

export function getSiteAssetUrl(path: string | null | undefined): string {
  if (!path) {
    return "";
  }

  return supabase.storage.from("site-assets").getPublicUrl(path).data.publicUrl;
}

export async function loadSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select(
      "id, site_name, legal_name, tagline, email, phone, contact_recipient_email, address_line, postal_code, city, country, opening_hours, facebook_url, instagram_url, linkedin_url, base_url, default_meta_title, default_meta_description, logo_path, favicon_path, og_image_path, footer_text, copyright_text, show_contact_details",
    )
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    ...DEFAULT_SITE_SETTINGS,
    ...(data as Partial<SiteSettings> | null),
  };
}
