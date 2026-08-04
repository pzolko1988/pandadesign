import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Smartphone,
  Zap,
  Search,
  Settings,
  Layers,
  ShoppingBag,
  RefreshCw,
  LifeBuoy,
  Code2,
  Sparkles,
  Users,
  TrendingUp,
  Globe,
  MessageSquare,
  Star,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section } from "@/components/site/Section";
import { BrowserMockup } from "@/components/site/BrowserMockup";
import { fetchPublicHomeSeoData } from "@/lib/public-home-seo";
import { buildSeoHead } from "@/lib/seo";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/")({
  loader: () => fetchPublicHomeSeoData(),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {};
    }

    const title =
      loaderData.settings.default_meta_title.trim() ||
      "PandaDesign — Modern weboldalak, amelyek ügyfeleket szereznek";
    const description =
      loaderData.settings.default_meta_description.trim() ||
      "Modern, gyors és keresőbarát weboldalak magyar vállalkozásoknak.";
    const jsonLd =
      loaderData.faqs.length > 0
        ? {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: loaderData.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }
        : undefined;

    return buildSeoHead({
      title,
      description,
      path: "/",
      image: loaderData.ogImageUrl || undefined,
      type: "website",
      jsonLd,
    });
  },
  component: Home,
});

const TRUST = [
  { icon: Smartphone, label: "Mobilbarát" },
  { icon: Zap, label: "Gyors betöltés" },
  { icon: Search, label: "Keresőbarát" },
  { icon: Settings, label: "Könnyen kezelhető" },
];

type ServiceItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon_key: string;
  link_url: string;
  sort_order: number;
  is_visible: boolean;
};

const SERVICE_ICONS: Record<string, LucideIcon> = {
  layers: Layers,
  sparkles: Sparkles,
  "shopping-bag": ShoppingBag,
  refresh: RefreshCw,
  "life-buoy": LifeBuoy,
  code: Code2,
};

const WHY_ICONS: Record<string, LucideIcon> = {
  check: Check,
  sparkles: Sparkles,
  zap: Zap,
  smartphone: Smartphone,
  settings: Settings,
  "message-square": MessageSquare,
  refresh: RefreshCw,
};

const FINAL_CTA_ICONS: Record<string, LucideIcon> = {
  users: Users,
  "message-square": MessageSquare,
  sparkles: Sparkles,
  rocket: Rocket,
};

type ProcessStep = {
  id: string;
  step_number: string;
  title: string;
  description: string;
  sort_order: number;
  is_visible: boolean;
};

type PortfolioProject = {
  id: string;
  slug: string;
  title: string;
  industry: string;
  category: string;
  description: string;
  image_path: string | null;
  project_url: string;
  sort_order: number;
  is_concept: boolean;
  is_visible: boolean;
};

type PricingPackage = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_label: string;
  currency: string;
  price_suffix: string;
  badge_text: string;
  cta_text: string;
  cta_url: string;
  features: string[];
  sort_order: number;
  is_featured: boolean;
  is_visible: boolean;
};

type WhySectionSettings = {
  id: number;
  eyebrow: string;
  title: string;
  description: string;
  is_visible: boolean;
};

type WhyItem = {
  id: string;
  title: string;
  description: string;
  icon_key: string;
  sort_order: number;
  is_visible: boolean;
};

const DEFAULT_WHY_SECTION: WhySectionSettings = {
  id: 1,
  eyebrow: "Miért mi",
  title: "Miért a PandaDesign?",
  description: "",
  is_visible: true,
};

const DEFAULT_WHY_ITEMS: WhyItem[] = [
  {
    id: "fallback-why-1",
    title: "Egyedi, modern megjelenés",
    description: "",
    icon_key: "sparkles",
    sort_order: 10,
    is_visible: true,
  },
  {
    id: "fallback-why-2",
    title: "Gyors és átlátható munkafolyamat",
    description: "",
    icon_key: "zap",
    sort_order: 20,
    is_visible: true,
  },
  {
    id: "fallback-why-3",
    title: "Mobilra optimalizált kialakítás",
    description: "",
    icon_key: "smartphone",
    sort_order: 30,
    is_visible: true,
  },
  {
    id: "fallback-why-4",
    title: "Könnyen kezelhető adminfelület",
    description: "",
    icon_key: "settings",
    sort_order: 40,
    is_visible: true,
  },
  {
    id: "fallback-why-5",
    title: "Magyar nyelvű támogatás",
    description: "",
    icon_key: "message-square",
    sort_order: 50,
    is_visible: true,
  },
  {
    id: "fallback-why-6",
    title: "Hosszú távú együttműködés",
    description: "",
    icon_key: "refresh",
    sort_order: 60,
    is_visible: true,
  },
];

type TestimonialSectionSettings = {
  id: number;
  eyebrow: string;
  title: string;
  description: string;
  is_visible: boolean;
};

type Testimonial = {
  id: string;
  name: string;
  role: string;
  testimonial_text: string;
  rating: number;
  is_sample: boolean;
  sort_order: number;
  is_visible: boolean;
};

const DEFAULT_TESTIMONIAL_SECTION: TestimonialSectionSettings = {
  id: 1,
  eyebrow: "Vélemények",
  title: "Ügyfeleink véleménye",
  description:
    "Az alábbi vélemények minta tartalmak, élesítés előtt valós visszajelzésekkel cseréljük.",
  is_visible: true,
};

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "fallback-testimonial-1",
    name: "Kovács Anna",
    role: "Ügyvezető, minta vállalkozás",
    testimonial_text:
      "A PandaDesign csapata figyelmes és profi volt, az új weboldalunk sokkal áttekinthetőbb lett, és több érdeklődő is érkezik rajta keresztül.",
    rating: 5,
    is_sample: true,
    sort_order: 10,
    is_visible: true,
  },
  {
    id: "fallback-testimonial-2",
    name: "Nagy Péter",
    role: "Tulajdonos, minta étterem",
    testimonial_text:
      "Gyorsan, világosan kommunikáltak, és a menünk mostantól mobilon is jól kezelhető. Az online foglalás bevezetése óta több a vendégünk.",
    rating: 5,
    is_sample: true,
    sort_order: 20,
    is_visible: true,
  },
  {
    id: "fallback-testimonial-3",
    name: "Szabó Eszter",
    role: "Marketingvezető, minta cég",
    testimonial_text:
      "A projekt minden szakaszában tudtuk, hol tartunk. Az új oldal gyors, letisztult, és könnyen tudjuk mi magunk is szerkeszteni.",
    rating: 5,
    is_sample: true,
    sort_order: 30,
    is_visible: true,
  },
];
type FaqItem = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
};

const DEFAULT_FAQS = [
  {
    q: "Mennyi idő alatt készül el egy weboldal?",
    a: "A tipikus átfutási idő 2–6 hét a projekt összetettségétől és a tartalom rendelkezésre állásától függően. A pontos ütemezést a kezdeti egyeztetés során rögzítjük.",
  },
  {
    q: "Mennyibe kerül egy weboldal?",
    a: "A landing oldalak 69 000 Ft-tól, a klasszikus céges weboldalak 119 000 Ft-tól, a nagyobb prezentációs oldalak 199 000 Ft-tól, a webshopok pedig 299 000 Ft-tól indulnak. A végleges ár az egyedi igényektől függ.",
  },
  {
    q: "Nekem kell biztosítanom a szöveget és a képeket?",
    a: "Alapesetben igen, de segítünk a struktúrálásban, és opcióként copywritinget, valamint képválogatást is vállalunk.",
  },
  {
    q: "Mobiltelefonon is jól fog működni?",
    a: "Igen, minden általunk készített oldal mobilra optimalizált, és a Google Core Web Vitals szempontjait is figyelembe vesszük.",
  },
  {
    q: "Később én is tudom szerkeszteni?",
    a: "Igen. WordPress alapú oldalaknál egyszerű adminfelületet kapsz, egyedi fejlesztéseknél pedig a projekthez illeszkedő szerkesztőt biztosítunk.",
  },
  {
    q: "Vállaltok karbantartást?",
    a: "Igen, havi karbantartási csomagokat is kínálunk: frissítések, biztonsági mentések, kisebb tartalmi módosítások.",
  },
  {
    q: "Tudtok webáruházat is készíteni?",
    a: "Igen, WooCommerce vagy egyedi megoldás alapján is készítünk webshopokat online fizetéssel és szállítási integrációval.",
  },
  {
    q: "Mi történik az átadás után?",
    a: "Betanítást, dokumentációt és opcionális karbantartási csomagot biztosítunk, hogy hosszú távon is biztonságban tudd az oldalad.",
  },
];

type FinalCtaSettings = {
  id: number;
  badge_text: string;
  title: string;
  description: string;
  button_text: string;
  button_url: string;
  icon_key: string;
  is_visible: boolean;
};

const DEFAULT_FINAL_CTA: FinalCtaSettings = {
  id: 1,
  badge_text: "Ingyenes konzultáció",
  title: "Készen állsz egy jobb weboldalra?",
  description:
    "Beszéljük át az elképzelésedet egy kötelezettségmentes konzultáción.",
  button_text: "Ajánlatot kérek",
  button_url: "/kapcsolat",
  icon_key: "users",
  is_visible: true,
};

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
                <a href={hero.secondaryButtonUrl}>{hero.secondaryButtonText}</a>
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
    {
      icon: Sparkles,
      title: "Professzionális megjelenés",
      desc: "Letisztult, modern arculat, ami első pillantásra bizalmat épít.",
    },
    {
      icon: TrendingUp,
      title: "Több érdeklődő",
      desc: "Világos üzenetek és jó helyen elhelyezett CTA-k – konverzióra hangolva.",
    },
    {
      icon: Globe,
      title: "Erősebb online jelenlét",
      desc: "Keresőbarát felépítés, mobil-optimalizáció, mérhető eredmények.",
    },
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
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                {i.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function ServicesSection() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadServices() {
      const { data, error } = await supabase
        .from("services")
        .select(
          "id, slug, title, description, icon_key, link_url, sort_order, is_visible",
        )
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (!active) {
        return;
      }

      if (error) {
        console.error("A szolgáltatások nem tölthetők be:", error);
        setErrorMessage("A szolgáltatások átmenetileg nem tölthetők be.");
        setLoading(false);
        return;
      }

      setServices((data ?? []) as ServiceItem[]);
      setLoading(false);
    }

    void loadServices();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Section
      eyebrow="Szolgáltatások"
      title="Miben segítünk?"
      description="Egy helyen minden, ami egy modern online jelenléthez kell."
    >
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-2xl border bg-secondary/40"
            />
          ))}
        </div>
      )}

      {!loading && errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {!loading && !errorMessage && services.length === 0 && (
        <div className="rounded-2xl border bg-white p-8 text-center text-ink-soft shadow-soft">
          Jelenleg nincs megjeleníthető szolgáltatás.
        </div>
      )}

      {!loading && !errorMessage && services.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {services.map((service) => {
            const Icon = SERVICE_ICONS[service.icon_key] ?? Layers;

            return (
              <Card
                key={service.id}
                className="group border shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all h-full"
              >
                <CardContent className="p-7 h-full flex flex-col">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-brand-foreground">
                    <Icon className="h-5 w-5" />
                  </span>

                  <h3 className="mt-5 text-lg font-semibold text-ink">
                    {service.title}
                  </h3>

                  <p className="mt-2 text-sm text-ink-soft leading-relaxed flex-1">
                    {service.description}
                  </p>

                  <a
                    href={service.link_url || "/szolgaltatasok"}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand group-hover:gap-2 transition-all self-start"
                  >
                    Részletek <ArrowRight className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </Section>
  );
}

function ProcessSection() {
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSteps() {
      const { data, error } = await supabase
        .from("process_steps")
        .select("id, step_number, title, description, sort_order, is_visible")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (!active) {
        return;
      }

      if (error) {
        console.error("A munkafolyamat nem tölthető be:", error);
        setErrorMessage("A munkafolyamat átmenetileg nem tölthető be.");
        setLoading(false);
        return;
      }

      setSteps((data ?? []) as ProcessStep[]);
      setLoading(false);
    }

    void loadSteps();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Section
      eyebrow="Folyamat"
      title="Így dolgozunk"
      description="Négy egyszerű lépés az ötlettől az élesítésig."
      tone="muted"
    >
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-2xl border bg-white/70"
            />
          ))}
        </div>
      )}

      {!loading && errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {!loading && !errorMessage && steps.length === 0 && (
        <div className="rounded-2xl border bg-white p-8 text-center text-ink-soft shadow-soft">
          Jelenleg nincs megjeleníthető munkafolyamat-lépés.
        </div>
      )}

      {!loading && !errorMessage && steps.length > 0 && (
        <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className="relative rounded-2xl bg-white border p-7 shadow-soft h-full"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-success tracking-widest">
                  {step.step_number}
                </span>

                {index < steps.length - 1 && (
                  <span
                    aria-hidden
                    className="hidden lg:block h-px w-8 bg-ink/10"
                  />
                )}
              </div>

              <h3 className="mt-4 text-lg font-semibold text-ink">
                {step.title}
              </h3>

              <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}

function PortfolioSection() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, slug, title, industry, category, description, image_path, project_url, sort_order, is_concept, is_visible",
        )
        .eq("is_visible", true)
        .eq("status", "published")
        .order("sort_order", { ascending: true })
        .limit(6);

      if (!active) {
        return;
      }

      if (error) {
        console.error("A referenciák nem tölthetők be:", error);
        setErrorMessage("A referenciák átmenetileg nem tölthetők be.");
        setLoading(false);
        return;
      }

      setProjects((data ?? []) as PortfolioProject[]);
      setLoading(false);
    }

    void loadProjects();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Section
      eyebrow="Munkáink"
      title="Válogatott munkáink"
      description="Koncepcióprojektek és elkészült ügyfélmunkák egy helyen."
    >
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-2xl border bg-secondary/40"
            />
          ))}
        </div>
      )}

      {!loading && errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {!loading && !errorMessage && projects.length === 0 && (
        <div className="rounded-2xl border bg-white p-8 text-center text-ink-soft shadow-soft">
          Jelenleg nincs megjeleníthető referencia.
        </div>
      )}

      {!loading && !errorMessage && projects.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {projects.map((project) => (
            <PortfolioCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <div className="mt-10 flex justify-center">
        <Button asChild variant="outline">
          <Link to="/referenciak">
            Minden projekt <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}

function PortfolioCard({ project }: { project: PortfolioProject }) {
  const imageUrl = project.image_path
    ? supabase.storage.from("portfolio").getPublicUrl(project.image_path).data
        .publicUrl
    : "";

  return (
    <Card className="overflow-hidden border shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all group h-full flex flex-col">
      <div className="aspect-[16/10] relative overflow-hidden bg-gradient-to-br from-brand/8 via-brand/4 to-success/8 border-b">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
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
        )}

        {project.is_concept && (
          <span className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
            Koncepció
          </span>
        )}
      </div>

      <CardContent className="p-6 flex-1 flex flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">
          {project.industry}
        </p>

        <h3 className="mt-1.5 text-lg font-semibold text-ink">
          {project.title}
        </h3>

        <p className="mt-2 text-sm text-ink-soft leading-relaxed flex-1">
          {project.description}
        </p>

        <Link
          to="/referenciak/$slug"
          params={{
            slug: project.slug,
          }}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:gap-2 transition-all self-start"
        >
          Projekt részletei <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

function PricingSection() {
  const [plans, setPlans] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPricing() {
      const { data, error } = await supabase
        .from("pricing_packages")
        .select(
          "id, slug, name, description, price_label, currency, price_suffix, badge_text, cta_text, cta_url, features, sort_order, is_featured, is_visible",
        )
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (!active) {
        return;
      }

      if (error) {
        console.error("Az árcsomagok nem tölthetők be:", error);
        setErrorMessage("Az árcsomagok átmenetileg nem tölthetők be.");
        setLoading(false);
        return;
      }

      setPlans(
        (data ?? []).map((item) => ({
          ...item,
          features: Array.isArray(item.features)
            ? (item.features as string[])
            : [],
        })) as PricingPackage[],
      );
      setLoading(false);
    }

    void loadPricing();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Section
      eyebrow="Árak"
      title="Átlátható csomagok"
      description="Válaszd ki a hozzád illő csomagot – a végleges ár a projekt komplexitásától függ."
    >
      {loading && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[470px] animate-pulse rounded-2xl border bg-secondary/40"
            />
          ))}
        </div>
      )}

      {!loading && errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {!loading && !errorMessage && plans.length === 0 && (
        <div className="rounded-2xl border bg-white p-8 text-center text-ink-soft shadow-soft">
          Jelenleg nincs megjeleníthető árcsomag.
        </div>
      )}

      {!loading && !errorMessage && plans.length > 0 && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative border shadow-soft h-full flex flex-col ${
                plan.is_featured
                  ? "border-brand border-2 shadow-elegant xl:scale-[1.02]"
                  : ""
              }`}
            >
              {plan.is_featured && plan.badge_text && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-success text-success-foreground px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  {plan.badge_text}
                </span>
              )}

              <CardContent className="p-7 flex flex-col h-full">
                <p className="text-sm font-semibold text-brand">{plan.name}</p>

                <p className="mt-1 text-xs text-ink-soft min-h-8">
                  {plan.description}
                </p>

                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-ink tracking-tight">
                    {plan.price_label}
                  </span>

                  {plan.currency && (
                    <span className="text-lg font-semibold text-ink">
                      {plan.currency}
                    </span>
                  )}
                </p>

                {plan.price_suffix && (
                  <p className="text-xs text-ink-soft mt-0.5">
                    {plan.price_suffix}
                  </p>
                )}

                <ul className="mt-6 space-y-2.5 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-ink-soft"
                    >
                      <Check className="h-4 w-4 mt-0.5 shrink-0 text-success" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className="mt-6 w-full"
                  variant={plan.is_featured ? "cta" : "outline"}
                >
                  <a href={plan.cta_url || "/kapcsolat"}>
                    {plan.cta_text || "Ajánlatot kérek"}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-sm text-ink-soft">
        A végleges ár a projekt összetettségétől és az egyedi igényektől függ.{" "}
        <Link to="/arak" className="text-brand font-semibold hover:underline">
          Részletes összehasonlítás →
        </Link>
      </p>
    </Section>
  );
}

function WhySection() {
  const [section, setSection] =
    useState<WhySectionSettings>(DEFAULT_WHY_SECTION);
  const [items, setItems] = useState<WhyItem[]>(DEFAULT_WHY_ITEMS);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadWhySection() {
      const [
        { data: settingsData, error: settingsError },
        { data: itemsData, error: itemsError },
      ] = await Promise.all([
        supabase
          .from("why_section_settings")
          .select("id, eyebrow, title, description, is_visible")
          .eq("id", 1)
          .maybeSingle(),
        supabase
          .from("why_items")
          .select("id, title, description, icon_key, sort_order, is_visible")
          .eq("is_visible", true)
          .order("sort_order", { ascending: true }),
      ]);

      if (!active) {
        return;
      }

      if (settingsError || itemsError) {
        console.error(
          "A „Miért a PandaDesign?” szekció nem tölthető be:",
          settingsError ?? itemsError,
        );

        setErrorMessage(
          "A friss tartalom átmenetileg nem tölthető be. A tartalék elemeket jelenítjük meg.",
        );
        setLoading(false);
        return;
      }

      if (settingsData) {
        setSection(settingsData as WhySectionSettings);
      }

      setItems((itemsData ?? []) as WhyItem[]);
      setErrorMessage("");
      setLoading(false);
    }

    void loadWhySection();

    return () => {
      active = false;
    };
  }, []);

  if (!loading && !section.is_visible) {
    return null;
  }

  return (
    <Section
      eyebrow={section.eyebrow}
      title={section.title}
      description={section.description || undefined}
      tone="muted"
    >
      {loading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 md:gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl border bg-white/70"
            />
          ))}
        </div>
      )}

      {!loading && errorMessage && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errorMessage}
        </p>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-ink-soft shadow-soft">
          Jelenleg nincs megjeleníthető előny.
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 md:gap-4">
          {items.map((item) => {
            const Icon = WHY_ICONS[item.icon_key] ?? Check;

            return (
              <div
                key={item.id}
                className="flex h-full gap-4 rounded-xl border bg-white p-5 shadow-soft"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-success-soft text-success">
                  <Icon className="h-4 w-4" />
                </span>

                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

function TestimonialsSection() {
  const [section, setSection] = useState<TestimonialSectionSettings>(
    DEFAULT_TESTIMONIAL_SECTION,
  );
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTestimonials() {
      const [
        { data: settingsData, error: settingsError },
        { data: testimonialsData, error: testimonialsError },
      ] = await Promise.all([
        supabase
          .from("testimonial_section_settings")
          .select("id, eyebrow, title, description, is_visible")
          .eq("id", 1)
          .maybeSingle(),
        supabase
          .from("testimonials")
          .select(
            "id, name, role, testimonial_text, rating, is_sample, sort_order, is_visible",
          )
          .eq("is_visible", true)
          .order("sort_order", { ascending: true }),
      ]);

      if (!active) {
        return;
      }

      if (settingsError || testimonialsError) {
        console.error(
          "A véleményszekció nem tölthető be:",
          settingsError ?? testimonialsError,
        );

        setErrorMessage(
          "A friss vélemények átmenetileg nem tölthetők be. A tartalék elemeket jelenítjük meg.",
        );
        setLoading(false);
        return;
      }

      if (settingsData) {
        setSection(settingsData as TestimonialSectionSettings);
      }

      setTestimonials((testimonialsData ?? []) as Testimonial[]);
      setErrorMessage("");
      setLoading(false);
    }

    void loadTestimonials();

    return () => {
      active = false;
    };
  }, []);

  if (!loading && !section.is_visible) {
    return null;
  }

  return (
    <Section
      eyebrow={section.eyebrow}
      title={section.title}
      description={section.description || undefined}
    >
      {loading && (
        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-2xl border bg-secondary/40"
            />
          ))}
        </div>
      )}

      {!loading && errorMessage && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errorMessage}
        </p>
      )}

      {!loading && testimonials.length === 0 && (
        <div className="rounded-2xl border bg-white p-8 text-center text-sm text-ink-soft shadow-soft">
          Jelenleg nincs megjeleníthető ügyfélvélemény.
        </div>
      )}

      {!loading && testimonials.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="h-full border shadow-soft">
              <CardContent className="flex h-full flex-col p-7">
                <div className="flex items-center justify-between gap-4">
                  <MessageSquare className="h-6 w-6 text-brand" />

                  <div
                    className="flex items-center gap-1"
                    aria-label={`${testimonial.rating} csillagos értékelés`}
                  >
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className={`h-4 w-4 ${
                          starIndex < testimonial.rating
                            ? "fill-current text-amber-500"
                            : "text-ink-soft/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="mt-4 flex-1 whitespace-pre-line leading-relaxed text-ink">
                  „{testimonial.testimonial_text}”
                </p>

                <div className="mt-6 border-t pt-6">
                  <p className="text-sm font-semibold text-ink">
                    {testimonial.name}
                  </p>

                  {testimonial.role && (
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {testimonial.role}
                    </p>
                  )}

                  {testimonial.is_sample && (
                    <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-widest text-ink-soft/70">
                      Minta tartalom
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}

function FAQSection() {
  const fallbackFaqs: FaqItem[] = DEFAULT_FAQS.map((faq, index) => ({
    id: `fallback-${index}`,
    question: faq.q,
    answer: faq.a,
    sort_order: (index + 1) * 10,
  }));

  const [faqs, setFaqs] = useState<FaqItem[]>(fallbackFaqs);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFaqs() {
      const { data, error } = await supabase
        .from("faq_items")
        .select("id, question, answer, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!active) {
        return;
      }

      if (error) {
        console.error("A GYIK-elemek nem tölthetők be:", error);
        setErrorMessage(
          "A friss GYIK-tartalom átmenetileg nem tölthető be. A tartalék kérdéseket jelenítjük meg.",
        );
        setLoading(false);
        return;
      }

      setFaqs((data ?? []) as FaqItem[]);
      setErrorMessage("");
      setLoading(false);
    }

    void loadFaqs();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Section eyebrow="Kérdések" title="Gyakori kérdések">
      <div className="max-w-3xl">
        {loading && (
          <div className="space-y-2.5" aria-label="GYIK betöltése">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl border bg-secondary/40"
              />
            ))}
          </div>
        )}

        {!loading && errorMessage && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {errorMessage}
          </p>
        )}

        {!loading && faqs.length === 0 && (
          <div className="rounded-xl border bg-white px-5 py-6 text-sm text-ink-soft shadow-soft">
            Jelenleg nincs megjeleníthető gyakori kérdés.
          </div>
        )}

        {!loading && faqs.length > 0 && (
          <Accordion type="single" collapsible className="space-y-2.5">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.id}
                value={`faq-${faq.id}-${index}`}
                className="rounded-xl border bg-white px-5 shadow-soft md:px-6"
              >
                <AccordionTrigger className="py-5 text-left font-semibold text-ink hover:no-underline">
                  {faq.question}
                </AccordionTrigger>

                <AccordionContent className="whitespace-pre-line pb-5 leading-relaxed text-ink-soft">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </Section>
  );
}

function FinalCTA() {
  const [cta, setCta] = useState<FinalCtaSettings>(DEFAULT_FINAL_CTA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadFinalCta() {
      const { data, error } = await supabase
        .from("final_cta_settings")
        .select(
          "id, badge_text, title, description, button_text, button_url, icon_key, is_visible",
        )
        .eq("id", 1)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (error) {
        console.error("A záró CTA nem tölthető be:", error);
        setLoading(false);
        return;
      }

      if (data) {
        setCta(data as FinalCtaSettings);
      }

      setLoading(false);
    }

    void loadFinalCta();

    return () => {
      active = false;
    };
  }, []);

  if (!loading && !cta.is_visible) {
    return null;
  }

  const Icon = FINAL_CTA_ICONS[cta.icon_key] ?? Users;

  return (
    <section className="py-16 md:py-24">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-brand p-8 text-brand-foreground shadow-elegant md:p-16">
          <div
            aria-hidden
            className="absolute inset-0 opacity-40 bg-[radial-gradient(600px_300px_at_100%_0%,color-mix(in_oklab,var(--success)_50%,transparent),transparent)]"
          />

          <div className="relative max-w-2xl">
            {cta.badge_text && (
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                <Icon className="h-3.5 w-3.5" />
                {cta.badge_text}
              </div>
            )}

            <h2 className="mt-5 whitespace-pre-line text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {cta.title}
            </h2>

            {cta.description && (
              <p className="mt-4 whitespace-pre-line text-base text-brand-foreground/80 md:text-lg">
                {cta.description}
              </p>
            )}

            {cta.button_text && cta.button_url && (
              <Button asChild size="lg" variant="cta" className="mt-8">
                <a href={cta.button_url}>
                  {cta.button_text}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
