import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Smartphone, Zap, Search, Settings, Layers, ShoppingBag, RefreshCw, LifeBuoy, Code2, Sparkles, Users, TrendingUp, Globe, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Section } from "@/components/site/Section";
import { BrowserMockup } from "@/components/site/BrowserMockup";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PandaDesign — Modern weboldalak, amelyek ügyfeleket szereznek" },
      { name: "description", content: "Gyors, mobilbarát és átlátható weboldalakat készítünk magyar vállalkozásoknak – az első ötlettől a hosszú távú üzemeltetésig." },
      { property: "og:title", content: "PandaDesign — Modern weboldalak, amelyek ügyfeleket szereznek" },
      { property: "og:description", content: "Gyors, mobilbarát és átlátható weboldalakat készítünk magyar vállalkozásoknak – az első ötlettől a hosszú távú üzemeltetésig." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Home,
});

const TRUST = [
  { icon: Smartphone, label: "Mobilbarát" },
  { icon: Zap, label: "Gyors betöltés" },
  { icon: Search, label: "Keresőbarát" },
  { icon: Settings, label: "Könnyen kezelhető" },
];

const SERVICES = [
  { icon: Layers, title: "Céges weboldalak", desc: "Bizalmat építő bemutatkozó oldalak, tiszta struktúrával." },
  { icon: Sparkles, title: "Landing oldalak", desc: "Egy célra fókuszáló, konverzióra hangolt kampányoldalak." },
  { icon: ShoppingBag, title: "Webshopok", desc: "Biztonságos fizetéssel és egyszerű adminisztrációval." },
  { icon: RefreshCw, title: "Újratervezés", desc: "Régi oldalak modernizálása, gyorsabb betöltéssel." },
  { icon: LifeBuoy, title: "WordPress karbantartás", desc: "Frissítések, mentések, folyamatos technikai támogatás." },
  { icon: Code2, title: "Egyedi Next.js", desc: "Prémium fejlesztések összetett üzleti folyamatokhoz." },
];

const PROCESS = [
  { step: "01", title: "Igényfelmérés", desc: "Megismerjük a vállalkozásod, célközönséged és üzleti céljaid." },
  { step: "02", title: "Tervezés", desc: "Átlátható struktúra és letisztult design minden képernyőre." },
  { step: "03", title: "Fejlesztés", desc: "Gyors, biztonságos és keresőbarát kód, mobil elsőként." },
  { step: "04", title: "Átadás", desc: "Betanítás, dokumentáció és hosszú távú támogatás." },
];

const PORTFOLIO = [
  { title: "Fogorvosi rendelő", industry: "Egészségügy", cat: "Egészségügy", desc: "Bizalomépítő oldal online időpontfoglalással." },
  { title: "Étterem és bár", industry: "Vendéglátás", cat: "Vendéglátás", desc: "Modern menükártya foglalással, mobilra hangolva." },
  { title: "Ügyvédi iroda", industry: "Jogi szolgáltatás", cat: "Céges oldal", desc: "Prémium bemutatkozás, szakterületek egy kattintásra." },
  { title: "Food truck brand", industry: "Vendéglátás", cat: "Vendéglátás", desc: "Élénk brand-oldal helyszín-térképpel és heti menüvel." },
  { title: "Könyvelőiroda", industry: "Pénzügy", cat: "Céges oldal", desc: "Átlátható szolgáltatás-portfólió, ajánlatkérővel." },
  { title: "Boutique szálláshely", industry: "Turizmus", cat: "Céges oldal", desc: "Vizuális, foglalás-orientált galériával." },
];

const PORTFOLIO_CATS = ["Összes", "Céges oldal", "Vendéglátás", "Egészségügy", "Webshop"] as const;

const WHY = [
  "Egyedi, modern megjelenés",
  "Gyors és átlátható munkafolyamat",
  "Mobilra optimalizált kialakítás",
  "Könnyen kezelhető adminfelület",
  "Magyar nyelvű támogatás",
  "Hosszú távú együttműködés",
];

const TESTIMONIALS = [
  { name: "Kovács Anna", role: "Ügyvezető, minta vállalkozás", text: "A PandaDesign csapata figyelmes és profi volt, az új weboldalunk sokkal áttekinthetőbb lett, és több érdeklődő is érkezik rajta keresztül." },
  { name: "Nagy Péter", role: "Tulajdonos, minta étterem", text: "Gyorsan, világosan kommunikáltak, és a menünk mostantól mobilon is jól kezelhető. Az online foglalás bevezetése óta több a vendégünk." },
  { name: "Szabó Eszter", role: "Marketing vezető, minta cég", text: "A projekt minden szakaszában tudtuk, hol tartunk. Az új oldal gyors, letisztult, és könnyen tudjuk mi magunk is szerkeszteni." },
];

const FAQS = [
  { q: "Mennyi idő alatt készül el egy weboldal?", a: "A tipikus átfutási idő 2–6 hét a projekt összetettségétől és a tartalom rendelkezésre állásától függően. A pontos ütemezést a kezdeti egyeztetés során rögzítjük." },
  { q: "Mennyibe kerül egy weboldal?", a: "A landing oldalak 69 000 Ft-tól, a klasszikus céges weboldalak 119 000 Ft-tól, a nagyobb prezentációs oldalak 199 000 Ft-tól, a webshopok pedig 299 000 Ft-tól indulnak. A végleges ár az egyedi igényektől függ." },
  { q: "Nekem kell biztosítanom a szöveget és a képeket?", a: "Alapesetben igen, de segítünk a struktúrálásban, és opcióként copywritinget, valamint képválogatást is vállalunk." },
  { q: "Mobiltelefonon is jól fog működni?", a: "Igen, minden általunk készített oldal mobilra optimalizált, és a Google Core Web Vitals szempontjait is figyelembe vesszük." },
  { q: "Később én is tudom szerkeszteni?", a: "Igen. WordPress alapú oldalaknál egyszerű adminfelületet kapsz, egyedi fejlesztéseknél pedig a projekthez illeszkedő szerkesztőt biztosítunk." },
  { q: "Vállaltok karbantartást?", a: "Igen, havi karbantartási csomagokat is kínálunk: frissítések, biztonsági mentések, kisebb tartalmi módosítások." },
  { q: "Tudtok webáruházat is készíteni?", a: "Igen, WooCommerce vagy egyedi megoldás alapján is készítünk webshopokat online fizetéssel és szállítási integrációval." },
  { q: "Mi történik az átadás után?", a: "Betanítást, dokumentációt és opcionális karbantartási csomagot biztosítunk, hogy hosszú távon is biztonságban tudd az oldalad." },
];

type HeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
};

const DEFAULT_HERO: HeroContent = {
  eyebrow: "Magyar web ügynökség",
  title: "Weboldalak, amelyek ügyfeleket hoznak.",
  description:
    "Gyors, mobilbarát és átlátható oldalak magyar vállalkozásoknak – az ötlettől a hosszú távú üzemeltetésig.",
  primaryButtonText: "Díjmentes konzultáció",
  primaryButtonUrl: "/kapcsolat",
  secondaryButtonText: "Referenciák",
  secondaryButtonUrl: "/referenciak",
};

function Home() {
  return (
    <>
      <HeroSection />
      <TrustSection />
      <ServicesSection />
      <ProcessSection />
      <PortfolioSection />
      <PricingSection />
      <WhySection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTA />
    </>
  );
}

function HeroSection() {
  const [hero, setHero] = useState<HeroContent>(DEFAULT_HERO);

  useEffect(() => {
    let active = true;

    async function loadHero() {
      const { data, error } = await supabase
        .from("page_sections")
        .select("content")
        .eq("page_slug", "home")
        .eq("section_key", "hero")
        .maybeSingle();

      if (!active) {
        return;
      }

      if (error) {
        console.error("A Hero tartalma nem tölthető be:", error);
        return;
      }

      if (data?.content) {
        setHero({
          ...DEFAULT_HERO,
          ...(data.content as Partial<HeroContent>),
        });
      }
    }

    void loadHero();

    return () => {
      active = false;
    };
  }, []);

  const titleWords = hero.title.trim().split(/\s+/);
  const highlightedTitle =
    titleWords.length > 2 ? titleWords.slice(-2).join(" ") : hero.title;
  const normalTitle =
    titleWords.length > 2 ? titleWords.slice(0, -2).join(" ") : "";

  return (
    <section className="relative overflow-hidden pt-14 md:pt-24 pb-16 md:pb-28">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_80%_-10%,color-mix(in_oklab,var(--brand)_10%,transparent),transparent),radial-gradient(800px_500px_at_-10%_10%,color-mix(in_oklab,var(--success)_8%,transparent),transparent)]"
      />

      <div className="container-page grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-medium text-ink-soft shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            {hero.eyebrow}
          </div>

          <h1 className="mt-5 text-[40px] leading-[1.05] sm:text-5xl lg:text-[64px] font-bold tracking-tight text-ink">
            {normalTitle && `${normalTitle} `}
            <span className="text-brand">{highlightedTitle}</span>
          </h1>

          <p className="mt-5 text-base md:text-lg text-ink-soft max-w-xl leading-relaxed">
            {hero.description}
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            {hero.primaryButtonText && hero.primaryButtonUrl && (
              <Button asChild size="lg" variant="cta">
                <a href={hero.primaryButtonUrl}>
                  {hero.primaryButtonText}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            )}

            {hero.secondaryButtonText && hero.secondaryButtonUrl && (
              <Button asChild size="lg" variant="outline">
                <a href={hero.secondaryButtonUrl}>
                  {hero.secondaryButtonText}
                </a>
              </Button>
            )}
          </div>

          <ul className="mt-8 md:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TRUST.map((t) => (
              <li
                key={t.label}
                className="flex items-center gap-2 text-xs sm:text-sm text-ink-soft"
              >
                <span className="grid h-7 w-7 place-items-center rounded-md bg-success-soft text-success shrink-0">
                  <t.icon className="h-3.5 w-3.5" />
                </span>

                <span className="truncate">{t.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative order-first lg:order-last">
          <BrowserMockup />
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  const items = [
    { icon: Sparkles, title: "Professzionális megjelenés", desc: "Letisztult, modern arculat, ami első pillantásra bizalmat épít." },
    { icon: TrendingUp, title: "Több érdeklődő", desc: "Világos üzenetek és jó helyen elhelyezett CTA-k – konverzióra hangolva." },
    { icon: Globe, title: "Erősebb online jelenlét", desc: "Keresőbarát felépítés, mobil-optimalizáció, mérhető eredmények." },
  ];
  return (
    <Section
      eyebrow="Miért fontos"
      title="Az első benyomás ma online születik"
      description="A látogatók pár másodperc alatt döntenek. Egy letisztult weboldal ezt az első benyomást fordítja eredményre."
      tone="muted"
    >
      <div className="grid md:grid-cols-3 gap-4 md:gap-5">
        {items.map((i) => (
          <Card key={i.title} className="border shadow-soft h-full">
            <CardContent className="p-7 md:p-8 h-full flex flex-col">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
                <i.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">{i.title}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">{i.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function ServicesSection() {
  return (
    <Section eyebrow="Szolgáltatások" title="Miben segítünk?" description="Egy helyen minden, ami egy modern online jelenléthez kell.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {SERVICES.map((s) => (
          <Card key={s.title} className="group border shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all h-full">
            <CardContent className="p-7 h-full flex flex-col">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-brand-foreground">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed flex-1">{s.desc}</p>
              <Link
                to="/szolgaltatasok"
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand group-hover:gap-2 transition-all self-start"
              >
                Részletek <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function ProcessSection() {
  return (
    <Section eyebrow="Folyamat" title="Így dolgozunk" description="Négy egyszerű lépés az ötlettől az élesítésig." tone="muted">
      <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {PROCESS.map((p, i) => (
          <li key={p.step} className="relative rounded-2xl bg-white border p-7 shadow-soft h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-success tracking-widest">{p.step}</span>
              {i < PROCESS.length - 1 && (
                <span aria-hidden className="hidden lg:block h-px w-8 bg-ink/10" />
              )}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-ink">{p.title}</h3>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed">{p.desc}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function PortfolioSection() {
  return (
    <Section eyebrow="Munkáink" title="Válogatott munkáink" description="Az alábbi projektek helyőrző referenciák – éles ügyféladatokkal cseréljük őket.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {PORTFOLIO.map((p) => (
          <PortfolioCard key={p.title} {...p} />
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <Button asChild variant="outline">
          <Link to="/referenciak">Minden projekt <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </Section>
  );
}

function PortfolioCard({ title, industry, desc }: { title: string; industry: string; desc: string }) {
  return (
    <Card className="overflow-hidden border shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all group h-full flex flex-col">
      <div className="aspect-[16/10] relative overflow-hidden bg-gradient-to-br from-brand/8 via-brand/4 to-success/8 border-b">
        <div className="absolute inset-5 rounded-lg bg-white shadow-soft overflow-hidden">
          <div className="h-4 border-b bg-secondary/40 flex items-center gap-1 px-2">
            <span className="h-1 w-1 rounded-full bg-ink/20" />
            <span className="h-1 w-1 rounded-full bg-ink/20" />
          </div>
          <div className="p-3 space-y-1.5">
            <div className="h-1.5 w-3/4 rounded-full bg-ink/70" />
            <div className="h-1.5 w-1/2 rounded-full bg-ink/20" />
            <div className="grid grid-cols-3 gap-1 pt-2">
              <div className="aspect-square rounded bg-success/25" />
              <div className="aspect-square rounded bg-brand/20" />
              <div className="aspect-square rounded bg-ink/10" />
            </div>
          </div>
        </div>
        <span className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
          Minta
        </span>
      </div>
      <CardContent className="p-6 flex-1 flex flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">{industry}</p>
        <h3 className="mt-1.5 text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-2 text-sm text-ink-soft leading-relaxed flex-1">{desc}</p>
        <Link to="/referenciak" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:gap-2 transition-all self-start">
          Projekt megnyitása <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

function PricingSection() {
  const plans = [
    { name: "Landing", price: "69 000", desc: "Egyoldalas kampányoldal", features: ["Egyoldalas felépítés", "Reszponzív dizájn", "Kapcsolatfelvételi űrlap", "Alap SEO beállítás", "Közösségi média linkek"] },
    { name: "Basic", price: "119 000", desc: "Klasszikus bemutatkozó oldal", features: ["Max. 5 aloldal", "Reszponzív dizájn", "Kapcsolatfelvételi űrlap", "Alap SEO", "Analitika beállítás", "Könnyű adminisztráció"] },
    { name: "Medium", price: "199 000", desc: "Bővített prezentációs oldal", featured: true, features: ["Max. 10 aloldal", "Egyedi dizájn", "Blog modul", "Speciális űrlapok", "Sebesség-optimalizálás", "Analitika", "Alap technikai SEO", "Betanítás és átadás"] },
    { name: "Webshop", price: "299 000", desc: "Modern online áruház", features: ["Termékkatalógus", "Kosár funkció", "Online fizetés integráció", "Szállítási opciók", "Rendeléskezelés", "Alap webshop betanítás"] },
  ];
  return (
    <Section eyebrow="Árak" title="Átlátható csomagok" description="Válaszd ki a hozzád illő csomagot – a végleges ár a projekt komplexitásától függ.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {plans.map((p) => (
          <Card
            key={p.name}
            className={`relative border shadow-soft h-full flex flex-col ${p.featured ? "border-brand border-2 shadow-elegant lg:scale-[1.02]" : ""}`}
          >
            {p.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-success text-success-foreground px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                Legnépszerűbb
              </span>
            )}
            <CardContent className="p-7 flex flex-col h-full">
              <p className="text-sm font-semibold text-brand">{p.name}</p>
              <p className="mt-1 text-xs text-ink-soft min-h-8">{p.desc}</p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-ink tracking-tight">{p.price} Ft</span>
              </p>
              <p className="text-xs text-ink-soft mt-0.5">-tól, +ÁFA</p>
              <ul className="mt-6 space-y-2.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full" variant={p.featured ? "cta" : "outline"}>
                <Link to="/kapcsolat">Ajánlatot kérek</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-ink-soft">
        A végleges ár a projekt összetettségétől és az egyedi igényektől függ. <Link to="/arak" className="text-brand font-semibold hover:underline">Részletes összehasonlítás →</Link>
      </p>
    </Section>
  );
}

function WhySection() {
  return (
    <Section eyebrow="Miért mi" title="Miért a PandaDesign?" tone="muted">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {WHY.map((w) => (
          <div key={w} className="flex items-center gap-3 rounded-xl bg-white border p-5 shadow-soft h-full">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-success-soft text-success shrink-0">
              <Check className="h-4 w-4" />
            </span>
            <p className="text-sm font-medium text-ink">{w}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function TestimonialsSection() {
  return (
    <Section eyebrow="Vélemények" title="Ügyfeleink véleménye" description="Az alábbi vélemények minta tartalmak, élesítés előtt valós visszajelzésekkel cseréljük.">
      <div className="grid md:grid-cols-3 gap-4 md:gap-5">
        {TESTIMONIALS.map((t) => (
          <Card key={t.name} className="border shadow-soft h-full">
            <CardContent className="p-7 h-full flex flex-col">
              <MessageSquare className="h-6 w-6 text-brand" />
              <p className="mt-4 text-ink leading-relaxed flex-1">„{t.text}"</p>
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-semibold text-ink">{t.name}</p>
                <p className="text-xs text-ink-soft mt-0.5">{t.role}</p>
                <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-widest text-ink-soft/70">Minta tartalom</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function FAQSection() {
  return (
    <Section eyebrow="Kérdések" title="Gyakori kérdések">
      <div className="max-w-3xl">
        <Accordion type="single" collapsible className="space-y-2.5">
          {FAQS.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`} className="border rounded-xl bg-white px-5 md:px-6 shadow-soft">
              <AccordionTrigger className="text-left font-semibold text-ink hover:no-underline py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-ink-soft leading-relaxed pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

function FinalCTA() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-brand text-brand-foreground p-8 md:p-16 shadow-elegant">
          <div
            aria-hidden
            className="absolute inset-0 -z-0 opacity-40 bg-[radial-gradient(600px_300px_at_100%_0%,color-mix(in_oklab,var(--success)_50%,transparent),transparent)]"
          />
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              <Users className="h-3.5 w-3.5" /> Ingyenes konzultáció
            </div>
            <h2 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Készen állsz egy jobb weboldalra?
            </h2>
            <p className="mt-4 text-brand-foreground/80 text-base md:text-lg">
              Beszéljük át az elképzelésedet egy kötelezettségmentes konzultáción.
            </p>
            <Button asChild size="lg" variant="cta" className="mt-8">
              <Link to="/kapcsolat">Ajánlatot kérek <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
