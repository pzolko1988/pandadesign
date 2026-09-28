import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import {
  AuditCtaBlock,
  FaqList,
  PricingCards,
  ReferencePreview,
} from "@/components/site/Marketing";
import {
  AUDIT_PATH,
  DEFAULT_PRICING_PACKAGES,
  type PricingPackage,
} from "@/lib/marketing-content";
import { fetchVisiblePricingPackages } from "@/lib/public-pricing";
import type { LandingPageContent } from "@/lib/seo-landing-pages";
import { absoluteUrl, buildSeoHead, DEFAULT_SITE_URL } from "@/lib/seo";

export async function loadLandingPackages(content: LandingPageContent) {
  if (content.packageSlugs.length === 0) {
    return [] as PricingPackage[];
  }

  const packages = await fetchVisiblePricingPackages().catch(
    (error: unknown) => {
      console.error("Az árcsomagok nem tölthetők be:", error);
      return DEFAULT_PRICING_PACKAGES;
    },
  );

  return content.packageSlugs
    .map((slug) => packages.find((item) => item.slug === slug))
    .filter((item): item is PricingPackage => Boolean(item));
}

export function buildLandingHead(content: LandingPageContent) {
  return buildSeoHead({
    title: content.metaTitle,
    description: content.metaDescription,
    path: content.path,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          name: content.h1,
          serviceType: content.serviceType,
          description: content.metaDescription,
          url: absoluteUrl(content.path),
          areaServed: { "@type": "Country", name: "Magyarország" },
          provider: { "@id": `${DEFAULT_SITE_URL}/#organization` },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Főoldal",
              item: absoluteUrl("/"),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Szolgáltatások",
              item: absoluteUrl("/szolgaltatasok"),
            },
            {
              "@type": "ListItem",
              position: 3,
              name: content.breadcrumb,
              item: absoluteUrl(content.path),
            },
          ],
        },
      ],
    },
  });
}

export function ServiceLandingPage({
  content,
  packages,
}: {
  content: LandingPageContent;
  packages: PricingPackage[];
}) {
  const placement = content.path.replace(/^\//, "");

  return (
    <>
      <section className="relative overflow-hidden border-b bg-secondary/35 py-14 md:py-20">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(900px_450px_at_90%_0%,color-mix(in_oklab,var(--brand)_10%,transparent),transparent)]"
        />
        <div className="container-page relative">
          <nav aria-label="Morzsamenü" className="text-sm text-ink-soft">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link to="/" className="hover:text-brand hover:underline">
                  Főoldal
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  to="/szolgaltatasok"
                  className="hover:text-brand hover:underline"
                >
                  Szolgáltatások
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-ink">
                {content.breadcrumb}
              </li>
            </ol>
          </nav>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            {content.eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-ink md:text-5xl">
            {content.h1}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
            {content.intro}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="cta"
              className="h-auto min-h-12 whitespace-normal py-3"
            >
              <a href={AUDIT_PATH} data-track-placement={placement}>
                Kérek ingyenes weboldal-auditot
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/kapcsolat" data-track-placement={placement}>
                Ajánlatot kérek
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Section eyebrow="A probléma" title={content.problemTitle}>
        <ul className="grid gap-3 sm:grid-cols-2 md:gap-4">
          {content.problems.map((problem) => (
            <li
              key={problem}
              className="flex gap-3 rounded-xl border bg-white p-5 text-sm leading-relaxed text-ink shadow-soft"
            >
              <X
                className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                aria-hidden="true"
              />
              {problem}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        eyebrow="A megoldás"
        title={content.solutionTitle}
        description={content.solutionText}
        tone="muted"
      >
        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {content.benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="h-full rounded-2xl border bg-white p-6 shadow-soft"
            >
              <h3 className="text-lg font-semibold text-ink">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {benefit.text}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Funkciók" title="Mit tartalmaz?">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {content.features.map((feature) => (
            <li key={feature} className="flex gap-2 text-sm text-ink">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-success"
                aria-hidden="true"
              />
              {feature}
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Folyamat" title="Így dolgozunk" tone="muted">
        <ol className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {content.process.map((step, index) => (
            <li
              key={step.title}
              className="h-full rounded-2xl border bg-white p-6 shadow-soft"
            >
              <span className="font-mono text-xs font-bold tracking-widest text-success">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {packages.length > 0 && (
        <Section
          eyebrow="Árak"
          title="Induló árak"
          description="A végleges árat a tartalom és a funkciók ismeretében, írásos ajánlatban adjuk meg."
        >
          <PricingCards packages={packages} placement={placement} />
          <p className="mt-6 text-sm text-ink-soft">
            Az összes csomag és a feltételek:{" "}
            <Link
              to="/arak"
              className="font-semibold text-brand hover:underline"
            >
              Árak oldal →
            </Link>
          </p>
        </Section>
      )}

      {content.referenceCategories.length > 0 && (
        <ReferencePreview
          title="Kapcsolódó munkák"
          categories={content.referenceCategories}
          tone="muted"
        />
      )}

      <Section eyebrow="Kérdések" title="Gyakori kérdések">
        <div className="max-w-3xl">
          <FaqList items={content.faqs} />
        </div>
      </Section>

      <AuditCtaBlock placement={placement} />
    </>
  );
}
