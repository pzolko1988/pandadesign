import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Section } from "./Section-8HdnrJ18.mjs";
import { t as Button } from "./button-Dg6i7XXP.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as Check, P as ArrowRight } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/szolgaltatasok-DpQlKp5b.js
var import_jsx_runtime = require_jsx_runtime();
var SERVICES = [
	{
		title: "WordPress weboldal készítés",
		audience: "Kis- és középvállalkozásoknak, akik szeretnék maguk is szerkeszteni az oldalt.",
		includes: [
			"Egyedi WordPress téma vagy bővített prémium sablon",
			"Reszponzív dizájn",
			"Alap SEO",
			"Blog modul",
			"Betanítás"
		],
		benefits: [
			"Rugalmas tartalomkezelés",
			"Nagy bővítmény-ökoszisztéma",
			"Alacsony belépési költség"
		],
		scope: "2–5 hét"
	},
	{
		title: "Céges weboldal készítés",
		audience: "Szolgáltató vállalkozásoknak, akik professzionális bemutatkozó oldalt szeretnének.",
		includes: [
			"5–10 aloldal",
			"Egyedi arculati elemek",
			"Kapcsolat és ajánlatkérő űrlap",
			"Google Analytics"
		],
		benefits: [
			"Erősebb bizalom",
			"Több minőségi érdeklődő",
			"Egységes brand-megjelenés"
		],
		scope: "3–6 hét"
	},
	{
		title: "Landing oldal készítés",
		audience: "Kampányokhoz, termékbevezetésekhez, egy konkrét cél elérésére.",
		includes: [
			"Egyoldalas kampányoldal",
			"Konverzió-orientált szerkezet",
			"A/B teszt-ready",
			"Űrlap integráció"
		],
		benefits: [
			"Magas konverzió",
			"Gyors indulás",
			"Mérhető kampányeredmények"
		],
		scope: "1–2 hét"
	},
	{
		title: "Webshop készítés",
		audience: "Kereskedőknek, akik online is szeretnének értékesíteni.",
		includes: [
			"Termékkatalógus",
			"Kosár és pénztár",
			"Online fizetés (Barion, Stripe stb.)",
			"Szállítási módok",
			"Rendeléskezelés"
		],
		benefits: [
			"Új értékesítési csatorna",
			"24/7 elérhető bolt",
			"Skálázható technológia"
		],
		scope: "4–10 hét"
	},
	{
		title: "Weboldal újratervezés",
		audience: "Meglévő oldalak modernizálásához, akik gyorsabb és letisztultabb megjelenést szeretnének.",
		includes: [
			"UX audit",
			"Új design rendszer",
			"Tartalom-migráció",
			"SEO megőrzése"
		],
		benefits: [
			"Jobb konverzió",
			"Modern márkakép",
			"Gyorsabb betöltés"
		],
		scope: "3–6 hét"
	},
	{
		title: "WordPress karbantartás",
		audience: "WordPress alapú oldalak tulajdonosainak, akiknek fontos a biztonság és a folytonosság.",
		includes: [
			"Rendszeres frissítések",
			"Biztonsági mentések",
			"Sebesség-monitorozás",
			"Kisebb módosítások"
		],
		benefits: [
			"Nyugodt üzemeltetés",
			"Kevesebb hibalehetőség",
			"Folyamatos elérhetőség"
		],
		scope: "Havi csomag"
	},
	{
		title: "SEO és teljesítményoptimalizálás",
		audience: "Vállalkozásoknak, akik szeretnének több organikus látogatót és jobb Core Web Vitals-t.",
		includes: [
			"Technikai SEO audit",
			"Sebességjavítás",
			"Meta és sémák",
			"Tartalmi javaslatok"
		],
		benefits: [
			"Jobb Google helyezés",
			"Alacsonyabb visszafordulás",
			"Erősebb felhasználói élmény"
		],
		scope: "2–4 hét"
	},
	{
		title: "Egyedi Next.js webalkalmazások",
		audience: "Komplexebb üzleti folyamatokhoz, ahol egy WordPress már nem elég.",
		includes: [
			"Egyedi UI/UX",
			"Backend integrációk",
			"Autentikáció",
			"Skálázható architektúra"
		],
		benefits: [
			"Maximális rugalmasság",
			"Kimagasló teljesítmény",
			"Prémium felhasználói élmény"
		],
		scope: "6+ hét"
	}
];
function Services() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
		eyebrow: "Szolgáltatások",
		title: "Amit kínálunk",
		description: "Egy csapat, egy folyamat – minden, amire egy modern online jelenléthez szükséged lehet.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-5 md:gap-6",
			children: SERVICES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
				className: "rounded-2xl border bg-white p-6 md:p-8 shadow-soft hover:shadow-elegant transition-shadow",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid lg:grid-cols-4 gap-6 lg:gap-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:col-span-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-xl font-bold text-ink",
								children: s.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-sm text-ink-soft",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-ink",
										children: "Kinek ajánljuk:"
									}),
									" ",
									s.audience
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-sm text-ink-soft",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-ink",
										children: "Tipikus időtáv:"
									}),
									" ",
									s.scope
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "cta",
								className: "mt-5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/kapcsolat",
									children: ["Ajánlatot kérek ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
								})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:col-span-3 grid md:grid-cols-2 gap-6 lg:border-l lg:pl-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase tracking-widest text-brand mb-3",
							children: "Mit tartalmaz"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2",
							children: s.includes.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start gap-2 text-sm text-ink-soft",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 mt-0.5 shrink-0 text-success" }), f]
							}, f))
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase tracking-widest text-brand mb-3",
							children: "Üzleti előnyök"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2",
							children: s.benefits.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start gap-2 text-sm text-ink-soft",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 mt-0.5 shrink-0 text-success" }), f]
							}, f))
						})] })]
					})]
				})
			}, s.title))
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "py-16 md:py-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "container-page",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-3xl bg-brand text-brand-foreground p-8 md:p-14 shadow-elegant text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-3xl md:text-4xl font-bold tracking-tight",
						children: "Nem találod amit keresel?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-brand-foreground/80 max-w-xl mx-auto",
						children: "Írd le pár mondatban a projektedet – 1 munkanapon belül válaszolunk konkrét lépésekkel."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						variant: "cta",
						className: "mt-7",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/kapcsolat",
							children: ["Beszéljünk ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
						})
					})
				]
			})
		})
	})] });
}
//#endregion
export { Services as component };
