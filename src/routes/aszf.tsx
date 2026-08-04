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

export const Route = createFileRoute("/aszf")({
  loader: () => fetchPublishedLegalPage("aszf"),
  head: ({ loaderData }) => buildLegalPageHead("aszf", loaderData),
  errorComponent: LegalDocumentError,
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalDocumentPage
      page={Route.useLoaderData()}
      fallbackTitle={LEGAL_PAGE_DEFINITIONS.aszf.fallbackTitle}
    />
  );
}
