import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/arak")({
  head: () => ({
    meta: [
      { title: "Árak — PandaDesign" },
      { name: "description", content: "Átlátható árcsomagok landing oldaltól webshopig. Havidíjas karbantartás és opcionális extra szolgáltatások." },
      { property: "og:title", content: "Árak — PandaDesign" },
      { property: "og:description", content: "Landing 69 000 Ft-tól, Basic 119 000 Ft-tól, Medium 199 000 Ft-tól, Webshop 299 000 Ft-tól." },
      { property: "og:url", content: "/arak" },
    ],
    links: [{ rel: "canonical", href: "/arak" }],
  }),
  component: Pricing,
});

const PLANS = [
  { name: "Landing", price: "69 000", desc: "Egyoldalas kampányoldal",
    features: ["Egyoldalas weboldal", "Reszponzív dizájn", "Kapcsolatfelvételi űrlap", "Alap SEO beállítás", "Közösségi média linkek", "Alap analitika"] },
  { name: "Basic", price: "119 000", desc: "Klasszikus bemutatkozó oldal",
    features: ["Max. 5 aloldal", "Reszponzív dizájn", "Kapcsolatfelvételi űrlap", "Alap SEO", "Analitika beállítás", "Könnyű adminisztráció"] },
  { name: "Medium", price: "199 000", desc: "Bővített prezentációs oldal", featured: true,
    features: ["Max. 10 aloldal", "Egyedi dizájn", "Blog modul", "Speciális űrlapok", "Sebesség-optimalizálás", "Analitika", "Alap technikai SEO", "Betanítás és átadás"] },
  { name: "Webshop", price: "299 000", desc: "Modern online áruház",
    features: ["Termékkatalógus", "Kosár funkció", "Online fizetés integráció", "Szállítási opciók", "Rendeléskezelés", "Alap webshop betanítás"] },
];

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
const COMPARE: Array<{ label: string; landing: boolean | string; basic: boolean | string; medium: boolean | string; webshop: boolean | string }> = [
  { label: "Reszponzív, mobilbarát dizájn", landing: true, basic: true, medium: true, webshop: true },
  { label: "Kapcsolatfelvételi űrlap", landing: true, basic: true, medium: true, webshop: true },
  { label: "Aloldalak száma", landing: "1", basic: "5", medium: "10", webshop: "10+" },
  { label: "Egyedi dizájn", landing: false, basic: false, medium: true, webshop: true },
  { label: "Blog modul", landing: false, basic: false, medium: true, webshop: "opcionális" },
  { label: "Alap SEO beállítás", landing: true, basic: true, medium: true, webshop: true },
  { label: "Technikai SEO", landing: false, basic: false, medium: true, webshop: true },
  { label: "Sebesség-optimalizálás", landing: false, basic: false, medium: true, webshop: true },
  { label: "Google Analytics", landing: false, basic: true, medium: true, webshop: true },
  { label: "Termékkatalógus + kosár", landing: false, basic: false, medium: false, webshop: true },
  { label: "Online fizetés", landing: false, basic: false, medium: false, webshop: true },
  { label: "Betanítás és átadás", landing: false, basic: true, medium: true, webshop: true },
];

function Pricing() {
  return (
    <>
      <Section eyebrow="Árak" title="Átlátható csomagok" description="Nincsenek rejtett díjak. Válaszd ki a hozzád illő csomagot, a többit megbeszéljük.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {PLANS.map((p) => (
            <Card key={p.name} className={`relative border shadow-soft h-full flex flex-col ${p.featured ? "border-brand border-2 shadow-elegant" : ""}`}>
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-success text-success-foreground px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm">Legnépszerűbb</span>
              )}
              <CardContent className="p-7 h-full flex flex-col">
                <p className="text-sm font-semibold text-brand">{p.name}</p>
                <p className="mt-1 text-xs text-ink-soft min-h-8">{p.desc}</p>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-ink tracking-tight">{p.price} Ft</span>
                </p>
                <p className="text-xs text-ink-soft mt-0.5">-tól, +ÁFA</p>
                <ul className="mt-6 space-y-2.5 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
                      <Check className="h-4 w-4 mt-0.5 shrink-0 text-success" /><span>{f}</span>
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
      </Section>

      <Section eyebrow="Összehasonlítás" title="Mit tartalmaz melyik csomag?" tone="muted">
        <div className="rounded-2xl border bg-white shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b bg-secondary/40">
                  <th className="text-left font-semibold text-ink px-5 py-4 w-1/3">Funkció</th>
                  {(["landing", "basic", "medium", "webshop"] as const).map((k) => (
                    <th key={k} className={`text-center font-semibold px-4 py-4 ${k === "medium" ? "text-brand bg-brand-soft/40" : "text-ink"}`}>
                      {PLANS.find((p) => p.name.toLowerCase() === k)!.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={row.label} className={i % 2 ? "bg-secondary/20" : ""}>
                    <td className="px-5 py-3.5 text-ink font-medium">{row.label}</td>
                    {(["landing", "basic", "medium", "webshop"] as const).map((k) => (
                      <td key={k} className={`px-4 py-3.5 text-center ${k === "medium" ? "bg-brand-soft/20" : ""}`}>
                        <CellValue value={row[k]} />
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
            <div key={e.name} className="flex items-center justify-between gap-4 rounded-xl bg-white border p-5 shadow-soft h-full">
              <span className="text-sm font-medium text-ink">{e.name}</span>
              <span className="text-sm text-brand font-semibold shrink-0">{e.price}</span>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-ink-soft max-w-2xl mx-auto">
          Az árak tájékoztató jellegűek. A végleges ajánlat mindig a projekt egyedi igényei alapján készül – nem ígérünk félrevezető fix árakat.
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

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-success" aria-label="Igen" />;
  if (value === false) return <Minus className="mx-auto h-4 w-4 text-ink/25" aria-label="Nem tartalmazza" />;
  return <span className="text-sm font-medium text-ink">{value}</span>;
}