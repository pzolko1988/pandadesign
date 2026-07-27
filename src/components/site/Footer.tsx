import { Link } from "@tanstack/react-router";
import {
  ArrowUp,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_SITE_SETTINGS,
  getSiteAssetUrl,
  loadSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";
import {
  DEFAULT_NAVIGATION_ITEMS,
  DEFAULT_SITE_CHROME_SETTINGS,
  loadSiteChrome,
  type NavigationItem,
  type SiteChromeSettings,
} from "@/lib/site-navigation";

export function Footer() {
  const [siteSettings, setSiteSettings] =
    useState<SiteSettings>(
      DEFAULT_SITE_SETTINGS,
    );

  const [chromeSettings, setChromeSettings] =
    useState<SiteChromeSettings>(
      DEFAULT_SITE_CHROME_SETTINGS,
    );

  const [navigationItems, setNavigationItems] =
    useState<NavigationItem[]>(
      DEFAULT_NAVIGATION_ITEMS,
    );

  useEffect(() => {
    let active = true;

    async function loadFooterContent() {
      const results = await Promise.allSettled([
        loadSiteSettings(),
        loadSiteChrome(),
      ]);

      if (!active) {
        return;
      }

      const siteResult = results[0];
      const chromeResult = results[1];

      if (siteResult.status === "fulfilled") {
        setSiteSettings(siteResult.value);
      } else {
        console.error(
          "A lábléc márkaadatai nem tölthetők be:",
          siteResult.reason,
        );
      }

      if (chromeResult.status === "fulfilled") {
        setChromeSettings(
          chromeResult.value.settings,
        );
        setNavigationItems(
          chromeResult.value.navigationItems,
        );
      } else {
        console.error(
          "A lábléc navigációja nem tölthető be:",
          chromeResult.reason,
        );
      }
    }

    void loadFooterContent();

    return () => {
      active = false;
    };
  }, []);

  const footerGroups = useMemo(() => {
    const footerItems = navigationItems.filter(
      (item) =>
        item.placement === "footer" ||
        item.placement === "both",
    );

    const grouped = new Map<
      string,
      NavigationItem[]
    >();

    footerItems.forEach((item) => {
      const group =
        item.group_label.trim() || "Navigáció";

      const current = grouped.get(group) ?? [];
      current.push(item);
      grouped.set(group, current);
    });

    return Array.from(grouped.entries());
  }, [navigationItems]);

  const logoUrl = getSiteAssetUrl(
    siteSettings.logo_path,
  );

  const address = [
    siteSettings.postal_code,
    siteSettings.city,
    siteSettings.address_line,
    siteSettings.country,
  ]
    .filter(Boolean)
    .join(", ");

  const socialLinks = [
    {
      label: "Facebook",
      url: siteSettings.facebook_url,
      icon: Facebook,
    },
    {
      label: "Instagram",
      url: siteSettings.instagram_url,
      icon: Instagram,
    },
    {
      label: "LinkedIn",
      url: siteSettings.linkedin_url,
      icon: Linkedin,
    },
  ].filter((item) => item.url);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-ink text-white">
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1.7fr]">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-3"
            >
              {logoUrl ? (
                <span className="rounded-xl bg-white p-2">
                  <img
                    src={logoUrl}
                    alt={siteSettings.site_name}
                    className="h-9 max-w-[190px] object-contain"
                  />
                </span>
              ) : (
                <>
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-xl font-black text-brand-foreground">
                    P
                  </span>

                  <span className="text-xl font-bold">
                    {siteSettings.site_name}
                  </span>
                </>
              )}
            </Link>

            <p className="mt-5 max-w-md text-sm leading-6 text-white/65">
              {siteSettings.footer_text ||
                siteSettings.tagline ||
                "Modern, gyors és könnyen kezelhető weboldalak vállalkozásoknak."}
            </p>

            {chromeSettings.footer_show_social &&
              socialLinks.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {socialLinks.map((item) => {
                    const Icon = item.icon;

                    return (
                      <a
                        key={item.label}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 text-white/75 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              )}

            {chromeSettings.footer_show_contact &&
              siteSettings.show_contact_details && (
                <div className="mt-7 space-y-3 text-sm text-white/70">
                  {siteSettings.email && (
                    <a
                      href={`mailto:${siteSettings.email}`}
                      className="flex items-start gap-3 transition hover:text-white"
                    >
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>
                        {siteSettings.email}
                      </span>
                    </a>
                  )}

                  {siteSettings.phone && (
                    <a
                      href={`tel:${siteSettings.phone.replace(/\s/g, "")}`}
                      className="flex items-start gap-3 transition hover:text-white"
                    >
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>
                        {siteSettings.phone}
                      </span>
                    </a>
                  )}

                  {address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>{address}</span>
                    </div>
                  )}
                </div>
              )}
          </div>

          {chromeSettings.footer_show_navigation &&
            footerGroups.length > 0 && (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {footerGroups.map(
                  ([groupLabel, items]) => (
                    <nav
                      key={groupLabel}
                      aria-label={groupLabel}
                    >
                      <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
                        {groupLabel}
                      </h2>

                      <ul className="mt-4 space-y-3">
                        {items.map((item) => (
                          <li key={item.id}>
                            <a
                              href={item.url}
                              target={
                                item.open_in_new_tab
                                  ? "_blank"
                                  : undefined
                              }
                              rel={
                                item.open_in_new_tab
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                              className="text-sm text-white/65 transition hover:text-white"
                            >
                              {item.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  ),
                )}
              </div>
            )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-4 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear}{" "}
            {siteSettings.legal_name ||
              siteSettings.site_name}
            .{" "}
            {siteSettings.copyright_text ||
              "Minden jog fenntartva."}
          </p>

          {chromeSettings.footer_show_back_to_top && (
            <button
              type="button"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="inline-flex items-center gap-2 font-semibold text-white/65 transition hover:text-white"
            >
              Vissza az oldal tetejére
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
