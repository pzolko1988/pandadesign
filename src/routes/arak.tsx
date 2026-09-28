import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";
import {
  AuditCtaBlock,
  FaqList,
  PricingCards,
} from "@/components/site/Marketing";
import { PriceEstimator } from "@/components/site/PriceEstimator";
import {
  DEFAULT_PRICING_FAQ,
  DEFAULT_PRICING_PACKAGES,
} from "@/lib/marketing-content";
import { fetchFaqByCategory } from "@/lib/public-faq";
import { fetchVisiblePricingPackages } from "@/lib/public-pricing";
import { buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/arak")({
  loader: async () => {
    const [packages, faqs] = await Promise.all([
      fetchVisiblePricingPackages().catch((error: unknown) => {
        console.error("Az árcsomagok nem tölthetők be:", error);
        return DEFAULT_PRICING_PACKAGES;
      }),
      fetchFaqByCategory("pricing").catch((error: unknown) => {
        console.error("Az árazási GYIK nem tölthető be:", error);
        return [];
      }),
    ]);

    return {
      packages,
      faqs: faqs.length > 0 ? faqs : DEFAULT_PRICING_FAQ,
    };
  },
  head: () =>
    buildSeoHead({
      title: "Weboldal készítés árak és csomagok | PandaDesign",
      description:
        "Induló árak landing oldaltól webshopig: Landing Sprint 99 000 Ft-tól, Ügyfélszerző Web 199 000 Ft-tól. Nézd meg, mit tartalmaznak a csomagok, és kérj pontos ajánlatot.",
      path: "/arak",
    }),
  component: Pricing,
});

// Meglévő, üzletileg rögzített kiegészítő árak (a korábbi árlistából).
const EXTRAS = [
  { name: "Extra aloldal", price: "12 000 Ft-tól / oldal" },
  { name: "Szövegírás (copywriting)", price: "egyedi ajánlat" },
  { name: "Logótervezés", price: "39 000 Ft-tól" },
  { name: "Többnyelvű weboldal", price: "egyedi ajánlat" },
  { name: "Foglalási rendszer", price: "egyedi ajánlat" },
  { name: "Haladó SEO", price: "egyedi ajánlat" },
  { name: "Havi karbantartás", price: "9 900 Ft-tól / hó" },
  { name: "Tárhely-kezelés", price: "egyedi ajánlat" },
  { name: "Egyedi integrációk", price: "egyedi ajánlat" },
];

function Pricing() {
  const { packages, faqs } = Route.useLoaderData();

  return (
    <>
      <Section
        eyebrow="Árak"
        title="Weboldal készítés árak – induló árak, rejtett tételek nélkül"
        description="Minden ár induló ár: a végleges összeget a tartalom és a funkciók ismeretében, írásos ajánlatban rögzítjük."
        titleAs="h1"
      >
        <PricingCards packages={packages} placement="pricing_page" />
      </Section>

      <Section
        id="arbecslo"
        eyebrow="Árbecslő"
        title="Melyik csomag illik hozzád?"
        description="Válaszolj néhány kérdésre, és megmutatjuk a kiinduló csomagot. A válaszaidat az ajánlatkéréshez is csatoljuk."
        tone="muted"
      >
        <PriceEstimator packages={packages} />
      </Section>

      <Section eyebrow="Kiegészítők" title="Opcionális extra szolgáltatások">
        <ul className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {EXTRAS.map((extra) => (
            <li
              key={extra.name}
              className="flex h-full items-center justify-between gap-4 rounded-xl border bg-white p-5 shadow-soft"
            >
              <span className="text-sm font-medium text-ink">{extra.name}</span>
              <span className="shrink-0 text-sm font-semibold text-brand">
                {extra.price}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        eyebrow="Scope és feltételek"
        title="Mi van benne, és mi nincs?"
        description="Hogy előre tudd, mire számíthatsz – és ne az átadáskor derüljenek ki a részletek."
        tone="muted"
      >
        <div className="max-w-3xl">
          <FaqList items={faqs} />
        </div>
      </Section>

      <AuditCtaBlock
        placement="pricing_page"
        title="Nem vagy biztos benne, melyik csomag kell?"
        description="Kérj ingyenes 15 perces auditot: megnézzük a jelenlegi helyzetet, és megmondjuk, melyik irány éri meg neked."
      />
    </>
  );
}
