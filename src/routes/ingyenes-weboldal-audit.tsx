import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock3, ListChecks, MessageSquare } from "lucide-react";
import { AuditForm } from "@/components/site/AuditForm";
import { AUDIT_PATH } from "@/lib/marketing-content";
import { buildSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/ingyenes-weboldal-audit")({
  head: () =>
    buildSeoHead({
      title: "Ingyenes 15 perces weboldal-audit | PandaDesign",
      description:
        "Megmutatjuk azt a 3 legfontosabb pontot, amely visszafoghatja a weboldalad ügyfélszerzését. Díjmentes, kötelezettség nélküli weboldal-audit vállalkozásoknak.",
      path: AUDIT_PATH,
    }),
  component: AuditPage,
});

const STEPS = [
  {
    icon: ListChecks,
    title: "Kitöltöd az űrlapot",
    text: "Megadod a weboldalad címét és azt, miben kérsz segítséget.",
  },
  {
    icon: CheckCircle2,
    title: "Átnézzük az oldalt",
    text: "Megnézzük az üzenetet, a felépítést, a mobilnézetet, a sebességet és a mérést.",
  },
  {
    icon: MessageSquare,
    title: "15 perces egyeztetés",
    text: "Megmutatjuk a 3 legfontosabb javítási pontot – akkor is hasznos, ha nem velünk dolgozol tovább.",
  },
];

const CHECKS = [
  "Kiderül-e 5 másodperc alatt, mit kínálsz és kinek",
  "Van-e egyértelmű következő lépés (CTA)",
  "Mobilnézet és betöltési sebesség",
  "Bizalomépítő elemek és ajánlatkérési út",
  "SEO-alapok: címek, leírások, szerkezet",
  "Mérhető-e, honnan jönnek a megkeresések",
];

function AuditPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b bg-secondary/35 py-14 md:py-20">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(800px_400px_at_90%_0%,color-mix(in_oklab,var(--brand)_10%,transparent),transparent)]"
        />
        <div className="container-page relative">
          <p className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-semibold text-ink-soft">
            <Clock3 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
            Ingyenes · 15 perc · kötelezettség nélkül
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Ingyenes 15 perces weboldal-audit
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
            Megmutatjuk azt a 3 legfontosabb pontot, amely jelenleg
            visszafoghatja a weboldalad ügyfélszerzését.
          </p>
        </div>
      </section>

      <section className="container-page py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          <aside className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-ink">Hogyan működik?</h2>
              <ol className="mt-5 space-y-4">
                {STEPS.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                      <step.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-semibold text-ink">
                        {index + 1}. {step.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-soft">
              <h2 className="font-bold text-ink">Mit nézünk meg?</h2>
              <ul className="mt-4 space-y-2.5">
                {CHECKS.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-ink-soft">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-success"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="rounded-2xl border bg-white p-6 shadow-elegant md:p-8">
            <h2 className="text-2xl font-bold text-ink">
              Kérem az ingyenes auditot
            </h2>
            <p className="mt-2 mb-7 text-sm text-ink-soft">
              A csillaggal jelölt mezők kitöltése kötelező.
            </p>
            <AuditForm />
          </div>
        </div>
      </section>
    </>
  );
}
