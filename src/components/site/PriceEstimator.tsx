import { useId, useMemo, useState } from "react";
import { ArrowRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPriceUnit } from "@/components/site/Marketing";
import { trackEvent } from "@/lib/analytics";
import { isNumericPrice, type PricingPackage } from "@/lib/marketing-content";

// Árbecslő: csak az üzletileg rögzített induló árakat használja.
// Nem számol ki "pontos" összeget vagy kitalált sávot – a kiválasztott
// extrákat az ajánlatban külön árazandó tételként listázza.
//
// TODO(üzleti döntés): ha később meghatározott felárak lesznek (pl. extra
// aloldal, többnyelvűség), azokat itt, az EXTRA_RULES-ban lehet felvenni,
// és akkor a becslés sávként is megjeleníthető.

type ProjectType = "landing" | "ceges" | "webshop" | "webapp";

type Answers = {
  type: ProjectType | "";
  pages: string;
  copywriting: boolean;
  seo: boolean;
  multilingual: boolean;
  booking: boolean;
  admin: boolean;
  automation: boolean;
};

const TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: "landing", label: "Landing / kampányoldal" },
  { value: "ceges", label: "Céges weboldal" },
  { value: "webshop", label: "Webshop" },
  { value: "webapp", label: "Webalkalmazás / egyedi rendszer" },
];

const PAGE_OPTIONS = [
  "1 oldal",
  "2–5 oldal",
  "6–10 oldal",
  "10-nél több",
  "Még nem tudom",
];

const TOGGLES: { key: keyof Omit<Answers, "type" | "pages">; label: string }[] =
  [
    { key: "copywriting", label: "Kell szövegírás?" },
    { key: "seo", label: "Kell kiemelt SEO (a SEO-alapokon túl)?" },
    { key: "multilingual", label: "Kell több nyelv?" },
    { key: "booking", label: "Kell foglalás vagy ajánlatkérő rendszer?" },
    { key: "admin", label: "Kell saját adminfelület?" },
    { key: "automation", label: "Kell automatizáció (pl. e-mail, CRM)?" },
  ];

const EXTRA_LABELS: Record<keyof Omit<Answers, "type" | "pages">, string> = {
  copywriting: "Szövegírás",
  seo: "Kiemelt SEO-munka",
  multilingual: "Többnyelvűség",
  booking: "Foglalási / ajánlatkérő rendszer",
  admin: "Adminfelület",
  automation: "Automatizáció",
};

// Ami a csomag leírása szerint már benne van, azt nem listázzuk külön tételként.
const INCLUDED_IN_PACKAGE: Record<
  string,
  (keyof Omit<Answers, "type" | "pages">)[]
> = {
  "landing-sprint": [],
  "ugyfelszerzo-web": ["admin"],
  "business-lead": ["admin", "booking"],
  webshop: ["admin"],
  "egyedi-webapp": ["admin", "booking", "automation"],
};

const EMPTY: Answers = {
  type: "",
  pages: "",
  copywriting: false,
  seo: false,
  multilingual: false,
  booking: false,
  admin: false,
  automation: false,
};

function pickPackageSlug(answers: Answers) {
  switch (answers.type) {
    case "landing":
      return "landing-sprint";
    case "webshop":
      return "webshop";
    case "webapp":
      return "egyedi-webapp";
    case "ceges":
      return answers.booking || answers.automation
        ? "business-lead"
        : "ugyfelszerzo-web";
    default:
      return "";
  }
}

export function PriceEstimator({ packages }: { packages: PricingPackage[] }) {
  const baseId = useId();
  const [answers, setAnswers] = useState<Answers>(EMPTY);

  const recommended = useMemo(() => {
    const slug = pickPackageSlug(answers);
    return packages.find((item) => item.slug === slug) ?? null;
  }, [answers, packages]);

  const included = recommended
    ? (INCLUDED_IN_PACKAGE[recommended.slug] ?? [])
    : [];
  const extras = TOGGLES.filter(
    ({ key }) => answers[key] && !included.includes(key),
  ).map(({ key }) => EXTRA_LABELS[key]);

  const complete = Boolean(answers.type && answers.pages);

  const summary = [
    `Projekt: ${TYPE_OPTIONS.find((option) => option.value === answers.type)?.label ?? "-"}`,
    `Oldalszám: ${answers.pages || "-"}`,
    ...TOGGLES.map(
      ({ key }) => `${EXTRA_LABELS[key]}: ${answers[key] ? "igen" : "nem"}`,
    ),
    recommended ? `Kiinduló csomag: ${recommended.name}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const quoteUrl = `/kapcsolat?${new URLSearchParams({
    ...(recommended ? { csomag: recommended.slug } : {}),
    kalkulator: summary,
  }).toString()}`;

  return (
    <div className="grid gap-6 rounded-3xl border bg-white p-5 shadow-soft sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
      <form
        className="space-y-6"
        onSubmit={(event) => event.preventDefault()}
        aria-label="Weboldal árbecslő"
      >
        <fieldset>
          <legend className="text-sm font-semibold text-ink">
            1. Mit szeretnél?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {TYPE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand ${
                  answers.type === option.value
                    ? "border-brand bg-brand-soft/60 font-semibold text-ink"
                    : "text-ink-soft hover:bg-secondary"
                }`}
              >
                <input
                  type="radio"
                  name={`${baseId}-type`}
                  value={option.value}
                  checked={answers.type === option.value}
                  onChange={() =>
                    setAnswers((current) => ({
                      ...current,
                      type: option.value,
                    }))
                  }
                  className="h-4 w-4 accent-[var(--brand)]"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor={`${baseId}-pages`}
            className="text-sm font-semibold text-ink"
          >
            2. Hány oldal lesz nagyjából?
          </label>
          <select
            id={`${baseId}-pages`}
            value={answers.pages}
            onChange={(event) =>
              setAnswers((current) => ({
                ...current,
                pages: event.target.value,
              }))
            }
            className="mt-3 w-full rounded-xl border bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-brand sm:text-sm"
          >
            <option value="" disabled>
              Válassz
            </option>
            {PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-ink">
            3–8. Mire van még szükség?
          </legend>
          <div className="mt-3 grid gap-2">
            {TOGGLES.map(({ key, label }) => (
              <label
                key={key}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm text-ink has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand"
              >
                <input
                  type="checkbox"
                  checked={answers[key]}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [key]: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-[var(--brand)]"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </form>

      <div
        className="flex flex-col rounded-2xl bg-secondary/60 p-6"
        aria-live="polite"
      >
        <p className="flex items-center gap-2 text-sm font-semibold text-brand">
          <Calculator className="h-4 w-4" aria-hidden="true" />
          Becsült projektkeret
        </p>

        {!complete || !recommended ? (
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Válaszd ki a projekt típusát és a várható oldalszámot, és
            megmutatjuk, melyik csomag a kiindulópont.
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm text-ink-soft">Kiinduló csomag</p>
            <p className="text-2xl font-bold text-ink">{recommended.name}</p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {isNumericPrice(recommended.price_label)
                ? `${recommended.price_label} ${formatPriceUnit(recommended.currency, recommended.price_suffix)}`
                : recommended.price_label}
            </p>

            {extras.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-ink">
                  Az ajánlatban külön árazzuk:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                  {extras.map((extra) => (
                    <li key={extra}>{extra}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-5 text-xs leading-relaxed text-ink-soft">
              Ez nem végleges ár, hanem a kiindulási pont. A pontos összeget a
              tartalom és a funkciók ismeretében, írásos ajánlatban adjuk meg.
            </p>

            <Button
              asChild
              variant="cta"
              className="mt-6 h-auto min-h-11 whitespace-normal py-3"
            >
              <a
                href={quoteUrl}
                data-track="pricing_cta_click"
                data-track-placement="estimator"
                data-track-package={recommended.slug}
                onClick={() =>
                  trackEvent("calculator_complete", {
                    package: recommended.slug,
                    extras: extras.length,
                  })
                }
              >
                Kérem a pontos ajánlatot
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
