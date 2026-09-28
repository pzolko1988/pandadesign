import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Compass,
  Eye,
  MessageSquare,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import { OwnershipBlock } from "@/components/site/Marketing";
import { AUDIT_PATH } from "@/lib/marketing-content";
import { buildSeoHead } from "@/lib/seo";
import {
  DEFAULT_SITE_SETTINGS,
  loadSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";

export const Route = createFileRoute("/rolunk")({
  head: () =>
    buildSeoHead({
      title: "Rólunk – közvetlen együttműködés | PandaDesign",
      description:
        "A PandaDesignnál közvetlenül azzal dolgozol, aki megtervezi és megvalósítja a weboldaladat. Nincs közvetítői lánc, speciális feladatoknál bevált szakemberekkel dolgozunk.",
      path: "/rolunk",
    }),
  component: About,
});

const PRINCIPLES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: MessageSquare,
    title: "Közvetlen kommunikáció",
    text: "Nincs account manager, ticketrendszer vagy call center. Azzal beszélsz, aki a projekteden dolgozik.",
  },
  {
    icon: Compass,
    title: "Először az üzleti cél",
    text: "Előbb azt tisztázzuk, mit kell elérnie az oldalnak – érdeklődőt, foglalást, vásárlást –, és csak utána választunk technológiát.",
  },
  {
    icon: Eye,
    title: "Átláthatóság",
    text: "Írásos ajánlat, világos tartalom és ütemezés. Mindig tudod, hol tart a munka, és mi a következő lépés.",
  },
  {
    icon: Users,
    title: "Specialisták, ha kell",
    text: "Speciális feladatoknál – például szövegírás, fotózás vagy összetett integráció – bevált szakemberekkel dolgozunk együtt.",
  },
];

function About() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    let active = true;

    loadSiteSettings()
      .then((loaded) => {
        if (active) {
          setSettings(loaded);
        }
      })
      .catch((error: unknown) => {
        console.error("A vállalkozási adatok nem tölthetők be:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const facts = [
    settings.legal_name && { label: "Vállalkozás", value: settings.legal_name },
    {
      label: "Munkavégzés",
      value:
        "Online egyeztetés – az ország bármely pontjáról dolgozhatunk együtt",
    },
    settings.show_contact_details &&
      settings.phone && { label: "Telefon", value: settings.phone },
    settings.show_contact_details &&
      settings.email && { label: "E-mail", value: settings.email },
    settings.opening_hours && {
      label: "Elérhetőség",
      value: settings.opening_hours,
    },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <Section
        eyebrow="Rólunk"
        title="Közvetlenül azzal dolgozol, aki megépíti a rendszered"
        titleAs="h1"
      >
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
          <div className="space-y-5 text-base leading-relaxed text-ink-soft md:text-lg">
            <p className="text-xl font-semibold leading-snug text-ink md:text-2xl">
              Nincs felesleges közvetítői lánc. Közvetlenül azzal dolgozol, aki
              megtervezi és megvalósítja a rendszeredet.
            </p>
            <p>
              A PandaDesign nem nagy ügynökség, és nem is akar annak látszani.
              Kis- és középvállalkozásoknak építünk olyan weboldalakat, amelyek
              érdeklődőket hoznak, mérhetők, és később továbbfejleszthetők.
            </p>
            <p>
              Speciális feladatoknál bevált szakemberekkel dolgozunk együtt – de
              a projekt felelőse és a kapcsolattartód végig ugyanaz marad.
            </p>
          </div>

          <aside className="h-fit rounded-2xl border bg-white p-6 shadow-soft md:p-7">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand">
              Tények röviden
            </h2>
            <dl className="mt-5 space-y-4">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-ink">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </Section>

      <Section eyebrow="Így dolgozunk" title="Amire számíthatsz" tone="muted">
        <div className="grid gap-4 sm:grid-cols-2 md:gap-5">
          {PRINCIPLES.map((principle) => (
            <div
              key={principle.title}
              className="h-full rounded-2xl border bg-white p-6 shadow-soft md:p-7"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
                <principle.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">
                {principle.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {principle.text}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <OwnershipBlock />

      <Section>
        <div className="flex flex-col items-start gap-6 rounded-3xl border bg-white p-8 shadow-soft md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold text-ink md:text-3xl">
              Ismerkedjünk meg egy rövid audittal
            </h2>
            <p className="mt-3 text-ink-soft">
              15 perc alatt megmutatjuk, hol veszít érdeklődőket a mostani
              weboldalad. Kötelezettség nélkül.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="cta"
              className="h-auto min-h-12 whitespace-normal py-3"
            >
              <a href={AUDIT_PATH} data-track-placement="about">
                Kérem az ingyenes auditot
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/kapcsolat" data-track-placement="about">
                Kapcsolat
              </Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
