globalThis.__nitro_main__ = import.meta.url;
import { n as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/assets/aszf-CByqx18T.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"592-kB2o0Vgg9VBDbVNLKP747LmLI04\"",
		"mtime": "2026-07-26T19:18:51.597Z",
		"size": 1426,
		"path": "../public/assets/aszf-CByqx18T.js"
	},
	"/assets/adatkezeles-OhY2tiLN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"742-ekgVL98BYIeKnu5R1W4PGYrvwfQ\"",
		"mtime": "2026-07-26T19:18:51.581Z",
		"size": 1858,
		"path": "../public/assets/adatkezeles-OhY2tiLN.js"
	},
	"/assets/arrow-right-BB2teO-e.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-f6s/JKU/eaMP0fdQ8TarhuJUQ54\"",
		"mtime": "2026-07-26T19:18:51.581Z",
		"size": 154,
		"path": "../public/assets/arrow-right-BB2teO-e.js"
	},
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-07-26T17:45:49.435Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"16-iUOtJ2RsHfdY9DoQxaq0wz1LZCU\"",
		"mtime": "2026-07-26T17:45:45.827Z",
		"size": 22,
		"path": "../public/robots.txt"
	},
	"/assets/arak-BPQA2H7U.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1981-KZpfOZwWC+7BnwiXJkDCnLo21bE\"",
		"mtime": "2026-07-26T19:18:51.581Z",
		"size": 6529,
		"path": "../public/assets/arak-BPQA2H7U.js"
	},
	"/assets/card-BktcVyxT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"408-fDHF6cRIhvfZXcoduRin/JG5yIc\"",
		"mtime": "2026-07-26T19:18:51.597Z",
		"size": 1032,
		"path": "../public/assets/card-BktcVyxT.js"
	},
	"/assets/blog-CwDBJaV3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff7-YtzGzohGtxiALbavYP73mapXJaI\"",
		"mtime": "2026-07-26T19:18:51.597Z",
		"size": 4087,
		"path": "../public/assets/blog-CwDBJaV3.js"
	},
	"/assets/check-BPIG9WiG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"71-AXafYSJArumXGcpy0KGDNGRQ3PU\"",
		"mtime": "2026-07-26T19:18:51.597Z",
		"size": 113,
		"path": "../public/assets/check-BPIG9WiG.js"
	},
	"/assets/dist-64XGo7wn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3ad6-t19dJ48Y/UsAWZXyWm87xCDh9F4\"",
		"mtime": "2026-07-26T19:18:51.597Z",
		"size": 15062,
		"path": "../public/assets/dist-64XGo7wn.js"
	},
	"/assets/kapcsolat-BN_biStQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"221d5-LvVYD2jrQCdfKHnIwrTLKTMd6X8\"",
		"mtime": "2026-07-26T19:18:51.597Z",
		"size": 139733,
		"path": "../public/assets/kapcsolat-BN_biStQ.js"
	},
	"/assets/referenciak-BvYjVfad.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ae7-HJZOKMD/dzNDE0ZESVeZRdgwX78\"",
		"mtime": "2026-07-26T19:18:51.597Z",
		"size": 6887,
		"path": "../public/assets/referenciak-BvYjVfad.js"
	},
	"/assets/routes-D3im7d15.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"77b2-OJW6LnQ6IH7Og6aLFc+AIuI2b2U\"",
		"mtime": "2026-07-26T19:18:51.597Z",
		"size": 30642,
		"path": "../public/assets/routes-D3im7d15.js"
	},
	"/assets/rolunk-DGr_kENV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19e3-bvC8ryKXG8ThFrEF8AzSnvPF6ho\"",
		"mtime": "2026-07-26T19:18:51.597Z",
		"size": 6627,
		"path": "../public/assets/rolunk-DGr_kENV.js"
	},
	"/assets/Section-YVUZJ0wK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3a3-s14Dt1ywN3cGKBKhd4Lu5Dq+34w\"",
		"mtime": "2026-07-26T19:18:51.581Z",
		"size": 931,
		"path": "../public/assets/Section-YVUZJ0wK.js"
	},
	"/assets/styles-C_oMkDAH.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1902e-Hol0yC9LN/6FmEWvEnVubpXz7NY\"",
		"mtime": "2026-07-26T19:18:51.597Z",
		"size": 102446,
		"path": "../public/assets/styles-C_oMkDAH.css"
	},
	"/assets/sutik-D6a1PJyn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4c5-1h1dD4TuPWdR3gw76atKTwB2P3Y\"",
		"mtime": "2026-07-26T19:18:51.597Z",
		"size": 1221,
		"path": "../public/assets/sutik-D6a1PJyn.js"
	},
	"/assets/sparkles-D9PK-V2_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e3-dcC905bCexTYUCKDoOnH9xuHJkE\"",
		"mtime": "2026-07-26T19:18:51.597Z",
		"size": 483,
		"path": "../public/assets/sparkles-D9PK-V2_.js"
	},
	"/assets/index-CMJ21Rsf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"58d23-TCgyRB6v4YBJs9APsqT7LahYUGU\"",
		"mtime": "2026-07-26T19:18:51.581Z",
		"size": 363811,
		"path": "../public/assets/index-CMJ21Rsf.js"
	},
	"/assets/szolgaltatasok-Cl4M8yIF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"167e-wLTM80y4J7qlsjP7CfCgEXD53ok\"",
		"mtime": "2026-07-26T19:18:51.597Z",
		"size": 5758,
		"path": "../public/assets/szolgaltatasok-Cl4M8yIF.js"
	},
	"/assets/utils-DA6WTctj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8e7f-tyRvduUOjK19uu7knABzVptP5aU\"",
		"mtime": "2026-07-26T19:18:51.597Z",
		"size": 36479,
		"path": "../public/assets/utils-DA6WTctj.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_iT5tbq = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_iT5tbq
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
