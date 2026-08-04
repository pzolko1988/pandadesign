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

export const Route = createFileRoute("/cookie-tajekoztato")({
  loader: () => fetchPublishedLegalPage("cookie-tajekoztato"),
  head: ({ loaderData }) =>
    buildLegalPageHead("cookie-tajekoztato", loaderData),
  errorComponent: LegalDocumentError,
  component: CookiePolicyPage,
});

function CookiePolicyPage() {
  return (
    <LegalDocumentPage
      page={Route.useLoaderData()}
      fallbackTitle={LEGAL_PAGE_DEFINITIONS["cookie-tajekoztato"].fallbackTitle}
    />
  );
}
