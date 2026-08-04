export const DEFAULT_SITE_URL = "https://www.pandadesign.hu";

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+.-]*:\/\//i;

export function absoluteUrl(
  pathOrUrl: string,
  baseUrl = DEFAULT_SITE_URL,
): string {
  if (ABSOLUTE_URL_PATTERN.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = pathOrUrl.replace(/^\/+/, "");

  return new URL(normalizedPath, normalizedBaseUrl).toString();
}

type SeoHeadInput = {
  title: string;
  description: string;
  path: string;
  baseUrl?: string;
  image?: string;
  type?: string;
  robots?: string;
  jsonLd?: Record<string, unknown>;
};

export function buildSeoHead({
  title,
  description,
  path,
  baseUrl = DEFAULT_SITE_URL,
  image,
  type = "website",
  robots,
  jsonLd,
}: SeoHeadInput) {
  const canonicalUrl = absoluteUrl(path, baseUrl);
  const imageUrl = image ? absoluteUrl(image, baseUrl) : undefined;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonicalUrl },
      { property: "og:type", content: type },
      ...(imageUrl ? [{ property: "og:image", content: imageUrl }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      ...(imageUrl ? [{ name: "twitter:image", content: imageUrl }] : []),
      ...(robots ? [{ name: "robots", content: robots }] : []),
      ...(jsonLd ? [{ "script:ld+json": jsonLd }] : []),
    ],
    links: [{ rel: "canonical", href: canonicalUrl }],
  };
}
