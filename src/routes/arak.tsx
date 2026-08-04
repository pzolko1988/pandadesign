import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/site/Section";
import { fetchVisiblePricingPackages } from "@/lib/public-pricing";
import { buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/arak")({
  loader: () => fetchVisiblePricingPackages(),
  head: () =>
    buildSeoHead({
      title: "Weboldal készítés árak és csomagok — PandaDesign",
      description:
        "Átlátható árcsomagok landing oldaltól webshopig. Havidíjas karbantartás és opcionális extra szolgáltatások.",
      path: "/arak",
    }),
  component: Pricing,
});

const EXTRAS = [
  { name: "Extra aloldal", price: "12 000 Ft-tól / oldal" },
  { name: "Szövegírás (copywriting)", price: "egyedi ajánlat" },
  { name: "Logó tervezés", price: "39 000 Ft-tól" },
  { name: "Többnyelvű weboldal", price: "egyedi ajánlat" },
  { name: "Foglalási rendszer", price: "egyedi ajánlat" },
  { name: "Haladó SEO csomag", price: "egyedi ajánlat" },
  { name: "Havi karbantartás", price: "9 900 Ft-tól / hó" },
  { name: "Tárhely-kezelés", price: "egyedi ajánlat" },
  { name: "Egyedi integrációk", price: "egyedi ajánlat" },
];

// Feature comparison matrix — same feature keys used across plans
const COMPARE: Array<{
  label: string;
  landing: boolean | string;
  basic: boolean | string;
  medium: boolean | string;
  webshop: boolean | string;
}> = [
  {
    label: "Reszponzív, mobilbarát dizájn",
    landing: true,
    basic: true,
    medium: true,
    webshop: true,
  },
  {
    label: "Kapcsolatfelvételi űrlap",
    landing: true,
    basic: true,
    medium: true,
    webshop: true,
  },
  {
    label: "Aloldalak száma",
    landing: "1",
    basic: "5",
    medium: "10",
    webshop: "10+",
  },
  {
    label: "Egyedi dizájn",
    landing: false,
    basic: false,
    medium: true,
    webshop: true,
  },
  {
    label: "Blog modul",
    landing: false,
    basic: false,
    medium: true,
    webshop: "opcionális",
  },
  {
    label: "Alap SEO beállítás",
    landing: true,
    basic: true,
    medium: true,
    webshop: true,
  },
  {
    label: "Technikai SEO",
    landing: false,
    basic: false,
    medium: true,
    webshop: true,
  },
  {
    label: "Sebesség-optimalizálás",
    landing: false,
    basic: false,
    medium: true,
    webshop: true,
  },
  {
    label: "Google Analytics",
    landing: false,
    basic: true,
    medium: true,
    webshop: true,
  },
  {
    label: "Termékkatalógus + kosár",
    landing: false,
    basic: false,
    medium: false,
    webshop: true,
  },
  {
    label: "Online fizetés",
    landing: false,
    basic: false,
    medium: false,
    webshop: true,
  },
  {
    label: "Betanítás és átadás",
    landing: false,
    basic: true,
    medium: true,
    webshop: true,
  },
];

function Pricing() {
  const plans = Route.useLoaderData();

  return (
    <>
      <Section
        eyebrow="Árak"
        title="Átlátható csomagok"
        description="Nincsenek rejtett díjak. Válaszd ki a hozzád illő csomagot, a többit megbeszéljük."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {plans.map((p) => (
            <Card
              key={p.id}
              className={`relative border shadow-soft h-full flex flex-col ${p.is_featured ? "border-brand border-2 shadow-elegant" : ""}`}
            >
              {p.is_featured && p.badge_text && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-success text-success-foreground px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  {p.badge_text}
                </span>
              )}
              <CardContent className="p-7 h-full flex flex-col">
                <p className="text-sm font-semibold text-brand">{p.name}</p>
                <p className="mt-1 text-xs text-ink-soft min-h-8">
                  {p.description}
                </p>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-ink tracking-tight">
                    {p.price_label}
                  </span>
                  {p.currency && (
                    <span className="text-lg font-semibold text-ink">
                      {p.currency}
                    </span>
                  )}
                </p>
                {p.price_suffix && (
                  <p className="text-xs text-ink-soft mt-0.5">
                    {p.price_suffix}
                  </p>
                )}
                <ul className="mt-6 space-y-2.5 flex-1">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-ink-soft"
                    >
                      <Check className="h-4 w-4 mt-0.5 shrink-0 text-success" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="mt-6 w-full"
                  variant={p.is_featured ? "cta" : "outline"}
                >
                  <a href={p.cta_url}>{p.cta_text}</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Összehasonlítás"
        title="Mit tartalmaz melyik csomag?"
        tone="muted"
      >
        <div className="rounded-2xl border bg-white shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b bg-secondary/40">
                  <th className="text-left font-semibold text-ink px-5 py-4 w-1/3">
                    Funkció
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      className={`text-center font-semibold px-4 py-4 ${plan.is_featured ? "text-brand bg-brand-soft/40" : "text-ink"}`}
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr
                    key={row.label}
                    className={i % 2 ? "bg-secondary/20" : ""}
                  >
                    <td className="px-5 py-3.5 text-ink font-medium">
                      {row.label}
                    </td>
                    {plans.map((plan) => (
                      <td
                        key={plan.id}
                        className={`px-4 py-3.5 text-center ${plan.is_featured ? "bg-brand-soft/20" : ""}`}
                      >
                        <CellValue value={getComparisonValue(row, plan.slug)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section eyebrow="Kiegészítők" title="Opcionális extra szolgáltatások">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {EXTRAS.map((e) => (
            <div
              key={e.name}
              className="flex items-center justify-between gap-4 rounded-xl bg-white border p-5 shadow-soft h-full"
            >
              <span className="text-sm font-medium text-ink">{e.name}</span>
              <span className="text-sm text-brand font-semibold shrink-0">
                {e.price}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-ink-soft max-w-2xl mx-auto">
          Az árak tájékoztató jellegűek. A végleges ajánlat mindig a projekt
          egyedi igényei alapján készül – nem ígérünk félrevezető fix árakat.
        </p>
        <div className="mt-6 flex justify-center">
          <Button asChild size="lg" variant="cta">
            <Link to="/kapcsolat">Kérj személyre szabott ajánlatot</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}

function getComparisonValue(
  row: (typeof COMPARE)[number],
  slug: string,
): boolean | string | undefined {
  if (
    slug === "landing" ||
    slug === "basic" ||
    slug === "medium" ||
    slug === "webshop"
  ) {
    return row[slug];
  }

  return undefined;
}

function CellValue({ value }: { value: boolean | string | undefined }) {
  if (value === true)
    return <Check className="mx-auto h-4 w-4 text-success" aria-label="Igen" />;
  if (value === false)
    return (
      <Minus
        className="mx-auto h-4 w-4 text-ink/25"
        aria-label="Nem tartalmazza"
      />
    );
  if (value === undefined)
    return <span className="text-sm text-ink/40">—</span>;
  return <span className="text-sm font-medium text-ink">{value}</span>;
}
