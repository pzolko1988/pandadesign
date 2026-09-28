import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import {
  AuditCtaBlock,
  BenefitGrid,
  ReferencePreview,
} from "@/components/site/Marketing";
import { DEFAULT_SERVICES, fetchVisibleServices } from "@/lib/public-services";
import { buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/szolgaltatasok")({
  loader: () =>
    fetchVisibleServices().catch((error: unknown) => {
      console.error("A szolgáltatások nem tölthetők be:", error);
      return DEFAULT_SERVICES;
    }),
  head: () =>
    buildSeoHead({
      title: "Szolgáltatások: weboldal, landing, webshop, webapp | PandaDesign",
      description:
        "Ügyfélszerző céges weboldal, kampány landing oldal, webshop és egyedi üzleti rendszer – üzleti cél szerint tervezve, mérhetően, a te tulajdonodban.",
      path: "/szolgaltatasok",
    }),
  component: Services,
});

const MORE_SERVICES = [
  {
    title: "Weboldal újratervezés",
    text: "Meglévő, elavult vagy lassú oldal modernizálása, a működő tartalmak megtartásával.",
    href: "/weboldal-ujratervezes",
  },
  {
    title: "SEO-optimalizálás",
    text: "Technikai SEO-alapok, oldalszerkezet és tartalmi javaslatok meglévő weboldalhoz.",
    href: "/seo-optimalizalas",
  },
];

function Services() {
  const services = Route.useLoaderData();

  return (
    <>
      <Section
        eyebrow="Szolgáltatások"
        title="Üzleti cél szerint építünk, nem technológia szerint"
        description="Először azt tisztázzuk, mit kell elérnie az oldalnak. A technológiát ehhez választjuk – nem fordítva."
        titleAs="h1"
      >
        <div className="grid gap-5 md:gap-6">
          {services.map((service, index) => (
            <article
              key={service.id}
              className="grid gap-6 rounded-2xl border bg-white p-6 shadow-soft transition hover:shadow-elegant md:p-8 lg:grid-cols-[1fr_1.4fr] lg:gap-10"
            >
              <div>
                <span className="font-mono text-xs font-bold tracking-widest text-success">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-2 text-2xl font-bold text-ink">
                  {service.title}
                </h2>
                {service.audience && (
                  <p className="mt-1 font-medium text-brand">
                    {service.audience}
                  </p>
                )}
                <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">
                  {service.description}
                </p>
                {service.link_url && service.link_url !== "/szolgaltatasok" && (
                  <Button asChild variant="outline" className="mt-5">
                    <a href={service.link_url}>
                      Részletek
                      <span className="sr-only">: {service.title}</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </Button>
                )}
              </div>

              <div className="lg:border-l lg:pl-10">
                {service.highlights.length > 0 && (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
                      Cél
                    </p>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {service.highlights.map((item) => (
                        <li key={item} className="flex gap-2 text-sm text-ink">
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-success"
                            aria-hidden="true"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {service.technology && (
                  <p className="mt-5 text-sm text-ink-soft">
                    <span className="font-semibold text-ink">
                      Technológia:{" "}
                    </span>
                    {service.technology}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="További szolgáltatások"
        title="Meglévő weboldalad van?"
        tone="muted"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {MORE_SERVICES.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group rounded-2xl border bg-white p-6 shadow-soft transition hover:shadow-elegant"
            >
              <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {item.text}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand transition-all group-hover:gap-2">
                Részletek <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Minden projektnél"
        title="Amit bármelyik szolgáltatás mellé megkapsz"
      >
        <BenefitGrid />
      </Section>

      <ReferencePreview title="Munkáink" tone="muted" />

      <AuditCtaBlock placement="services" />
    </>
  );
}
