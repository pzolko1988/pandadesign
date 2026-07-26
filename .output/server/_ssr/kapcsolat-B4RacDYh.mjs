import { n as __toESM } from "../_runtime.mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Section } from "./Section-8HdnrJ18.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as Button } from "./button-Dg6i7XXP.mjs";
import { A as ChevronUp, M as Check, _ as MapPin, j as ChevronDown, k as CircleCheck, p as Phone, v as Mail } from "../_libs/lucide-react.mjs";
import { n as objectType, r as stringType, t as literalType } from "../_libs/zod.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { a as SelectItemIndicator, c as SelectPortal, d as SelectSeparator$1, f as SelectTrigger$1, i as SelectItem$1, l as SelectScrollDownButton$1, m as SelectViewport, n as SelectContent$1, o as SelectItemText, p as SelectValue$1, r as SelectIcon, s as SelectLabel$1, t as Select$1, u as SelectScrollUpButton$1 } from "../_libs/@radix-ui/react-select+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kapcsolat-B4RacDYh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn(labelVariants(), className),
	...props
}));
Label.displayName = Root.displayName;
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
	ref,
	className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
	]
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel$1, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = SelectLabel$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator$1, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = SelectSeparator$1.displayName;
var schema = objectType({
	name: stringType().trim().min(2, "Add meg a neved (min. 2 karakter)").max(100),
	company: stringType().trim().max(120).optional().or(literalType("")),
	email: stringType().trim().email("Érvénytelen email cím").max(255),
	phone: stringType().trim().max(40).optional().or(literalType("")),
	service: stringType().min(1, "Válassz szolgáltatást"),
	budget: stringType().optional().or(literalType("")),
	deadline: stringType().optional().or(literalType("")),
	message: stringType().trim().min(10, "Írj néhány mondatot a projektről (min. 10 karakter)").max(2e3),
	consent: literalType(true, { errorMap: () => ({ message: "Kérjük fogadd el az adatkezelést" }) })
});
var INITIAL = {
	name: "",
	company: "",
	email: "",
	phone: "",
	service: "",
	budget: "",
	deadline: "",
	message: "",
	consent: false
};
function Contact() {
	const [data, setData] = (0, import_react.useState)(INITIAL);
	const [errors, setErrors] = (0, import_react.useState)({});
	const [state, setState] = (0, import_react.useState)("idle");
	const set = (k, v) => setData((d) => ({
		...d,
		[k]: v
	}));
	const submit = (e) => {
		e.preventDefault();
		const result = schema.safeParse(data);
		if (!result.success) {
			const map = {};
			for (const issue of result.error.issues) map[String(issue.path[0])] = issue.message;
			setErrors(map);
			setState("error");
			return;
		}
		setErrors({});
		setState("success");
		setData(INITIAL);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
		eyebrow: "Kapcsolat",
		title: "Beszéljük át a projektedet",
		description: "Töltsd ki az űrlapot és 1 munkanapon belül visszajelzünk egy konkrét következő lépéssel.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid lg:grid-cols-3 gap-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:col-span-1 space-y-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border bg-white p-6 shadow-soft",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold text-ink mb-4",
						children: "Elérhetőségek"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "space-y-3 text-sm text-ink-soft",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4 mt-0.5 text-brand" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "hello@pandadesign.hu" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4 mt-0.5 text-brand" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "+36 30 000 0000 (helyőrző)" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 mt-0.5 text-brand" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Budapest, Magyarország" })]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border bg-brand text-brand-foreground p-6 shadow-elegant",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: "Nem tudod pontosan mit szeretnél?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-brand-foreground/80",
						children: "Semmi gond – ingyenes konzultáció keretében segítünk letisztázni az igényeket."
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lg:col-span-2",
				children: state === "success" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border bg-white p-10 shadow-elegant text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mx-auto h-12 w-12 text-success" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-4 text-2xl font-bold text-ink",
							children: "Köszönjük az üzenetedet!"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-ink-soft",
							children: "1 munkanapon belül válaszolunk a megadott email címre."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-6",
							variant: "outline",
							onClick: () => setState("idle"),
							children: "Új üzenet küldése"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					noValidate: true,
					className: "rounded-2xl border bg-white p-6 md:p-8 shadow-soft space-y-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid md:grid-cols-2 gap-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Név *",
									error: errors.name,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: data.name,
										onChange: (e) => set("name", e.target.value),
										"aria-invalid": !!errors.name
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Cégnév",
									error: errors.company,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: data.company,
										onChange: (e) => set("company", e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Email *",
									error: errors.email,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "email",
										value: data.email,
										onChange: (e) => set("email", e.target.value),
										"aria-invalid": !!errors.email
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Telefonszám",
									error: errors.phone,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "tel",
										value: data.phone,
										onChange: (e) => set("phone", e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Kért szolgáltatás *",
									error: errors.service,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: data.service,
										onValueChange: (v) => set("service", v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"aria-invalid": !!errors.service,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Válassz…" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "landing",
												children: "Landing oldal"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "ceges",
												children: "Céges weboldal"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "webshop",
												children: "Webshop"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "ujratervezes",
												children: "Weboldal újratervezés"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "karbantartas",
												children: "WordPress karbantartás"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "seo",
												children: "SEO / optimalizálás"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "egyedi",
												children: "Egyedi Next.js fejlesztés"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "egyeb",
												children: "Egyéb"
											})
										] })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Becsült keret",
									error: errors.budget,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: data.budget,
										onValueChange: (v) => set("budget", v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Válassz…" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "0-100",
												children: "100 000 Ft alatt"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "100-250",
												children: "100 000 – 250 000 Ft"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "250-500",
												children: "250 000 – 500 000 Ft"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "500-1000",
												children: "500 000 – 1 000 000 Ft"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "1000+",
												children: "1 000 000 Ft felett"
											})
										] })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Kívánt határidő",
									error: errors.deadline,
									className: "md:col-span-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "pl. 2026. május",
										value: data.deadline,
										onChange: (e) => set("deadline", e.target.value)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Projekt leírása *",
									error: errors.message,
									className: "md:col-span-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 6,
										value: data.message,
										onChange: (e) => set("message", e.target.value),
										"aria-invalid": !!errors.message,
										placeholder: "Írj néhány mondatot a vállalkozásodról és arról, mire lenne szükséged."
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								id: "consent",
								checked: data.consent,
								onCheckedChange: (v) => set("consent", v === true),
								"aria-invalid": !!errors.consent
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								htmlFor: "consent",
								className: "text-sm text-ink-soft",
								children: [
									"Elolvastam és elfogadom az ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: "/adatkezeles",
										className: "text-brand underline",
										children: "adatkezelési tájékoztatót"
									}),
									". *"
								]
							})]
						}),
						errors.consent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-destructive",
							children: errors.consent
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "lg",
							variant: "cta",
							children: "Üzenet küldése"
						})
					]
				})
			})]
		})
	});
}
function Field({ label, error, children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `space-y-1.5 ${className}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				className: "text-sm font-medium text-ink",
				children: label
			}),
			children,
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-destructive",
				children: error
			})
		]
	});
}
//#endregion
export { Contact as component };
