import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Section-8HdnrJ18.js
var import_jsx_runtime = require_jsx_runtime();
function Section({ id, eyebrow, title, description, children, className = "", align = "left", tone = "default" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id,
		className: `py-16 md:py-24 ${tone === "muted" ? "bg-secondary/50" : tone === "brand" ? "bg-brand text-brand-foreground" : ""} ${className}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-page",
			children: [(eyebrow || title || description) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `max-w-2xl mb-10 md:mb-14 ${align === "center" ? "mx-auto text-center" : ""}`,
				children: [
					eyebrow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `text-xs font-semibold tracking-widest uppercase mb-3 ${tone === "brand" ? "text-success" : "text-brand"}`,
						children: eyebrow
					}),
					title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: `text-[28px] leading-[1.15] md:text-4xl lg:text-[44px] font-bold ${tone === "brand" ? "" : "text-ink"}`,
						children: title
					}),
					description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-4 text-[15px] md:text-lg leading-relaxed ${tone === "brand" ? "text-brand-foreground/80" : "text-ink-soft"}`,
						children: description
					})
				]
			}), children]
		})
	});
}
//#endregion
export { Section as t };
