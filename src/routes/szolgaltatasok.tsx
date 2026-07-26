import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/szolgaltatasok")({
  head: () => ({
    meta: [
      { title: "Szolgáltatások — PandaDesign" },
      { name: "description", content: "Prémium weboldalak, webshopok, WordPress karbantartás és egyedi Next.js fejlesztés magyar vállalkozásoknak." },
      { property: "og:title", content: "Szolgáltatások — PandaDesign" },
      { property: "og:description", content: "WordPress, céges oldalak, landing, webshop, újratervezés, karbantartás, SEO és egyedi fejlesztés." },
      { property: "og:url", content: "/szolgaltatasok" },
    ],
    links: [{ rel: "canonical", href: "/szolgaltatasok" }],
  }),
  component: Services,
});

const SERVICES = [
  {
    title: "WordPress weboldal készítés",
    audience: "Kis- és középvállalkozásoknak, akik szeretnék maguk is szerkeszteni az oldalt.",
    includes: ["Egyedi WordPress téma vagy bővített prémium sablon", "Reszponzív dizájn", "Alap SEO", "Blog modul", "Betanítás"],
    benefits: ["Rugalmas tartalomkezelés", "Nagy bővítmény-ökoszisztéma", "Alacsony belépési költség"],
    scope: "2–5 hét",
  },
  {
    title: "Céges weboldal készítés",
    audience: "Szolgáltató vállalkozásoknak, akik professzionális bemutatkozó oldalt szeretnének.",
    includes: ["5–10 aloldal", "Egyedi arculati elemek", "Kapcsolat és ajánlatkérő űrlap", "Google Analytics"],
    benefits: ["Erősebb bizalom", "Több minőségi érdeklődő", "Egységes brand-megjelenés"],
    scope: "3–6 hét",
  },
  {
    title: "Landing oldal készítés",
    audience: "Kampányokhoz, termékbevezetésekhez, egy konkrét cél elérésére.",
    includes: ["Egyoldalas kampányoldal", "Konverzió-orientált szerkezet", "A/B teszt-ready", "Űrlap integráció"],
    benefits: ["Magas konverzió", "Gyors indulás", "Mérhető kampányeredmények"],
    scope: "1–2 hét",
  },
  {
    title: "Webshop készítés",
    audience: "Kereskedőknek, akik online is szeretnének értékesíteni.",
    includes: ["Termékkatalógus", "Kosár és pénztár", "Online fizetés (Barion, Stripe stb.)", "Szállítási módok", "Rendeléskezelés"],
    benefits: ["Új értékesítési csatorna", "24/7 elérhető bolt", "Skálázható technológia"],
    scope: "4–10 hét",
  },
  {
    title: "Weboldal újratervezés",
    audience: "Meglévő oldalak modernizálásához, akik gyorsabb és letisztultabb megjelenést szeretnének.",
    includes: ["UX audit", "Új design rendszer", "Tartalom-migráció", "SEO megőrzése"],
    benefits: ["Jobb konverzió", "Modern márkakép", "Gyorsabb betöltés"],
    scope: "3–6 hét",
  },
  {
    title: "WordPress karbantartás",
    audience: "WordPress alapú oldalak tulajdonosainak, akiknek fontos a biztonság és a folytonosság.",
    includes: ["Rendszeres frissítések", "Biztonsági mentések", "Sebesség-monitorozás", "Kisebb módosítások"],
    benefits: ["Nyugodt üzemeltetés", "Kevesebb hibalehetőség", "Folyamatos elérhetőség"],
    scope: "Havi csomag",
  },
  {
    title: "SEO és teljesítményoptimalizálás",
    audience: "Vállalkozásoknak, akik szeretnének több organikus látogatót és jobb Core Web Vitals-t.",
    includes: ["Technikai SEO audit", "Sebességjavítás", "Meta és sémák", "Tartalmi javaslatok"],
    benefits: ["Jobb Google helyezés", "Alacsonyabb visszafordulás", "Erősebb felhasználói élmény"],
    scope: "2–4 hét",
  },
  {
    title: "Egyedi Next.js webalkalmazások",
    audience: "Komplexebb üzleti folyamatokhoz, ahol egy WordPress már nem elég.",
    includes: ["Egyedi UI/UX", "Backend integrációk", "Autentikáció", "Skálázható architektúra"],
    benefits: ["Maximális rugalmasság", "Kimagasló teljesítmény", "Prémium felhasználói élmény"],
    scope: "6+ hét",
  },
];

function Services() {
  return (
    <>
      <Section eyebrow="Szolgáltatások" title="Amit kínálunk" description="Egy csapat, egy folyamat – minden, amire egy modern online jelenléthez szükséged lehet.">
        <div className="grid gap-5 md:gap-6">
          {SERVICES.map((s) => (
            <article key={s.title} className="rounded-2xl border bg-white p-6 md:p-8 shadow-soft hover:shadow-elegant transition-shadow">
              <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
                <div className="lg:col-span-1">
                  <h3 className="text-xl font-bold text-ink">{s.title}</h3>
                  <p className="mt-3 text-sm text-ink-soft"><span className="font-semibold text-ink">Kinek ajánljuk:</span> {s.audience}</p>
                  <p className="mt-3 text-sm text-ink-soft"><span className="font-semibold text-ink">Tipikus időtáv:</span> {s.scope}</p>
                  <Button asChild variant="cta" className="mt-5">
                    <Link to="/kapcsolat">Ajánlatot kérek <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
                <div className="lg:col-span-3 grid md:grid-cols-2 gap-6 lg:border-l lg:pl-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">Mit tartalmaz</p>
                    <ul className="space-y-2">
                      {s.includes.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-ink-soft"><Check className="h-4 w-4 mt-0.5 shrink-0 text-success" />{f}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">Üzleti előnyök</p>
                    <ul className="space-y-2">
                      {s.benefits.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-ink-soft"><Check className="h-4 w-4 mt-0.5 shrink-0 text-success" />{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl bg-brand text-brand-foreground p-8 md:p-14 shadow-elegant text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Nem találod amit keresel?</h2>
            <p className="mt-3 text-brand-foreground/80 max-w-xl mx-auto">Írd le pár mondatban a projektedet – 1 munkanapon belül válaszolunk konkrét lépésekkel.</p>
            <Button asChild size="lg" variant="cta" className="mt-7">
              <Link to="/kapcsolat">Beszéljünk <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}