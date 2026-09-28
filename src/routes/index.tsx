import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Smartphone,
  Zap,
  Settings,
  Layers,
  ShoppingBag,
  RefreshCw,
  LifeBuoy,
  Code2,
  Sparkles,
  MessageSquare,
  Star,
  KeyRound,
  BarChart3,
  Puzzle,
  Eye,
  MousePointerClick,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/Section";
import { BrowserMockup } from "@/components/site/BrowserMockup";
import {
  AuditCtaBlock,
  BenefitGrid,
  FaqList,
  OwnershipBlock,
  PricingCards,
  ReferencePreview,
  TRUST_ICONS,
} from "@/components/site/Marketing";
import {
  fetchPublicHomeSeoData,
  type HeroContent,
} from "@/lib/public-home-seo";
import type { PublicService } from "@/lib/public-services";
import {
  ABOUT_SUMMARY,
  AUDIT_PATH,
  HERO_TRUST_ITEMS,
  PROBLEMS,
} from "@/lib/marketing-content";
import { buildSeoHead } from "@/lib/seo";
import { supabase } from "@/lib/supabase/client";

const HOME_TITLE = "Weboldal készítés vállalkozásoknak | PandaDesign";
const HOME_DESCRIPTION =
  "Ügyfélszerző weboldalak magyar vállalkozásoknak: gyors, mobilra optimalizált, mérhető és továbbfejleszthető rendszer, amely a te tulajdonod. Kérj ingyenes weboldal-auditot!";

export const Route = createFileRoute("/")({
  loader: () => fetchPublicHomeSeoData(),
  head: ({ loaderData }) =>
    buildSeoHead({
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      path: "/",
      image: loaderData?.ogImageUrl || undefined,
      type: "website",
    }),
  component: Home,
});

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
  key: KeyRound,
  chart: BarChart3,
  puzzle: Puzzle,
  eye: Eye,
};

const PROBLEM_ICONS: LucideIcon[] = [
  Eye,
  MousePointerClick,
  BarChart3,
  Smartphone,
];

function Home() {
  const data = Route.useLoaderData();
  const generalFaqs = data.faqs.filter((faq) => faq.category !== "pricing");

  return (
    <>
      <HeroSection hero={data.hero} />
      <TrustBar />
      <ProblemSection />
      <SolutionSection />
      <ServicesSection services={data.services} />
      <ReferencePreview
        title="Munkáink közelről"
        description="Valós projektek képernyőképekkel és leírással arról, mi készült el."
      />
      <ProcessSection />
      <Section
        eyebrow="Csomagok"
        title="Mennyibe kerül?"
        description="Induló árak, hogy előre tudj tervezni. A végleges ajánlat a projekt tartalma alapján, írásban készül."
        tone="muted"
      >
        <PricingCards packages={data.pricing} placement="home" compact />
        <p className="mt-8 text-center text-sm text-ink-soft">
          Mi van benne a csomagokban, és mi nincs?{" "}
          <Link to="/arak" className="font-semibold text-brand hover:underline">
            Részletes árak és feltételek →
          </Link>
        </p>
      </Section>
      <OwnershipBlock />
      <AboutTeaser />
      <SocialProofOrWhySection />
      {generalFaqs.length > 0 && (
        <Section eyebrow="Kérdések" title="Gyakori kérdések" tone="muted">
          <div className="max-w-3xl">
            <FaqList items={generalFaqs} />
          </div>
        </Section>
      )}
      <FinalAuditCta />
    </>
  );
}

function HeroSection({ hero }: { hero: HeroContent }) {
  const words = hero.title.trim().split(/\s+/);
  const highlighted = words.length > 3 ? words.slice(0, 2).join(" ") : "";
  const rest = highlighted ? words.slice(2).join(" ") : hero.title;

  return (
    <section className="relative overflow-hidden pb-12 pt-12 md:pb-20 md:pt-20">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(1100px_560px_at_85%_-10%,color-mix(in_oklab,var(--brand)_9%,transparent),transparent)]"
      />

      <div className="container-page grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          {hero.eyebrow && (
            <p className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-medium text-ink-soft shadow-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {hero.eyebrow}
            </p>
          )}

          <h1 className="mt-5 text-[34px] font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[58px]">
            {highlighted && (
              <>
                <span className="text-brand">{highlighted}</span>{" "}
              </>
            )}
            {rest}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
            {hero.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="cta"
              className="h-auto min-h-12 whitespace-normal py-3 text-center"
            >
              <a href={hero.primaryButtonUrl} data-track-placement="hero">
                {hero.primaryButtonText}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>

            {hero.secondaryButtonText && hero.secondaryButtonUrl && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-auto min-h-12 whitespace-normal py-3 text-center"
              >
                <a href={hero.secondaryButtonUrl} data-track-placement="hero">
                  {hero.secondaryButtonText}
                </a>
              </Button>
            )}
          </div>

          <p className="mt-4 text-sm text-ink-soft">
            15 perces, kötelezettségmentes átnézés – 3 konkrét javítási ponttal.
          </p>
        </div>

        <div className="relative hidden lg:block">
          <BrowserMockup />
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <div className="border-y bg-white">
      <ul
        aria-label="Amit minden projektnél biztosítunk"
        className="container-page flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 md:justify-between"
      >
        {HERO_TRUST_ITEMS.map((label, index) => {
          const Icon = TRUST_ICONS[index] ?? Check;

          return (
            <li
              key={label}
              className="flex items-center gap-2 text-sm font-medium text-ink"
            >
              <Icon className="h-4 w-4 text-success" aria-hidden="true" />
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ProblemSection() {
  return (
    <Section
      eyebrow="A probléma"
      title="Van weboldalad, mégsem hoz megkeresést?"
      description="A legtöbb céges weboldallal nem az a baj, hogy csúnya. Hanem hogy nem vezeti el a látogatót a kapcsolatfelvételig."
    >
      <div className="grid gap-4 sm:grid-cols-2 md:gap-5">
        {PROBLEMS.map((problem, index) => {
          const Icon = PROBLEM_ICONS[index] ?? Check;

          return (
            <div
              key={problem.title}
              className="flex gap-4 rounded-2xl border bg-white p-6 shadow-soft"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-ink">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold text-ink">{problem.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {problem.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function SolutionSection() {
  return (
    <Section
      eyebrow="A megoldás"
      title="Nem csak weboldalt készítünk"
      description="Olyan online értékesítési rendszert építünk, amely érdeklődőket gyűjt, mérhető, gyors, és később továbbfejleszthető."
      tone="muted"
    >
      <BenefitGrid />
    </Section>
  );
}

function ServicesSection({ services }: { services: PublicService[] }) {
  if (services.length === 0) {
    return null;
  }

  return (
    <Section
      eyebrow="Szolgáltatások"
      title="Miben segítünk?"
      description="Üzleti cél szerint dolgozunk: előbb azt nézzük meg, mit kell elérnie az oldalnak, utána választunk technológiát."
    >
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        {services.map((service, index) => {
          const Icon = SERVICE_ICONS[service.icon_key] ?? Layers;

          return (
            <article
              key={service.id}
              className="group flex h-full flex-col rounded-2xl border bg-white p-6 shadow-soft transition motion-safe:hover:-translate-y-0.5 hover:shadow-elegant md:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-brand-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs font-bold tracking-widest text-ink-soft">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="mt-5 text-xl font-semibold text-ink">
                {service.title}
              </h3>
              {service.audience && (
                <p className="mt-1 text-sm font-medium text-brand">
                  {service.audience}
                </p>
              )}
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {service.description}
              </p>

              {service.highlights.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {service.highlights.map((item) => (
                    <li
                      key={item}
                      className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-ink"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              <a
                href={service.link_url || "/szolgaltatasok"}
                className="mt-auto inline-flex items-center gap-1 self-start pt-6 text-sm font-semibold text-brand transition-all group-hover:gap-2"
              >
                Részletek
                <span className="sr-only">: {service.title}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </article>
          );
        })}
      </div>
    </Section>
  );
}

type ProcessStep = {
  id: string;
  step_number: string;
  title: string;
  description: string;
};

const DEFAULT_PROCESS: ProcessStep[] = [
  {
    id: "fallback-1",
    step_number: "01",
    title: "Igényfelmérés",
    description:
      "Megismerjük a vállalkozásod, célközönséged és üzleti céljaidat.",
  },
  {
    id: "fallback-2",
    step_number: "02",
    title: "Tervezés",
    description: "Átlátható struktúra és letisztult design minden képernyőre.",
  },
  {
    id: "fallback-3",
    step_number: "03",
    title: "Fejlesztés",
    description: "Gyors, biztonságos és keresőbarát kód, mobil elsőként.",
  },
  {
    id: "fallback-4",
    step_number: "04",
    title: "Átadás",
    description: "Betanítás, hozzáférések átadása és mérés beállítása.",
  },
];

function ProcessSection() {
  const [steps, setSteps] = useState<ProcessStep[]>(DEFAULT_PROCESS);

  useEffect(() => {
    let active = true;

    void supabase
      .from("process_steps")
      .select("id, step_number, title, description, sort_order")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (!active) {
          return;
        }

        if (error) {
          console.error("A munkafolyamat nem tölthető be:", error);
          return;
        }

        if (data && data.length > 0) {
          setSteps(data as ProcessStep[]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Section
      eyebrow="Folyamat"
      title="Így dolgozunk"
      description="Átlátható lépések, hogy mindig tudd, hol tart a projekt."
      tone="muted"
    >
      <ol className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
        {steps.map((step) => (
          <li
            key={step.id}
            className="h-full rounded-2xl border bg-white p-6 shadow-soft md:p-7"
          >
            <span className="font-mono text-xs font-bold tracking-widest text-success">
              {step.step_number}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-ink">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function AboutTeaser() {
  return (
    <Section eyebrow="Rólunk">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <h2 className="text-[28px] font-bold leading-[1.15] text-ink md:text-4xl">
            {ABOUT_SUMMARY.title}
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft md:text-lg">
            {ABOUT_SUMMARY.text}
          </p>
          <Button asChild variant="outline" className="mt-7">
            <Link to="/rolunk">
              Ismerj meg minket{" "}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <ul className="grid gap-3">
          {[
            "Egy felelős kapcsolattartó a projekt elejétől a végéig",
            "Érthető, szakzsargon nélküli kommunikáció",
            "Specialisták bevonása ott, ahol a feladat megkívánja",
          ].map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-xl border bg-white p-4 text-sm text-ink shadow-soft"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-success"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

type Testimonial = {
  id: string;
  name: string;
  role: string;
  testimonial_text: string;
  rating: number;
};

type WhyItem = {
  id: string;
  title: string;
  description: string;
  icon_key: string;
};

type WhySettings = {
  eyebrow: string;
  title: string;
  description: string;
  is_visible: boolean;
};

const DEFAULT_WHY_SETTINGS: WhySettings = {
  eyebrow: "Mit kapsz velünk?",
  title: "Amire minden projektnél számíthatsz",
  description: "",
  is_visible: true,
};

const DEFAULT_WHY_ITEMS: WhyItem[] = [
  {
    id: "w1",
    title: "Közvetlen kommunikáció",
    description:
      "Azzal beszélsz, aki a projekten dolgozik – nincs közvetítői lánc.",
    icon_key: "message-square",
  },
  {
    id: "w2",
    title: "Saját rendszer és hozzáférések",
    description: "Minden hozzáférést megkapsz, a rendszer a te tulajdonod.",
    icon_key: "key",
  },
  {
    id: "w3",
    title: "Átlátható projektfolyamat",
    description: "Minden szakaszban látod, hol tart a munka és mi következik.",
    icon_key: "eye",
  },
  {
    id: "w4",
    title: "Mobilra optimalizált kialakítás",
    description: "Telefonon, táblagépen és asztali gépen is jól használható.",
    icon_key: "smartphone",
  },
  {
    id: "w5",
    title: "Mérhető eredmények",
    description: "Analitika és konverziómérés, hogy lásd, mi működik.",
    icon_key: "chart",
  },
  {
    id: "w6",
    title: "Továbbfejleszthető rendszer",
    description: "Később bővíthető új funkciókkal, újrakezdés nélkül.",
    icon_key: "puzzle",
  },
];

/**
 * Valódi social proof csak akkor jelenik meg, ha az adminban legalább egy
 * vélemény "igazolt" jelölést kapott (testimonials.is_verified). Enélkül a
 * „Mit kapsz velünk?” hitelességi blokk látszik – kitalált vélemény soha.
 */
function SocialProofOrWhySection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialTitle, setTestimonialTitle] = useState("");
  const [whySettings, setWhySettings] = useState(DEFAULT_WHY_SETTINGS);
  const [whyItems, setWhyItems] = useState(DEFAULT_WHY_ITEMS);

  useEffect(() => {
    let active = true;

    async function load() {
      const [sectionResult, testimonialResult, whySettingsResult, whyResult] =
        await Promise.all([
          supabase
            .from("testimonial_section_settings")
            .select("title, is_visible")
            .eq("id", 1)
            .maybeSingle(),
          supabase
            .from("testimonials")
            .select("*")
            .eq("is_visible", true)
            .order("sort_order", { ascending: true }),
          supabase
            .from("why_section_settings")
            .select("eyebrow, title, description, is_visible")
            .eq("id", 1)
            .maybeSingle(),
          supabase
            .from("why_items")
            .select("id, title, description, icon_key")
            .eq("is_visible", true)
            .order("sort_order", { ascending: true }),
        ]);

      if (!active) {
        return;
      }

      const verified = (
        (testimonialResult.data ?? []) as Record<string, unknown>[]
      ).filter((item) => item.is_verified === true && item.is_sample !== true);

      if (
        !sectionResult.error &&
        sectionResult.data?.is_visible &&
        verified.length > 0
      ) {
        setTestimonialTitle(sectionResult.data.title || "Ügyfeleink mondták");
        setTestimonials(verified as unknown as Testimonial[]);
      }

      if (!whySettingsResult.error && whySettingsResult.data) {
        setWhySettings(whySettingsResult.data as WhySettings);
      }

      if (!whyResult.error && whyResult.data && whyResult.data.length > 0) {
        setWhyItems(whyResult.data as WhyItem[]);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  if (testimonials.length > 0) {
    return (
      <Section eyebrow="Vélemények" title={testimonialTitle}>
        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.id}
              className="flex h-full flex-col rounded-2xl border bg-white p-7 shadow-soft"
            >
              {testimonial.rating > 0 && (
                <div
                  className="flex gap-1"
                  role="img"
                  aria-label={`${testimonial.rating} / 5 csillag`}
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      aria-hidden="true"
                      className={`h-4 w-4 ${
                        index < testimonial.rating
                          ? "fill-current text-amber-500"
                          : "text-ink-soft/20"
                      }`}
                    />
                  ))}
                </div>
              )}
              <blockquote className="mt-4 flex-1 whitespace-pre-line leading-relaxed text-ink">
                „{testimonial.testimonial_text}”
              </blockquote>
              <figcaption className="mt-6 border-t pt-5 text-sm">
                <span className="font-semibold text-ink">
                  {testimonial.name}
                </span>
                {testimonial.role && (
                  <span className="block text-xs text-ink-soft">
                    {testimonial.role}
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
    );
  }

  if (!whySettings.is_visible || whyItems.length === 0) {
    return null;
  }

  return (
    <Section
      eyebrow={whySettings.eyebrow}
      title={whySettings.title}
      description={whySettings.description || undefined}
    >
      <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {whyItems.map((item) => {
          const Icon = WHY_ICONS[item.icon_key] ?? Check;

          return (
            <div
              key={item.id}
              className="flex h-full gap-4 rounded-xl border bg-white p-5 shadow-soft"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-success-soft text-success">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
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
    </Section>
  );
}

/**
 * A záró CTA szövege az adminból (final_cta_settings) szerkeszthető, de csak
 * akkor, ha a gomb az audit oldalra mutat – így a lead magnet mindig megmarad.
 */
function FinalAuditCta() {
  const [copy, setCopy] = useState<{ title?: string; description?: string }>(
    {},
  );

  useEffect(() => {
    let active = true;

    void supabase
      .from("final_cta_settings")
      .select("title, description, button_url, is_visible")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active || error || !data) {
          return;
        }

        if (data.is_visible && data.button_url === AUDIT_PATH) {
          setCopy({
            title: data.title || undefined,
            description: data.description || undefined,
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <AuditCtaBlock
      placement="home_final"
      title={copy.title}
      description={copy.description}
    />
  );
}
