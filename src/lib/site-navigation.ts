import { supabase } from "./supabase/client";

export type NavigationPlacement = "header" | "footer" | "both";

export type NavigationItem = {
  id: string;
  label: string;
  url: string;
  placement: NavigationPlacement;
  group_label: string;
  sort_order: number;
  is_visible: boolean;
  open_in_new_tab: boolean;
};

export type SiteChromeSettings = {
  id: number;
  announcement_text: string;
  announcement_url: string;
  announcement_visible: boolean;
  header_cta_text: string;
  header_cta_url: string;
  header_cta_visible: boolean;
  header_sticky: boolean;
  footer_show_navigation: boolean;
  footer_show_contact: boolean;
  footer_show_social: boolean;
  footer_show_back_to_top: boolean;
};

export const DEFAULT_SITE_CHROME_SETTINGS: SiteChromeSettings = {
  id: 1,
  announcement_text: "",
  announcement_url: "",
  announcement_visible: false,
  header_cta_text: "Ajánlatot kérek",
  header_cta_url: "/kapcsolat",
  header_cta_visible: true,
  header_sticky: true,
  footer_show_navigation: true,
  footer_show_contact: true,
  footer_show_social: true,
  footer_show_back_to_top: true,
};

export const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "fallback-home",
    label: "Főoldal",
    url: "/",
    placement: "both",
    group_label: "Navigáció",
    sort_order: 10,
    is_visible: true,
    open_in_new_tab: false,
  },
  {
    id: "fallback-services",
    label: "Szolgáltatások",
    url: "/szolgaltatasok",
    placement: "both",
    group_label: "Navigáció",
    sort_order: 20,
    is_visible: true,
    open_in_new_tab: false,
  },
  {
    id: "fallback-pricing",
    label: "Árak",
    url: "/arak",
    placement: "both",
    group_label: "Navigáció",
    sort_order: 30,
    is_visible: true,
    open_in_new_tab: false,
  },
  {
    id: "fallback-projects",
    label: "Referenciák",
    url: "/referenciak",
    placement: "both",
    group_label: "Navigáció",
    sort_order: 40,
    is_visible: true,
    open_in_new_tab: false,
  },
  {
    id: "fallback-blog",
    label: "Blog",
    url: "/blog",
    placement: "both",
    group_label: "Navigáció",
    sort_order: 50,
    is_visible: true,
    open_in_new_tab: false,
  },
  {
    id: "fallback-about",
    label: "Rólunk",
    url: "/rolunk",
    placement: "both",
    group_label: "Navigáció",
    sort_order: 60,
    is_visible: true,
    open_in_new_tab: false,
  },
  {
    id: "fallback-contact",
    label: "Kapcsolat",
    url: "/kapcsolat",
    placement: "both",
    group_label: "Navigáció",
    sort_order: 70,
    is_visible: true,
    open_in_new_tab: false,
  },
  {
    id: "fallback-privacy",
    label: "Adatkezelés",
    url: "/adatkezeles",
    placement: "footer",
    group_label: "Jogi információk",
    sort_order: 110,
    is_visible: true,
    open_in_new_tab: false,
  },
  {
    id: "fallback-terms",
    label: "Általános Szerződési Feltételek",
    url: "/aszf",
    placement: "footer",
    group_label: "Jogi információk",
    sort_order: 120,
    is_visible: true,
    open_in_new_tab: false,
  },
  {
    id: "fallback-imprint",
    label: "Impresszum",
    url: "/impresszum",
    placement: "footer",
    group_label: "Jogi információk",
    sort_order: 130,
    is_visible: true,
    open_in_new_tab: false,
  },
  {
    id: "fallback-cookie",
    label: "Cookie-tájékoztató",
    url: "/cookie-tajekoztato",
    placement: "footer",
    group_label: "Jogi információk",
    sort_order: 140,
    is_visible: true,
    open_in_new_tab: false,
  },
];

export async function loadSiteChrome() {
  const [
    { data: settingsData, error: settingsError },
    { data: navigationData, error: navigationError },
  ] = await Promise.all([
    supabase
      .from("site_chrome_settings")
      .select(
        "id, announcement_text, announcement_url, announcement_visible, header_cta_text, header_cta_url, header_cta_visible, header_sticky, footer_show_navigation, footer_show_contact, footer_show_social, footer_show_back_to_top",
      )
      .eq("id", 1)
      .maybeSingle(),
    supabase
      .from("site_navigation_items")
      .select(
        "id, label, url, placement, group_label, sort_order, is_visible, open_in_new_tab",
      )
      .eq("is_visible", true)
      .order("sort_order", {
        ascending: true,
      }),
  ]);

  if (settingsError) {
    throw settingsError;
  }

  if (navigationError) {
    throw navigationError;
  }

  return {
    settings: {
      ...DEFAULT_SITE_CHROME_SETTINGS,
      ...(settingsData as Partial<SiteChromeSettings> | null),
    },
    navigationItems:
      navigationData && navigationData.length > 0
        ? (navigationData as NavigationItem[])
        : DEFAULT_NAVIGATION_ITEMS,
  };
}

export function isExternalUrl(url: string) {
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:")
  );
}

export function isActiveNavigationUrl(currentPath: string, url: string) {
  if (isExternalUrl(url)) {
    return false;
  }

  if (url === "/") {
    return currentPath === "/";
  }

  return currentPath === url || currentPath.startsWith(`${url}/`);
}
