import { n as __toESM } from "../_runtime.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Section } from "./Section-8HdnrJ18.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as CardContent, t as Card } from "./card-CH7CIgFY.mjs";
import { N as Calendar, P as ArrowRight } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/blog-BFvaHsQV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATS = [
	"Összes",
	"Weboldalkészítés",
	"Online marketing",
	"SEO",
	"WordPress",
	"Vállalkozás",
	"Webshop"
];
var POSTS = [
	{
		title: "Mennyibe kerül egy céges weboldal 2026-ban?",
		excerpt: "Áttekintés a magyar piaci árakról, a csomagok tartalmáról és arról, mire figyelj a döntésnél.",
		cat: "Vállalkozás",
		date: "2026.03.10",
		read: "6 perc"
	},
	{
		title: "WordPress vagy egyedi fejlesztés?",
		excerpt: "Melyik illik jobban egy induló vállalkozáshoz, és mikor éri meg belevágni egy Next.js alapú fejlesztésbe?",
		cat: "Weboldalkészítés",
		date: "2026.02.24",
		read: "8 perc"
	},
	{
		title: "Mitől lesz gyors egy weboldal?",
		excerpt: "Sebesség-optimalizálás, képek, Core Web Vitals és a valós felhasználói élmény összefüggései.",
		cat: "SEO",
		date: "2026.02.05",
		read: "7 perc"
	},
	{
		title: "Mire figyelj weboldalkészítő választásakor?",
		excerpt: "Kérdések, amelyeket érdemes feltenned, mielőtt szerződést kötsz egy ügynökséggel vagy freelancerrel.",
		cat: "Vállalkozás",
		date: "2026.01.18",
		read: "5 perc"
	},
	{
		title: "Miért fontos a mobilbarát weboldal?",
		excerpt: "A látogatók több mint fele mobilról érkezik – így alakítsd ki az oldalad, hogy ne veszíts érdeklődőt.",
		cat: "Weboldalkészítés",
		date: "2025.12.14",
		read: "4 perc"
	},
	{
		title: "Hogyan szerezhet több ügyfelet a weboldalad?",
		excerpt: "CTA-k, űrlapok, bizalomépítő elemek – gyakorlati tippek a konverzió növelésére.",
		cat: "Online marketing",
		date: "2025.11.22",
		read: "6 perc"
	}
];
function Blog() {
	const [active, setActive] = (0, import_react.useState)("Összes");
	const filtered = active === "Összes" ? POSTS : POSTS.filter((p) => p.cat === active);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
		eyebrow: "Blog",
		title: "Cikkek és útmutatók",
		description: "Praktikus tudás vállalkozóknak a modern webről.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "tablist",
				"aria-label": "Kategória szűrés",
				className: "flex flex-wrap gap-2 mb-10",
				children: CATS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					role: "tab",
					"aria-selected": active === c,
					onClick: () => setActive(c),
					className: `px-4 py-2 rounded-full text-sm font-medium border transition-all ${active === c ? "bg-brand text-brand-foreground border-brand shadow-sm" : "bg-white text-ink-soft border-ink/10 hover:text-brand hover:border-brand/40"}`,
					children: c
				}, c))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6",
				children: filtered.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "overflow-hidden border shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all h-full flex flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "aspect-[16/9] bg-gradient-to-br from-brand/12 via-brand/4 to-success/10 relative border-b",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 grid place-items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-white/90 backdrop-blur border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-brand",
								children: p.cat
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-6 flex-1 flex flex-col",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs text-ink-soft",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" }), p.date]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [p.read, " olvasás"] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-2 text-lg font-bold text-ink leading-snug",
								children: p.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-ink-soft leading-relaxed flex-1",
								children: p.excerpt
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand self-start",
								children: ["Tovább olvasom ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
							})
						]
					})]
				}, p.title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-10 text-sm text-ink-soft text-center",
				children: "A cikkek helyőrző tartalmak – hamarosan valós blogbejegyzésekkel bővítjük."
			})
		]
	});
}
//#endregion
export { Blog as component };
