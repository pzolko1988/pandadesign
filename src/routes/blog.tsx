import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/site/Section";
import { ArrowRight, Calendar } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — PandaDesign" },
      { name: "description", content: "Hasznos cikkek weboldalkészítésről, WordPressről, SEO-ról és online marketingről magyar vállalkozásoknak." },
      { property: "og:title", content: "Blog — PandaDesign" },
      { property: "og:description", content: "Weboldalkészítés, WordPress, SEO és online marketing cikkek." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: Blog,
});

const CATS = ["Összes", "Weboldalkészítés", "Online marketing", "SEO", "WordPress", "Vállalkozás", "Webshop"] as const;
type Cat = typeof CATS[number];

const POSTS: Array<{ title: string; excerpt: string; cat: Cat; date: string; read: string }> = [
  { title: "Mennyibe kerül egy céges weboldal 2026-ban?", excerpt: "Áttekintés a magyar piaci árakról, a csomagok tartalmáról és arról, mire figyelj a döntésnél.", cat: "Vállalkozás", date: "2026.03.10", read: "6 perc" },
  { title: "WordPress vagy egyedi fejlesztés?", excerpt: "Melyik illik jobban egy induló vállalkozáshoz, és mikor éri meg belevágni egy Next.js alapú fejlesztésbe?", cat: "Weboldalkészítés", date: "2026.02.24", read: "8 perc" },
  { title: "Mitől lesz gyors egy weboldal?", excerpt: "Sebesség-optimalizálás, képek, Core Web Vitals és a valós felhasználói élmény összefüggései.", cat: "SEO", date: "2026.02.05", read: "7 perc" },
  { title: "Mire figyelj weboldalkészítő választásakor?", excerpt: "Kérdések, amelyeket érdemes feltenned, mielőtt szerződést kötsz egy ügynökséggel vagy freelancerrel.", cat: "Vállalkozás", date: "2026.01.18", read: "5 perc" },
  { title: "Miért fontos a mobilbarát weboldal?", excerpt: "A látogatók több mint fele mobilról érkezik – így alakítsd ki az oldalad, hogy ne veszíts érdeklődőt.", cat: "Weboldalkészítés", date: "2025.12.14", read: "4 perc" },
  { title: "Hogyan szerezhet több ügyfelet a weboldalad?", excerpt: "CTA-k, űrlapok, bizalomépítő elemek – gyakorlati tippek a konverzió növelésére.", cat: "Online marketing", date: "2025.11.22", read: "6 perc" },
];

function Blog() {
  const [active, setActive] = useState<Cat>("Összes");
  const filtered = active === "Összes" ? POSTS : POSTS.filter((p) => p.cat === active);
  return (
    <Section eyebrow="Blog" title="Cikkek és útmutatók" description="Praktikus tudás vállalkozóknak a modern webről.">
      <div role="tablist" aria-label="Kategória szűrés" className="flex flex-wrap gap-2 mb-10">
        {CATS.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={active === c}
            onClick={() => setActive(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              active === c
                ? "bg-brand text-brand-foreground border-brand shadow-sm"
                : "bg-white text-ink-soft border-ink/10 hover:text-brand hover:border-brand/40"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {filtered.map((p) => (
          <Card key={p.title} className="overflow-hidden border shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all h-full flex flex-col">
            <div className="aspect-[16/9] bg-gradient-to-br from-brand/12 via-brand/4 to-success/10 relative border-b">
              <div className="absolute inset-0 grid place-items-center">
                <span className="rounded-full bg-white/90 backdrop-blur border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-brand">{p.cat}</span>
              </div>
            </div>
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 text-xs text-ink-soft">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{p.date}</span>
                <span>•</span>
                <span>{p.read} olvasás</span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-ink leading-snug">{p.title}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed flex-1">{p.excerpt}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand self-start">
                Tovább olvasom <ArrowRight className="h-4 w-4" />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-10 text-sm text-ink-soft text-center">A cikkek helyőrző tartalmak – hamarosan valós blogbejegyzésekkel bővítjük.</p>
    </Section>
  );
}