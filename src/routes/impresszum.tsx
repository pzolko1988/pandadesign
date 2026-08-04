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

export const Route = createFileRoute("/impresszum")({
  loader: () => fetchPublishedLegalPage("impresszum"),
  head: ({ loaderData }) => buildLegalPageHead("impresszum", loaderData),
  errorComponent: LegalDocumentError,
  component: ImprintPage,
});

function ImprintPage() {
  return (
    <LegalDocumentPage
      page={Route.useLoaderData()}
      fallbackTitle={LEGAL_PAGE_DEFINITIONS.impresszum.fallbackTitle}
    />
  );
}
