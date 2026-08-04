import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Compass,
  Handshake,
  HeartHandshake,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/rolunk")({
  head: () =>
    buildSeoHead({
      title: "PandaDesign weboldal-készítő csapat",
      description:
        "PandaDesign egy modern magyar web ügynökség, amely a vállalkozások üzleti céljait támogató weboldalakat készít.",
      path: "/rolunk",
    }),
  component: About,
});

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Megbízhatóság",
    desc: "Amit vállalunk, azt határidőre és minőségben átadjuk.",
  },
  {
    icon: Sparkles,
    title: "Igényes megjelenés",
    desc: "Minden projekt egyedi és a márka jellegéhez igazodik.",
  },
  {
    icon: Rocket,
    title: "Gyorsaság",
    desc: "Fókuszált munkafolyamat rövid átfutási időkkel.",
  },
  {
    icon: Handshake,
    title: "Átláthatóság",
    desc: "Tiszta árajánlat, egyértelmű kommunikáció minden szakaszban.",
  },
  {
    icon: HeartHandshake,
    title: "Hosszú távú együttműködés",
    desc: "Nem eltűnünk átadás után – támogatunk üzemeltetésben és fejlesztésben is.",
  },
  {
    icon: Compass,
    title: "Üzleti szemlélet",
    desc: "A weboldal nem cél, hanem eszköz – az üzleti eredmény számít.",
  },
];

function About() {
  return (
    <>
      <Section
        eyebrow="Rólunk"
        title="Weboldalak, amelyek üzleti eredményt hoznak"
      >
        <div className="max-w-3xl text-base md:text-lg text-ink-soft leading-relaxed">
          <p className="text-2xl md:text-3xl font-semibold text-ink leading-snug tracking-tight">
            Hisszük, hogy egy jó weboldal nem csupán szépen néz ki, hanem
            támogatja a vállalkozás üzleti céljait is.
          </p>
          <p className="mt-6">
            A PandaDesign egy modern magyar web ügynökség kis- és
            középvállalkozásoknak. A célunk, hogy minden ügyfelünk
            professzionális, gyors és könnyen kezelhető online jelenlétet kapjon
            – az ötlettől a hosszú távú üzemeltetésig.
          </p>
        </div>
      </Section>

      <Section eyebrow="Küldetés" title="Miért vagyunk itt?" tone="muted">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="space-y-4 text-ink-soft leading-relaxed">
            <p>
              Sok magyar vállalkozás online jelenléte évek óta nem újult meg.
              Ezt szeretnénk megváltoztatni: modern, mobilra optimalizált és jól
              szerkeszthető oldalakat építünk, amelyek a valós vásárlási döntést
              támogatják.
            </p>
            <p>
              Hiszünk az egyszerűségben, a letisztult designban és az őszinte
              kommunikációban. Nem ígérünk lehetetlent – amit vállalunk, azt
              magas színvonalon szállítjuk.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] max-w-sm mx-auto rounded-2xl bg-gradient-to-br from-brand/12 to-success/10 border shadow-elegant grid place-items-center p-8 text-center relative overflow-hidden">
              <div
                aria-hidden
                className="absolute inset-0 opacity-40 bg-[radial-gradient(400px_200px_at_50%_0%,color-mix(in_oklab,var(--brand)_15%,transparent),transparent)]"
              />
              <div className="relative">
                <div className="mx-auto h-28 w-28 rounded-full bg-white border shadow-elegant grid place-items-center text-3xl font-bold text-brand">
                  PD
                </div>
                <p className="mt-6 text-sm font-semibold text-ink">Alapító</p>
                <p className="text-xs text-ink-soft mt-1">
                  Professzionális fotó – helyőrző
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section eyebrow="Értékeink" title="Amiben hiszünk">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border bg-white p-7 shadow-soft h-full"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
                <v.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">{v.title}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Munkamódszer" title="Hogyan dolgozunk?" tone="muted">
        <div className="grid sm:grid-cols-2 gap-4 md:gap-5 max-w-4xl">
          {[
            {
              t: "Személyes kommunikáció",
              d: "Nincs call center és ticket rendszer – közvetlenül azzal beszélsz, aki a projekten dolgozik.",
            },
            {
              t: "Modern technológiák",
              d: "WordPress a rugalmas tartalomkezeléshez, Next.js a prémium egyedi alkalmazásokhoz.",
            },
            {
              t: "Támogatás átadás után",
              d: "Karbantartás, apró javítások és hosszú távú együttműködés az élesítés után is.",
            },
            {
              t: "Világos, magyar szakmai nyelv",
              d: "Kerüljük a felesleges szakzsargont – érthetően magyarázzuk el a döntéseket.",
            },
          ].map((x) => (
            <div
              key={x.t}
              className="rounded-2xl bg-white border p-7 shadow-soft h-full"
            >
              <h3 className="text-lg font-semibold text-ink">{x.t}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                {x.d}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <Button asChild size="lg" variant="cta">
            <Link to="/kapcsolat">
              Beszéljünk a projektedről <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
