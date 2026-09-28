import { createFileRoute } from "@tanstack/react-router";
import {
  LegalDocumentError,
  LegalDocumentPage,
} from "@/components/site/LegalDocument";
import {
  LEGAL_PAGE_DEFINITIONS,
  buildLegalPageHead,
  fetchPublishedLegalPage,
} from "@/lib/legal-pages";

export const Route = createFileRoute("/adatkezeles")({
  loader: () => fetchPublishedLegalPage("adatkezeles"),
  head: ({ loaderData }) => buildLegalPageHead("adatkezeles", loaderData),
  errorComponent: LegalDocumentError,
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalDocumentPage
      slug="adatkezeles"
      page={Route.useLoaderData()}
      fallbackTitle={LEGAL_PAGE_DEFINITIONS.adatkezeles.fallbackTitle}
    />
  );
}
