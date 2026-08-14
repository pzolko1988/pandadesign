import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import { fetchVisibleServices } from "@/lib/public-services";
import { buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/szolgaltatasok")({
  loader: () => fetchVisibleServices(),
  head: () =>
    buildSeoHead({
      title: "Weboldal-készítési szolgáltatások — PandaDesign",
      description:
        "Prémium weboldalak, webshopok, WordPress karbantartás és egyedi Next.js fejlesztés magyar vállalkozásoknak.",
      path: "/szolgaltatasok",
    }),
  component: Services,
});

function Services() {
  const services = Route.useLoaderData();

  return (
    <>
      <Section
        eyebrow="Szolgáltatások"
        title="Amit kínálunk"
        description="Egy csapat, egy folyamat – minden, amire egy modern online jelenléthez szükséged lehet."
      >
        {services.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center text-ink-soft shadow-soft">
            Jelenleg nincs megjeleníthető szolgáltatás.
          </div>
        ) : (
          <div className="grid gap-5 md:gap-6">
            {services.map((service) => (
              <article
                key={service.id}
                className="rounded-2xl border bg-white p-6 shadow-soft transition-shadow hover:shadow-elegant md:p-8"
              >
                <div className="grid gap-6 lg:grid-cols-4 lg:gap-8">
                  <div className="lg:col-span-1">
                    <h2 className="text-xl font-bold text-ink">
                      {service.title}
                    </h2>

                    {service.link_url && (
                      <Button asChild variant="cta" className="mt-5">
                        <a href={service.link_url}>
                          Ajánlatot kérek <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="lg:col-span-3 lg:border-l lg:pl-8">
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand">
                      A szolgáltatásról
                    </p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink-soft">
                      {service.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl bg-brand text-brand-foreground p-8 md:p-14 shadow-elegant text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Nem találod amit keresel?
            </h2>
            <p className="mt-3 text-brand-foreground/80 max-w-xl mx-auto">
              Írd le pár mondatban a projektedet – 1 munkanapon belül
              válaszolunk konkrét lépésekkel.
            </p>
            <Button asChild size="lg" variant="cta" className="mt-7">
              <Link to="/kapcsolat">
                Beszéljünk <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
