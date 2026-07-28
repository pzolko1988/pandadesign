import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/aszf")({
  head: () => ({
    meta: [
      { title: "Általános szerződési feltételek — PandaDesign" },
      {
        name: "description",
        content:
          "PandaDesign általános szerződési feltételei – helyőrző dokumentum a jogi véglegesítésig.",
      },
      {
        property: "og:title",
        content: "Általános szerződési feltételek — PandaDesign",
      },
      { property: "og:description", content: "ÁSZF – helyőrző tartalom." },
      { property: "og:url", content: "/aszf" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/aszf" }],
  }),
  component: ASZF,
});

function ASZF() {
  return (
    <Section eyebrow="Jogi információ" title="Általános szerződési feltételek">
      <div className="max-w-3xl text-ink-soft leading-relaxed space-y-4">
        <p className="rounded-xl border bg-white p-5 shadow-soft">
          <strong className="text-ink">Helyőrző tartalom.</strong> Az ÁSZF
          végleges változata jogi ellenőrzést követően kerül ki.
        </p>
        <h3 className="text-lg font-semibold text-ink pt-4">
          1. Szolgáltató adatai
        </h3>
        <p>PandaDesign – cégadatok a végleges dokumentumban.</p>
        <h3 className="text-lg font-semibold text-ink pt-4">
          2. Szolgáltatások köre
        </h3>
        <p>
          Weboldalak, webshopok tervezése és fejlesztése, karbantartási és
          támogatási szolgáltatások.
        </p>
        <h3 className="text-lg font-semibold text-ink pt-4">
          3. Árak és fizetés
        </h3>
        <p>
          A projekt kezdetén díjbekérőt küldünk, az árak minden esetben egyedi
          ajánlat alapján kerülnek meghatározásra.
        </p>
        <h3 className="text-lg font-semibold text-ink pt-4">
          4. Teljesítés és átadás
        </h3>
        <p>
          Az egyeztetett munkafolyamat szerint, projektspecifikus
          mérföldkövekkel.
        </p>
      </div>
    </Section>
  );
}
