import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Section } from "./Section-8HdnrJ18.mjs";
import { t as Button } from "./button-Dg6i7XXP.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as HeartHandshake, D as Compass, P as ArrowRight, a as Sparkles, c as ShieldCheck, d as Rocket, w as Handshake } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rolunk-D-2Ib7Go.js
var import_jsx_runtime = require_jsx_runtime();
var VALUES = [
	{
		icon: ShieldCheck,
		title: "Megbízhatóság",
		desc: "Amit vállalunk, azt határidőre és minőségben átadjuk."
	},
	{
		icon: Sparkles,
		title: "Igényes megjelenés",
		desc: "Minden projekt egyedi és a márka jellegéhez igazodik."
	},
	{
		icon: Rocket,
		title: "Gyorsaság",
		desc: "Fókuszált munkafolyamat rövid átfutási időkkel."
	},
	{
		icon: Handshake,
		title: "Átláthatóság",
		desc: "Tiszta árajánlat, egyértelmű kommunikáció minden szakaszban."
	},
	{
		icon: HeartHandshake,
		title: "Hosszú távú együttműködés",
		desc: "Nem eltűnünk átadás után – támogatunk üzemeltetésben és fejlesztésben is."
	},
	{
		icon: Compass,
		title: "Üzleti szemlélet",
		desc: "A weboldal nem cél, hanem eszköz – az üzleti eredmény számít."
	}
];
function About() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			eyebrow: "Rólunk",
			title: "Weboldalak, amelyek üzleti eredményt hoznak",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-3xl text-base md:text-lg text-ink-soft leading-relaxed",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xl md:text-3xl font-semibold text-ink leading-snug tracking-tight",
					children: "Hisszük, hogy egy jó weboldal nem csupán szépen néz ki, hanem támogatja a vállalkozás üzleti céljait is."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6",
					children: "A PandaDesign egy modern magyar web ügynökség kis- és középvállalkozásoknak. A célunk, hogy minden ügyfelünk professzionális, gyors és könnyen kezelhető online jelenlétet kapjon – az ötlettől a hosszú távú üzemeltetésig."
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			eyebrow: "Küldetés",
			title: "Miért vagyunk itt?",
			tone: "muted",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid lg:grid-cols-2 gap-10 lg:gap-14 items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 text-ink-soft leading-relaxed",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Sok magyar vállalkozás online jelenléte évek óta nem újult meg. Ezt szeretnénk megváltoztatni: modern, mobilra optimalizált és jól szerkeszthető oldalakat építünk, amelyek a valós vásárlási döntést támogatják." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Hiszünk az egyszerűségben, a letisztult designban és az őszinte kommunikációban. Nem ígérünk lehetetlent – amit vállalunk, azt magas színvonalon szállítjuk." })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "aspect-[4/5] max-w-sm mx-auto rounded-2xl bg-gradient-to-br from-brand/12 to-success/10 border shadow-elegant grid place-items-center p-8 text-center relative overflow-hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"aria-hidden": true,
							className: "absolute inset-0 opacity-40 bg-[radial-gradient(400px_200px_at_50%_0%,color-mix(in_oklab,var(--brand)_15%,transparent),transparent)]"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mx-auto h-28 w-28 rounded-full bg-white border shadow-elegant grid place-items-center text-3xl font-bold text-brand",
									children: "PD"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-6 text-sm font-semibold text-ink",
									children: "Alapító"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-ink-soft mt-1",
									children: "Professzionális fotó – helyőrző"
								})
							]
						})]
					})
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			eyebrow: "Értékeink",
			title: "Amiben hiszünk",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5",
				children: VALUES.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border bg-white p-7 shadow-soft h-full",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(v.icon, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-5 text-lg font-semibold text-ink",
							children: v.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-ink-soft leading-relaxed",
							children: v.desc
						})
					]
				}, v.title))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
			eyebrow: "Munkamódszer",
			title: "Hogyan dolgozunk?",
			tone: "muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid sm:grid-cols-2 gap-4 md:gap-5 max-w-4xl",
				children: [
					{
						t: "Személyes kommunikáció",
						d: "Nincs call center és ticket rendszer – közvetlenül azzal beszélsz, aki a projekten dolgozik."
					},
					{
						t: "Modern technológiák",
						d: "WordPress a rugalmas tartalomkezeléshez, Next.js a prémium egyedi alkalmazásokhoz."
					},
					{
						t: "Támogatás átadás után",
						d: "Karbantartás, apró javítások és hosszú távú együttműködés az élesítés után is."
					},
					{
						t: "Világos, magyar szakmai nyelv",
						d: "Kerüljük a felesleges szakzsargont – érthetően magyarázzuk el a döntéseket."
					}
				].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-white border p-7 shadow-soft h-full",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-semibold text-ink",
						children: x.t
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-ink-soft leading-relaxed",
						children: x.d
					})]
				}, x.t))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "lg",
					variant: "cta",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/kapcsolat",
						children: ["Beszéljünk a projektedről ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
					})
				})
			})]
		})
	] });
}
//#endregion
export { About as component };
