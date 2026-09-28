import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CookieBanner } from "@/components/site/CookieBanner";
import { initAnalytics } from "@/lib/analytics";
import { AUDIT_PATH } from "@/lib/marketing-content";
import { fetchPublicBusinessData } from "@/lib/public-business";
import { DEFAULT_SITE_URL } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <p className="text-7xl font-bold text-brand">404</p>
        <h1 className="mt-4 text-2xl font-bold text-ink">
          Ez az oldal nem található
        </h1>
        <p className="mt-3 text-ink-soft">
          Lehet, hogy elírás történt a címben, vagy az oldal időközben megszűnt.
          Innen biztosan továbbjutsz:
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand/90"
          >
            Főoldal
          </Link>
          <Link
            to="/szolgaltatasok"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border px-5 py-2 text-sm font-semibold text-ink transition hover:bg-secondary"
          >
            Szolgáltatások
          </Link>
          <a
            href={AUDIT_PATH}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border px-5 py-2 text-sm font-semibold text-ink transition hover:bg-secondary"
          >
            Ingyenes audit
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-20">
      <div className="max-w-md text-center" role="alert">
        <h1 className="text-2xl font-bold text-ink">
          Az oldal betöltése nem sikerült
        </h1>
        <p className="mt-3 text-ink-soft">
          Valami hiba történt a mi oldalunkon. Próbáld újra, vagy térj vissza a
          főoldalra.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand/90"
          >
            Újrapróbálom
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border px-5 py-2 text-sm font-semibold text-ink transition hover:bg-secondary"
          >
            Főoldal
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    loader: () => fetchPublicBusinessData(),
    head: ({ loaderData: business }) => {
      if (!business) {
        return {};
      }

      const siteName = business.site_name.trim() || "PandaDesign";
      const title =
        business.default_meta_title.trim() ||
        "Weboldal készítés vállalkozásoknak | PandaDesign";
      const description =
        business.default_meta_description.trim() ||
        "Ügyfélszerző weboldalak magyar vállalkozásoknak: gyors, mérhető, továbbfejleszthető rendszer a te tulajdonodban.";
      const baseUrl = normalizeBaseUrl(business.base_url);
      const organizationId = `${baseUrl}/#organization`;
      const websiteId = `${baseUrl}/#website`;
      const legalName = business.legal_name.trim();
      const tagline = business.tagline.trim();
      const email = business.email.trim();
      const telephone = business.phone.trim();
      const addressLine = business.address_line.trim();
      const postalCode = business.postal_code.trim();
      const city = business.city.trim();
      const country = business.country.trim();
      const hasAddress = Boolean(addressLine || postalCode || city);
      const sameAs = [
        business.facebook_url,
        business.instagram_url,
        business.linkedin_url,
      ]
        .map((url) => url.trim())
        .filter(Boolean);

      const organization = {
        "@type": "Organization",
        "@id": organizationId,
        name: siteName,
        url: baseUrl,
        ...(legalName ? { legalName } : {}),
        ...(tagline ? { description: tagline } : {}),
        areaServed: { "@type": "Country", name: "Magyarország" },
        ...(business.logoUrl ? { logo: business.logoUrl } : {}),
        ...(business.show_contact_details && email ? { email } : {}),
        ...(business.show_contact_details && telephone ? { telephone } : {}),
        ...(business.show_contact_details && hasAddress
          ? {
              address: {
                "@type": "PostalAddress",
                ...(addressLine ? { streetAddress: addressLine } : {}),
                ...(postalCode ? { postalCode } : {}),
                ...(city ? { addressLocality: city } : {}),
                ...(country ? { addressCountry: country } : {}),
              },
            }
          : {}),
        ...(sameAs.length > 0 ? { sameAs } : {}),
      };

      return {
        meta: [
          { charSet: "utf-8" },
          { name: "viewport", content: "width=device-width, initial-scale=1" },
          { name: "theme-color", content: "#1f3a93" },
          {
            name: "google-site-verification",
            content: "gBD0CQoUTwU3yamxEIH0dVvLebuJsgqqMCufO1Rm7lw",
          },
          { title },
          { name: "description", content: description },
          { name: "author", content: siteName },
          { property: "og:site_name", content: siteName },
          { property: "og:title", content: title },
          { property: "og:description", content: description },
          { property: "og:type", content: "website" },
          { property: "og:locale", content: "hu_HU" },
          ...(business.ogImageUrl
            ? [{ property: "og:image", content: business.ogImageUrl }]
            : []),
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: title },
          { name: "twitter:description", content: description },
          ...(business.ogImageUrl
            ? [{ name: "twitter:image", content: business.ogImageUrl }]
            : []),
        ],
        links: [
          {
            rel: "stylesheet",
            href: appCss,
          },
          {
            rel: "icon",
            href: business.faviconUrl || "/favicon.svg",
            ...(business.faviconUrl ? {} : { type: "image/svg+xml" }),
          },
        ],
        scripts: [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                organization,
                {
                  "@type": "WebSite",
                  "@id": websiteId,
                  name: siteName,
                  url: baseUrl,
                  inLanguage: "hu-HU",
                  publisher: {
                    "@id": organizationId,
                  },
                },
              ],
            }),
          },
        ],
      };
    },
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function normalizeBaseUrl(baseUrl: string) {
  const candidate = baseUrl.trim();

  try {
    const url = new URL(candidate);

    if (url.protocol === "http:" || url.protocol === "https:") {
      const productionHostname = new URL(DEFAULT_SITE_URL).hostname;

      if (
        url.hostname === productionHostname ||
        url.hostname === productionHostname.replace(/^www\./, "")
      ) {
        return DEFAULT_SITE_URL;
      }

      url.hash = "";
      url.search = "";

      return url.toString().replace(/\/+$/, "");
    }
  } catch {
    // A hibás CMS-érték helyett a production domain használatos.
  }

  return DEFAULT_SITE_URL;
}

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="hu">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only z-[60] rounded-lg bg-brand px-4 py-2 font-semibold text-brand-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Ugrás a tartalomra
        </a>
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </QueryClientProvider>
  );
}
