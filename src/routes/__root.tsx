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
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CookieBanner } from "@/components/site/CookieBanner";
import { fetchPublicBusinessData } from "@/lib/public-business";
import { DEFAULT_SITE_URL } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back
          home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
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
        "PandaDesign — Modern weboldalak, amelyek ügyfeleket szereznek";
      const description =
        business.default_meta_description.trim() ||
        "Modern, gyors és keresőbarát weboldalak magyar vállalkozásoknak.";
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
            href: business.faviconUrl || "/favicon.ico",
            ...(business.faviconUrl ? {} : { type: "image/x-icon" }),
          },
          { rel: "preconnect", href: "https://fonts.googleapis.com" },
          {
            rel: "preconnect",
            href: "https://fonts.gstatic.com",
            crossOrigin: "anonymous",
          },
          {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
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

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </QueryClientProvider>
  );
}
