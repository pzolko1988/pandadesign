import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ExternalLink,
  Globe2,
  KeyRound,
  Search,
  MessageSquare,
  Rocket,
  Sparkles,
  Users,
  Target,
  BarChart3,
  Puzzle,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AUDIT_PATH,
  BENEFITS,
  OWNERSHIP_POINTS,
  isNumericPrice,
  type FaqEntry,
  type PricingPackage,
} from "@/lib/marketing-content";
import {
  fetchPublishedProjects,
  getPortfolioImageUrl,
  type PublicProject,
} from "@/lib/public-project";

// ---------------------------------------------------------------------------
// Előnyök

const BENEFIT_ICONS: Record<string, LucideIcon> = {
  ownership: KeyRound,
  conversion: Target,
  measurable: BarChart3,
  extendable: Puzzle,
};

export function BenefitGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
      {BENEFITS.map((benefit) => {
        const Icon = BENEFIT_ICONS[benefit.key] ?? Check;

        return (
          <div
            key={benefit.key}
            className="rounded-2xl border bg-white p-6 shadow-soft transition motion-safe:hover:-translate-y-0.5 hover:shadow-elegant"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-ink">
              {benefit.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {benefit.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// „A weboldalad valóban a tiéd” blokk

export function OwnershipBlock() {
  return (
    <section className="py-16 md:py-24" aria-labelledby="ownership-title">
      <div className="container-page">
        <div className="grid gap-10 rounded-3xl bg-ink px-6 py-10 text-white shadow-elegant sm:px-10 md:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-14">
          <div>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-success">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2
              id="ownership-title"
              className="mt-6 text-3xl font-bold tracking-tight md:text-4xl"
            >
              A weboldalad valóban a tiéd.
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-white/70">
              Sok vállalkozás csak váltáskor döbben rá, hogy a weboldala
              valójában a kivitelezőé. Nálunk ez fordítva működik: a rendszer, a
              hozzáférések és az adatok nálad vannak.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {OWNERSHIP_POINTS.map((point) => (
              <li
                key={point.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <p className="flex items-center gap-2 font-semibold">
                  <Check
                    className="h-4 w-4 shrink-0 text-success"
                    aria-hidden="true"
                  />
                  {point.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/65">
                  {point.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Árcsomag-kártyák

export function PricingCards({
  packages,
  placement,
  compact = false,
}: {
  packages: PricingPackage[];
  placement: string;
  /** Rövidített kártya a főoldalra: kinek szól + max. 4 tétel. */
  compact?: boolean;
}) {
  const columns =
    packages.length >= 5
      ? "md:grid-cols-2 xl:grid-cols-3"
      : "md:grid-cols-2 xl:grid-cols-4";

  return (
    <div className={`grid gap-5 ${columns}`}>
      {packages.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          placement={placement}
          compact={compact}
        />
      ))}
    </div>
  );
}

function PricingCard({
  plan,
  placement,
  compact,
}: {
  plan: PricingPackage;
  placement: string;
  compact: boolean;
}) {
  const numeric = isNumericPrice(plan.price_label);
  const features = compact ? plan.features.slice(0, 4) : plan.features;

  return (
    <article
      className={`relative flex h-full flex-col rounded-2xl border bg-white p-6 shadow-soft md:p-7 ${
        plan.is_featured ? "border-2 border-brand shadow-elegant" : ""
      }`}
    >
      {plan.is_featured && plan.badge_text && (
        <span className="absolute -top-3 left-6 rounded-full bg-success px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-success-foreground shadow-sm">
          {plan.badge_text}
        </span>
      )}

      <h3 className="text-sm font-bold uppercase tracking-wider text-brand">
        {plan.name}
      </h3>
      <p className="mt-1 text-sm font-medium text-ink">{plan.description}</p>

      <p className="mt-5 flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-3xl font-bold tracking-tight text-ink">
          {plan.price_label}
        </span>
        {numeric && (
          <span className="text-lg font-semibold text-ink">
            {formatPriceUnit(plan.currency, plan.price_suffix)}
          </span>
        )}
      </p>
      {numeric && (
        <p className="mt-1 text-xs text-ink-soft">
          Induló ár – a végleges összeget a projekt tartalma határozza meg.
        </p>
      )}

      {plan.audience && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Kinek ajánljuk
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink">
            {plan.audience}
          </p>
        </div>
      )}

      {features.length > 0 && (
        <div className="mt-5 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Mit tartalmaz
          </p>
          <ul className="mt-2 space-y-2">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-ink-soft"
              >
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-success"
                  aria-hidden="true"
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!compact && plan.outcome && (
        <p className="mt-5 rounded-xl bg-brand-soft/60 px-4 py-3 text-sm leading-relaxed text-ink">
          <span className="font-semibold">Fő eredmény: </span>
          {plan.outcome}
        </p>
      )}

      {!compact && plan.scope_note && (
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          <span className="font-semibold text-ink">Scope: </span>
          {plan.scope_note}
        </p>
      )}

      <Button
        asChild
        className="mt-6 w-full"
        variant={plan.is_featured ? "cta" : "outline"}
      >
        <a
          href={plan.cta_url || "/kapcsolat"}
          data-track="pricing_cta_click"
          data-track-package={plan.slug}
          data-track-placement={placement}
        >
          {plan.cta_text || "Ajánlatot kérek"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </Button>
    </article>
  );
}

/** "Ft" + "-tól" → "Ft-tól"; más utótagnál szóközzel választ el. */
export function formatPriceUnit(currency: string, suffix: string) {
  const normalizedSuffix = suffix.trim() || "-tól";

  if (!currency.trim()) {
    return normalizedSuffix;
  }

  return normalizedSuffix.startsWith("-")
    ? `${currency.trim()}${normalizedSuffix}`
    : `${currency.trim()} ${normalizedSuffix}`;
}

// ---------------------------------------------------------------------------
// Referenciák

export function ReferenceCard({ project }: { project: PublicProject }) {
  const desktopUrl = project.image_path
    ? getPortfolioImageUrl(project.image_path)
    : "";
  const mobileUrl = project.mobile_image_path
    ? getPortfolioImageUrl(project.mobile_image_path)
    : "";
  const coverUrl = desktopUrl || mobileUrl;
  const hasPublicUrl = /^https?:\/\//.test(project.project_url);
  const displayDomain = hasPublicUrl
    ? project.project_url.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : project.title;
  const highlights = (
    project.features.length > 0 ? project.features : project.services
  ).slice(0, 4);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-soft transition motion-safe:hover:-translate-y-0.5 hover:shadow-elegant">
      <div className="relative aspect-[16/10] overflow-hidden border-b bg-secondary/40">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`${project.title} – képernyőkép`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top transition duration-500 motion-safe:group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_75%_20%,color-mix(in_oklab,var(--brand)_18%,transparent),transparent_42%),linear-gradient(145deg,color-mix(in_oklab,var(--ink)_96%,white),color-mix(in_oklab,var(--brand)_32%,var(--ink)))] p-5 text-white">
            <div className="w-full max-w-[92%] overflow-hidden rounded-xl border border-white/15 bg-white/10 shadow-elegant backdrop-blur">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-white/35" />
                <span className="h-2 w-2 rounded-full bg-white/25" />
                <span className="h-2 w-2 rounded-full bg-white/15" />
                <span className="ml-2 truncate text-[10px] font-medium text-white/65">
                  {displayDomain}
                </span>
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                  Élő projekt
                </p>
                <p className="mt-2 text-lg font-bold leading-tight">
                  {project.title}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-white/65">
                  Valódi képernyőkép feltöltéséig az élő oldal érhető el a
                  referencia adatlapjáról.
                </p>
              </div>
            </div>
          </div>
        )}

        {desktopUrl && mobileUrl && (
          <img
            src={mobileUrl}
            alt={`${project.title} – mobil nézet`}
            loading="lazy"
            decoding="async"
            className="absolute bottom-3 right-3 h-[70%] w-auto rounded-lg border-4 border-white object-cover object-top shadow-elegant"
          />
        )}

        {project.is_concept ? (
          <span className="absolute left-3 top-3 rounded-full border bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
            Koncepcióprojekt
          </span>
        ) : (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Élő projekt
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">
          {[project.category, project.industry]
            .filter(Boolean)
            .filter((value, index, values) => values.indexOf(value) === index)
            .join(" · ")}
        </p>

        <h3 className="mt-2 text-xl font-bold leading-tight text-ink">
          {project.title}
        </h3>

        <p className="mt-3 text-sm leading-6 text-ink-soft">
          {project.challenge || project.description}
        </p>

        {highlights.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {highlights.map((item) => (
              <li
                key={item}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-ink"
              >
                {item}
              </li>
            ))}
          </ul>
        )}

        {project.technologies.length > 0 && (
          <p className="mt-3 text-xs text-ink-soft">
            {project.technologies.join(" · ")}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6">
          <Link
            to="/referenciak/$slug"
            params={{ slug: project.slug }}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand transition-all hover:gap-2"
          >
            Esettanulmány
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          {hasPublicUrl && (
            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink"
            >
              {project.is_concept ? "Élő demó" : "Élő oldal"}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">(új lapon nyílik)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function usePublishedProjects(limit?: number) {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let active = true;

    fetchPublishedProjects(limit)
      .then((data) => {
        if (active) {
          setProjects(data);
          setStatus("ready");
        }
      })
      .catch((error: unknown) => {
        console.error("A referenciák nem tölthetők be:", error);

        if (active) {
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [limit]);

  return { projects, status };
}

/**
 * Referencia-előnézet. Ha nincs publikálható (képernyőképpel rendelkező)
 * referencia, semmit sem renderel – üres blokkot nem mutatunk.
 */
export function ReferencePreview({
  title = "Munkáink",
  description,
  limit = 3,
  tone = "default",
  categories,
}: {
  title?: string;
  description?: string;
  limit?: number;
  tone?: "default" | "muted" | "dark";
  /** Ha meg van adva, csak ezekbe a kategóriákba tartozó munkák jelennek meg. */
  categories?: string[];
}) {
  const filtered = Boolean(categories);
  const { projects: loaded, status } = usePublishedProjects(
    filtered ? undefined : limit,
  );
  const projects = filtered
    ? loaded
        .filter((project) => categories?.includes(project.category))
        .slice(0, limit)
    : loaded;

  if (status !== "ready" || projects.length === 0) {
    return null;
  }

  return (
    <section
      className={`relative overflow-hidden py-16 md:py-24 ${
        tone === "muted"
          ? "bg-secondary/50"
          : tone === "dark"
            ? "bg-ink text-white"
            : ""
      }`}
      aria-labelledby="reference-preview-title"
    >
      {tone === "dark" && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(800px_420px_at_12%_0%,color-mix(in_oklab,var(--brand)_38%,transparent),transparent),radial-gradient(600px_360px_at_100%_100%,color-mix(in_oklab,var(--success)_14%,transparent),transparent)]"
        />
      )}
      <div className="container-page relative">
        <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p
              className={`mb-3 text-xs font-semibold uppercase tracking-widest ${
                tone === "dark" ? "text-success" : "text-brand"
              }`}
            >
              Referenciák
            </p>
            <h2
              id="reference-preview-title"
              className={`text-[28px] font-bold leading-[1.15] md:text-4xl ${
                tone === "dark" ? "text-white" : "text-ink"
              }`}
            >
              {title}
            </h2>
            {description && (
              <p
                className={`mt-4 text-[15px] leading-relaxed md:text-lg ${
                  tone === "dark" ? "text-white/70" : "text-ink-soft"
                }`}
              >
                {description}
              </p>
            )}
          </div>
          <Button
            asChild
            variant="outline"
            className={`self-start md:self-auto ${
              tone === "dark"
                ? "border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                : ""
            }`}
          >
            <Link to="/referenciak">
              Összes munka <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mb-7 flex flex-wrap gap-2">
          {[
            "Élő projektek",
            "Ellenőrizhető URL-ek",
            "Valós funkciók",
          ].map((label) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                tone === "dark"
                  ? "border-white/15 bg-white/5 text-white/80"
                  : "bg-white text-ink-soft"
              }`}
            >
              <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ReferenceCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// GYIK

export function FaqList({ items }: { items: FaqEntry[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Accordion type="single" collapsible className="space-y-2.5">
      {items.map((faq, index) => (
        <AccordionItem
          key={`${faq.question}-${index}`}
          value={`faq-${index}`}
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
  );
}

// ---------------------------------------------------------------------------
// Ingyenes audit CTA

const CTA_ICONS: Record<string, LucideIcon> = {
  search: Search,
  users: Users,
  "message-square": MessageSquare,
  sparkles: Sparkles,
  rocket: Rocket,
};

export function AuditCtaBlock({
  badgeText = "Ingyenes weboldal-audit",
  title = "Kérd az ingyenes 15 perces weboldal-auditot",
  description = "Megmutatjuk azt a 3 legfontosabb pontot, amely jelenleg visszafoghatja a weboldalad ügyfélszerzését. Kötelezettség nélkül.",
  buttonText = "Kérem az ingyenes auditot",
  buttonUrl = AUDIT_PATH,
  iconKey = "search",
  placement,
  children,
}: {
  badgeText?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  iconKey?: string;
  placement: string;
  children?: ReactNode;
}) {
  const CtaIcon = CTA_ICONS[iconKey] ?? Search;
  return (
    <section
      className="py-16 md:py-24"
      aria-labelledby={`audit-cta-${placement}`}
    >
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-10 text-brand-foreground shadow-elegant sm:px-10 md:px-16 md:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40 bg-[radial-gradient(600px_300px_at_100%_0%,color-mix(in_oklab,var(--success)_45%,transparent),transparent)]"
          />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                <CtaIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {badgeText}
              </p>
              <h2
                id={`audit-cta-${placement}`}
                className="mt-5 text-3xl font-bold tracking-tight md:text-4xl"
              >
                {title}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-foreground/80 md:text-lg">
                {description}
              </p>
              {children}
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <Button
                asChild
                size="lg"
                variant="cta"
                className="h-auto min-h-12 whitespace-normal py-3 text-center"
              >
                <a href={buttonUrl} data-track-placement={placement}>
                  {buttonText}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
              <a
                href="/kapcsolat"
                data-track-placement={placement}
                className="text-sm font-semibold text-brand-foreground/80 underline-offset-4 hover:text-brand-foreground hover:underline"
              >
                Inkább konkrét ajánlatot kérek
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const TRUST_ICONS: LucideIcon[] = [
  KeyRound,
  Smartphone,
  Search,
  BarChart3,
  Puzzle,
];
