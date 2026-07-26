import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/referenciak")({
  head: () => ({
    meta: [
      { title: "Referenciák — PandaDesign" },
      { name: "description", content: "Válogatott projektek különböző iparágakból – fogorvos, étterem, ügyvédi iroda, könyvelő, food truck és szálláshely." },
      { property: "og:title", content: "Referenciák — PandaDesign" },
      { property: "og:description", content: "Válogatott projektek magyar vállalkozásoknak – helyőrző referenciák valós projektekkel cserélve." },
      { property: "og:url", content: "/referenciak" },
    ],
    links: [{ rel: "canonical", href: "/referenciak" }],
  }),
  component: Portfolio,
});

const CATS = ["Összes", "Céges oldal", "Vendéglátás", "Egészségügy", "Webshop"] as const;
type Cat = typeof CATS[number];

const PROJECTS: Array<{
  title: string; industry: string; cat: Cat; challenge: string; solution: string; features: string[]; result: string;
}> = [
  { title: "Belvárosi Fogorvosi Rendelő", industry: "Fogorvosi rendelő", cat: "Egészségügy",
    challenge: "A régi oldal nem támogatta az online időpontfoglalást és mobilon nehéz volt navigálni.",
    solution: "Modern, bizalomépítő dizájn átlátható szolgáltatás-térképpel és időpontfoglalással.",
    features: ["Reszponzív design", "Időpontfoglalás", "Szolgáltatás-oldalak", "Csapat bemutatás"],
    result: "Több online foglalás és mobil látogató (helyőrző mérőszám)." },
  { title: "Kisváros Bisztró", industry: "Étterem", cat: "Vendéglátás",
    challenge: "A menü frissítése bonyolult volt és mobilon rosszul jelent meg.",
    solution: "Egyszerűen szerkeszthető menükártya, foglalási modul és Google Maps integráció.",
    features: ["Menükártya CMS", "Foglalás", "Galéria", "Nyitvatartás"],
    result: "Csökkent visszafordulási arány, több foglalás (helyőrző)." },
  { title: "Dr. Minta Ügyvédi Iroda", industry: "Jogi szolgáltatás", cat: "Céges oldal",
    challenge: "Az iroda szerette volna erősíteni a bizalmat és szakterületeit hangsúlyozni.",
    solution: "Letisztult, professzionális dizájn szakterületek szerinti oldalstruktúrával.",
    features: ["Szakterületek", "Csapat", "Ajánlatkérő űrlap", "Blog"],
    result: "Több minőségi ajánlatkérés (helyőrző)." },
  { title: "Utcai Ízek Food Truck", industry: "Food truck", cat: "Vendéglátás",
    challenge: "Ki kellett emelni a heti menüt és a napi helyszíneket.",
    solution: "Élénk brand-oldal helyszín-térképpel, heti menüvel és Instagram integrációval.",
    features: ["Heti menü", "Helyszín-térkép", "Közösségi média", "Kapcsolat"],
    result: "Növekvő közösségi elérés és forgalom (helyőrző)." },
  { title: "Precíz Könyvelőiroda", industry: "Könyvelés", cat: "Céges oldal",
    challenge: "Áttekinthető szolgáltatás-portfólió és ajánlatkérő űrlap hiányzott.",
    solution: "Egyértelmű csomagok, ajánlatkérő űrlap és bizalomépítő tartalom.",
    features: ["Szolgáltatás-csomagok", "Ajánlatkérés", "GYIK", "Kapcsolat"],
    result: "Egyszerűbb ajánlatkérés-kezelés (helyőrző)." },
  { title: "Csendes Kert Vendégház", industry: "Szálláshely", cat: "Céges oldal",
    challenge: "Vizuális, foglalás-orientált oldal kellett galériával.",
    solution: "Prémium galéria, foglalási linkek és mobilra optimalizált navigáció.",
    features: ["Galéria", "Foglalási linkek", "Szobák oldal", "Kapcsolat"],
    result: "Nőtt a direkt foglalások aránya (helyőrző)." },
];

function Portfolio() {
  const [active, setActive] = useState<Cat>("Összes");
  const filtered = useMemo(() => active === "Összes" ? PROJECTS : PROJECTS.filter((p) => p.cat === active), [active]);
  return (
    <Section eyebrow="Referenciák" title="Válogatott munkáink" description="Az alábbi projektek helyőrző referenciák – valódi ügyfél-engedélyt követően cseréljük őket.">
      <div role="tablist" aria-label="Kategória szűrés" className="flex flex-wrap gap-2 mb-10">
        {CATS.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={active === c}
            onClick={() => setActive(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              active === c
                ? "bg-brand text-brand-foreground border-brand shadow-sm"
                : "bg-white text-ink-soft border-ink/10 hover:text-brand hover:border-brand/40"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-5 md:gap-6">
        {filtered.map((p) => (
          <Card key={p.title} className="overflow-hidden border shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all h-full flex flex-col">
            <div className="aspect-[16/10] relative bg-gradient-to-br from-brand/10 via-brand/4 to-success/10 border-b">
              {/* Desktop mockup */}
              <div className="absolute inset-6 md:inset-8 rounded-lg bg-white shadow-elegant overflow-hidden">
                <div className="h-5 border-b bg-secondary/40 flex items-center gap-1 px-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/15" />
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/15" />
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/15" />
                </div>
                <div className="p-3 space-y-2">
                  <div className="h-1.5 w-16 rounded-full bg-brand/70" />
                  <div className="h-2.5 w-3/4 rounded bg-ink/80" />
                  <div className="h-1.5 w-1/2 rounded-full bg-ink/20" />
                  <div className="grid grid-cols-3 gap-1.5 pt-2">
                    <div className="aspect-square rounded bg-success/25" />
                    <div className="aspect-square rounded bg-brand/20" />
                    <div className="aspect-square rounded bg-ink/10" />
                  </div>
                </div>
              </div>
              {/* Mobile mockup */}
              <div className="absolute bottom-3 right-4 w-14 h-24 rotate-3 rounded-[10px] border bg-white shadow-elegant overflow-hidden ring-4 ring-brand/5">
                <div className="h-2 bg-ink/80" />
                <div className="p-1.5 space-y-1">
                  <div className="h-1 w-3/4 rounded-full bg-ink/60" />
                  <div className="h-1 w-1/2 rounded-full bg-ink/20" />
                  <div className="h-8 rounded bg-gradient-to-br from-success/25 to-brand/15" />
                </div>
              </div>
              <span className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">Minta projekt</span>
            </div>
            <CardContent className="p-6 md:p-7 flex-1 flex flex-col">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">{p.industry}</p>
              <h3 className="mt-1.5 text-xl font-bold text-ink">{p.title}</h3>
              <div className="mt-4 space-y-3 text-sm text-ink-soft flex-1">
                <p><span className="font-semibold text-ink">Kihívás:</span> {p.challenge}</p>
                <p><span className="font-semibold text-ink">Megoldás:</span> {p.solution}</p>
                <div>
                  <p className="font-semibold text-ink mb-1.5">Átadott funkciók:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.features.map((f) => (
                      <span key={f} className="rounded-full bg-brand-soft/70 px-2.5 py-1 text-xs font-medium text-brand">{f}</span>
                    ))}
                  </div>
                </div>
                <p><span className="font-semibold text-ink">Eredmény:</span> {p.result}</p>
              </div>
              <Button asChild variant="outline" className="mt-6 self-start">
                <Link to="/kapcsolat">Hasonlót szeretnék <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-ink-soft py-16">Ebben a kategóriában még nincs projekt.</p>
      )}
    </Section>
  );
}