import { supabase } from "@/lib/supabase/client";
import { buildSeoHead } from "@/lib/seo";

export type LegalPageStatus = "draft" | "published";

export type PublicLegalPage = {
  id: string;
  slug: string;
  title: string;
  content: string;
  version: string;
  status: LegalPageStatus;
  effective_from: string | null;
  published_at: string | null;
  updated_at: string;
};

export type LegalPageDraft = {
  legal_page_id: string;
  slug: string;
  title: string;
  content: string;
  version: string;
  effective_from: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type AdminLegalPage = PublicLegalPage & {
  created_at: string;
  created_by: string | null;
  updated_by: string | null;
  draft: LegalPageDraft;
};

export type LegalPageRevision = {
  id: string;
  legal_page_id: string;
  slug: string;
  title: string;
  content: string;
  version: string;
  status: LegalPageStatus;
  effective_from: string | null;
  published_at: string | null;
  created_at: string;
  created_by: string | null;
};

export const LEGAL_PAGE_DEFINITIONS = {
  adatkezeles: {
    path: "/adatkezeles",
    fallbackTitle: "Adatkezelési tájékoztató",
    seoDescription:
      "A PandaDesign adatkezelési tájékoztatója a személyes adatok kezeléséről, céljáról és az érintetti jogokról.",
  },
  aszf: {
    path: "/aszf",
    fallbackTitle: "Általános Szerződési Feltételek",
    seoDescription:
      "A PandaDesign szolgáltatásaira vonatkozó Általános Szerződési Feltételek.",
  },
  impresszum: {
    path: "/impresszum",
    fallbackTitle: "Impresszum",
    seoDescription:
      "A PandaDesign szolgáltatói, kapcsolattartási és jogi adatai.",
  },
  "cookie-tajekoztato": {
    path: "/cookie-tajekoztato",
    fallbackTitle: "Süti- és cookie-tájékoztató",
    seoDescription:
      "Tájékoztató a PandaDesign weboldalán használt sütikről és a kapcsolódó beállításokról.",
  },
} as const;

export type LegalPageSlug = keyof typeof LEGAL_PAGE_DEFINITIONS;

export const LEGAL_PAGE_SLUGS = Object.keys(
  LEGAL_PAGE_DEFINITIONS,
) as LegalPageSlug[];

export async function fetchPublishedLegalPage(
  slug: LegalPageSlug,
): Promise<PublicLegalPage | null> {
  const { data, error } = await supabase
    .from("legal_pages")
    .select(
      "id, slug, title, content, version, status, effective_from, published_at, updated_at",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data
    ? normalizePublicLegalPage(data as Record<string, unknown>)
    : null;
}

export function buildLegalPageHead(
  slug: LegalPageSlug,
  page: PublicLegalPage | null | undefined,
) {
  const definition = LEGAL_PAGE_DEFINITIONS[slug];
  const title = page?.title.trim() || definition.fallbackTitle;

  return buildSeoHead({
    title: `${title} | PandaDesign`,
    description: definition.seoDescription,
    path: definition.path,
    robots: "index, follow",
  });
}

function normalizePublicLegalPage(
  page: Record<string, unknown>,
): PublicLegalPage {
  return {
    id: normalizeText(page.id),
    slug: normalizeText(page.slug),
    title: normalizeText(page.title),
    content: normalizeText(page.content),
    version: normalizeText(page.version),
    status: page.status === "published" ? "published" : "draft",
    effective_from: normalizeNullableText(page.effective_from),
    published_at: normalizeNullableText(page.published_at),
    updated_at: normalizeText(page.updated_at),
  };
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeNullableText(value: unknown) {
  return typeof value === "string" && value ? value : null;
}
