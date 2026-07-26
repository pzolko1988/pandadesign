import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/sutik")({
  head: () => ({
    meta: [
      { title: "Süti tájékoztató — PandaDesign" },
      { name: "description", content: "A PandaDesign weboldalán használt sütik és beállítási lehetőségek – helyőrző tartalom." },
      { property: "og:title", content: "Süti tájékoztató — PandaDesign" },
      { property: "og:description", content: "Süti tájékoztató – helyőrző tartalom." },
      { property: "og:url", content: "/sutik" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/sutik" }],
  }),
  component: Cookies,
});

function Cookies() {
  return (
    <Section eyebrow="Jogi információ" title="Süti tájékoztató">
      <div className="max-w-3xl text-ink-soft leading-relaxed space-y-4">
        <p className="rounded-xl border bg-white p-5 shadow-soft"><strong className="text-ink">Helyőrző tartalom.</strong> A pontos süti-lista a végleges elemzés és analitikai beállítások után kerül ide.</p>
        <h3 className="text-lg font-semibold text-ink pt-4">Szükséges sütik</h3>
        <p>Az oldal alap működéséhez nélkülözhetetlenek. Nem igényelnek hozzájárulást.</p>
        <h3 className="text-lg font-semibold text-ink pt-4">Analitikai sütik</h3>
        <p>A látogatottság mérésére szolgálnak. Csak az Ön kifejezett hozzájárulásával töltjük be.</p>
        <h3 className="text-lg font-semibold text-ink pt-4">Marketing sütik</h3>
        <p>Személyre szabott hirdetések megjelenítésére szolgálnak. Csak az Ön hozzájárulásával aktiváljuk.</p>
      </div>
    </Section>
  );
}