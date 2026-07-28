import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_SITE_SETTINGS,
  getSiteAssetUrl,
  loadSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";
import {
  DEFAULT_NAVIGATION_ITEMS,
  DEFAULT_SITE_CHROME_SETTINGS,
  isActiveNavigationUrl,
  isExternalUrl,
  loadSiteChrome,
  type NavigationItem,
  type SiteChromeSettings,
} from "@/lib/site-navigation";

export function Header() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(
    DEFAULT_SITE_SETTINGS,
  );

  const [chromeSettings, setChromeSettings] = useState<SiteChromeSettings>(
    DEFAULT_SITE_CHROME_SETTINGS,
  );

  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(
    DEFAULT_NAVIGATION_ITEMS,
  );

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadHeaderContent() {
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
          "A fejléc márkaadatai nem tölthetők be:",
          siteResult.reason,
        );
      }

      if (chromeResult.status === "fulfilled") {
        setChromeSettings(chromeResult.value.settings);
        setNavigationItems(chromeResult.value.navigationItems);
      } else {
        console.error(
          "A fejléc navigációja nem tölthető be:",
          chromeResult.reason,
        );
      }
    }

    void loadHeaderContent();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const headerItems = useMemo(
    () =>
      navigationItems.filter(
        (item) => item.placement === "header" || item.placement === "both",
      ),
    [navigationItems],
  );

  const logoUrl = getSiteAssetUrl(siteSettings.logo_path);

  const announcementContent = chromeSettings.announcement_text.trim();

  return (
    <>
      {chromeSettings.announcement_visible && announcementContent && (
        <div className="border-b border-brand/15 bg-brand px-4 py-2 text-center text-xs font-medium text-brand-foreground sm:text-sm">
          {chromeSettings.announcement_url ? (
            <a
              href={chromeSettings.announcement_url}
              target={
                isExternalUrl(chromeSettings.announcement_url)
                  ? "_blank"
                  : undefined
              }
              rel={
                isExternalUrl(chromeSettings.announcement_url)
                  ? "noopener noreferrer"
                  : undefined
              }
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              {announcementContent}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          ) : (
            announcementContent
          )}
        </div>
      )}

      <header
        className={`z-40 border-b bg-background/95 backdrop-blur ${
          chromeSettings.header_sticky ? "sticky top-0" : "relative"
        }`}
      >
        <div className="container-page flex min-h-[72px] items-center justify-between gap-5">
          <Link
            to="/"
            aria-label={`${siteSettings.site_name} főoldal`}
            className="flex min-w-0 items-center gap-3"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteSettings.site_name}
                className="h-10 max-w-[190px] object-contain object-left"
              />
            ) : (
              <>
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-lg font-black text-brand-foreground shadow-soft"
                >
                  P
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-lg font-bold tracking-tight text-ink">
                    {siteSettings.site_name}
                  </span>

                  {siteSettings.tagline && (
                    <span className="hidden max-w-[240px] truncate text-[11px] text-ink-soft sm:block">
                      {siteSettings.tagline}
                    </span>
                  )}
                </span>
              </>
            )}
          </Link>

          <nav
            aria-label="Fő navigáció"
            className="hidden items-center gap-1 lg:flex"
          >
            {headerItems.map((item) => {
              const active = isActiveNavigationUrl(pathname, item.url);

              return (
                <a
                  key={item.id}
                  href={item.url}
                  target={item.open_in_new_tab ? "_blank" : undefined}
                  rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-brand/10 text-brand"
                      : "text-ink-soft hover:bg-secondary hover:text-ink"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {chromeSettings.header_cta_visible &&
              chromeSettings.header_cta_text &&
              chromeSettings.header_cta_url && (
                <Button asChild variant="cta" className="hidden sm:inline-flex">
                  <a href={chromeSettings.header_cta_url}>
                    {chromeSettings.header_cta_text}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              )}

            <button
              type="button"
              aria-label={
                mobileOpen ? "Mobilmenü bezárása" : "Mobilmenü megnyitása"
              }
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((current) => !current)}
              className="grid h-11 w-11 place-items-center rounded-xl border bg-background text-ink transition hover:bg-secondary lg:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t bg-background lg:hidden">
            <nav
              aria-label="Mobil navigáció"
              className="container-page max-h-[calc(100vh-73px)] overflow-y-auto py-5"
            >
              <div className="space-y-1">
                {headerItems.map((item) => {
                  const active = isActiveNavigationUrl(pathname, item.url);

                  return (
                    <a
                      key={item.id}
                      href={item.url}
                      target={item.open_in_new_tab ? "_blank" : undefined}
                      rel={
                        item.open_in_new_tab ? "noopener noreferrer" : undefined
                      }
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition ${
                        active
                          ? "bg-brand/10 text-brand"
                          : "text-ink hover:bg-secondary"
                      }`}
                    >
                      {item.label}

                      <ArrowRight className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>

              {chromeSettings.header_cta_visible &&
                chromeSettings.header_cta_text &&
                chromeSettings.header_cta_url && (
                  <Button
                    asChild
                    size="lg"
                    variant="cta"
                    className="mt-5 w-full"
                  >
                    <a href={chromeSettings.header_cta_url}>
                      {chromeSettings.header_cta_text}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
