import { createFileRoute } from "@tanstack/react-router";
import {
  ServiceLandingPage,
  buildLandingHead,
  loadLandingPackages,
} from "@/components/site/ServiceLandingPage";
import { LANDING_PAGES } from "@/lib/seo-landing-pages";

const content = LANDING_PAGES.seo;

export const Route = createFileRoute("/seo-optimalizalas")({
  loader: () => loadLandingPackages(content),
  head: () => buildLandingHead(content),
  component: LandingRoute,
});

function LandingRoute() {
  return (
    <ServiceLandingPage content={content} packages={Route.useLoaderData()} />
  );
}
