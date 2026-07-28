import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/adatkezeles")({
  head: () => ({
    meta: [
      { title: "Adatkezelési tájékoztató — PandaDesign" },
      {
        name: "description",
        content:
          "PandaDesign adatkezelési tájékoztatója – helyőrző dokumentum a jogi véglegesítésig.",
      },
      {
        property: "og:title",
        content: "Adatkezelési tájékoztató — PandaDesign",
      },
      {
        property: "og:description",
        content: "Adatkezelési tájékoztató – helyőrző tartalom.",
      },
      { property: "og:url", content: "/adatkezeles" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/adatkezeles" }],
  }),
  component: () => <Legal title="Adatkezelési tájékoztató" />,
});

function Legal({ title }: { title: string }) {
  return (
    <Section eyebrow="Jogi információ" title={title}>
      <div className="prose max-w-3xl text-ink-soft leading-relaxed space-y-4">
        <p className="rounded-xl border bg-white p-5 shadow-soft">
          <strong className="text-ink">Helyőrző tartalom.</strong> Ez az oldal a
          jogi véglegesítésig helyőrző tartalmat tartalmaz. A publikálás előtt
          cégspecifikus, ügyvéd által ellenőrzött szöveget helyezünk el.
        </p>
        <h3 className="text-lg font-semibold text-ink pt-4">
          1. Az adatkezelő
        </h3>
        <p>
          PandaDesign – teljes cégnév, cím, adószám és képviselő neve a végleges
          dokumentumban.
        </p>
        <h3 className="text-lg font-semibold text-ink pt-4">
          2. Kezelt adatok
        </h3>
        <p>
          Kapcsolatfelvételi űrlap: név, email cím, telefonszám, cégnév, üzenet
          tartalma.
        </p>
        <h3 className="text-lg font-semibold text-ink pt-4">
          3. Az adatkezelés célja és jogalapja
        </h3>
        <p>
          A megkeresés megválaszolása és az ajánlatadás elősegítése az érintett
          hozzájárulása alapján (GDPR 6. cikk (1) a) pont).
        </p>
        <h3 className="text-lg font-semibold text-ink pt-4">
          4. Adattárolás időtartama
        </h3>
        <p>
          Az ajánlatkérés lezárását követő 12 hónapig, vagy a hozzájárulás
          visszavonásáig.
        </p>
        <h3 className="text-lg font-semibold text-ink pt-4">
          5. Érintetti jogok
        </h3>
        <p>
          Az érintett bármikor kérhet tájékoztatást, helyesbítést, törlést a
          hello@pandadesign.hu email címen.
        </p>
      </div>
    </Section>
  );
}
