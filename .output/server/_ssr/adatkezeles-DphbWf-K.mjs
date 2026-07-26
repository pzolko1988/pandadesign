import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Section } from "./Section-8HdnrJ18.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/adatkezeles-DphbWf-K.js
var import_jsx_runtime = require_jsx_runtime();
function Legal({ title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
		eyebrow: "Jogi információ",
		title,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "prose max-w-3xl text-ink-soft leading-relaxed space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rounded-xl border bg-white p-5 shadow-soft",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						className: "text-ink",
						children: "Helyőrző tartalom."
					}), " Ez az oldal a jogi véglegesítésig helyőrző tartalmat tartalmaz. A publikálás előtt cégspecifikus, ügyvéd által ellenőrzött szöveget helyezünk el."]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-semibold text-ink pt-4",
					children: "1. Az adatkezelő"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "PandaDesign – teljes cégnév, cím, adószám és képviselő neve a végleges dokumentumban." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-semibold text-ink pt-4",
					children: "2. Kezelt adatok"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Kapcsolatfelvételi űrlap: név, email cím, telefonszám, cégnév, üzenet tartalma." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-semibold text-ink pt-4",
					children: "3. Az adatkezelés célja és jogalapja"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A megkeresés megválaszolása és az ajánlatadás elősegítése az érintett hozzájárulása alapján (GDPR 6. cikk (1) a) pont)." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-semibold text-ink pt-4",
					children: "4. Adattárolás időtartama"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Az ajánlatkérés lezárását követő 12 hónapig, vagy a hozzájárulás visszavonásáig." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-semibold text-ink pt-4",
					children: "5. Érintetti jogok"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Az érintett bármikor kérhet tájékoztatást, helyesbítést, törlést a hello@pandadesign.hu email címen." })
			]
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legal, { title: "Adatkezelési tájékoztató" });
//#endregion
export { SplitComponent as component };
