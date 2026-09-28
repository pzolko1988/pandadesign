import { createFileRoute } from "@tanstack/react-router";
import {
  ServiceLandingPage,
  buildLandingHead,
  loadLandingPackages,
} from "@/components/site/ServiceLandingPage";
import { LANDING_PAGES } from "@/lib/seo-landing-pages";

const content = LANDING_PAGES.webalkalmazas;

export const Route = createFileRoute("/webalkalmazas-fejlesztes")({
  loader: () => loadLandingPackages(content),
  head: () => buildLandingHead(content),
  component: LandingRoute,
});

function LandingRoute() {
  return (
    <ServiceLandingPage content={content} packages={Route.useLoaderData()} />
  );
}
