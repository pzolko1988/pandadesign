import {
  CONSENT_CHANGE_EVENT,
  readConsent,
  type ConsentState,
} from "@/lib/consent";
import { AUDIT_PATH } from "@/lib/marketing-content";

// GA4 csak akkor töltődik be, ha:
//   1. a VITE_GA4_MEASUREMENT_ID környezeti változó be van állítva, és
//   2. a látogató hozzájárult az analitikai sütikhez.
// Google Consent Mode v2 alapértelmezésként mindent "denied" állapotra állít.

export type AnalyticsEventName =
  | "audit_cta_click"
  | "contact_cta_click"
  | "audit_form_start"
  | "audit_form_submit"
  | "contact_form_start"
  | "contact_form_submit"
  | "pricing_cta_click"
  | "reference_view"
  | "calculator_complete";

type EventParams = Record<string, string | number | boolean | undefined>;

type GtagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}

const MEASUREMENT_ID = (
  (import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined) ?? ""
).trim();

let initialized = false;
let scriptLoaded = false;
let analyticsGranted = false;

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer ?? [];
  // A gtag.js az "arguments" objektumot várja, nem tömböt.
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

function consentToGoogle(state: ConsentState | null) {
  return {
    analytics_storage: state?.analytics ? "granted" : "denied",
    ad_storage: state?.marketing ? "granted" : "denied",
    ad_user_data: state?.marketing ? "granted" : "denied",
    ad_personalization: state?.marketing ? "granted" : "denied",
  };
}

function loadGoogleTag() {
  if (scriptLoaded || !MEASUREMENT_ID) {
    return;
  }

  scriptLoaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID, { anonymize_ip: true });
}

function applyConsent(state: ConsentState | null) {
  analyticsGranted = state?.analytics === true;
  gtag("consent", "update", consentToGoogle(state));

  if (analyticsGranted) {
    loadGoogleTag();
  }
}

function classifyLink(anchor: HTMLAnchorElement): AnalyticsEventName | null {
  const explicit = anchor.dataset.track as AnalyticsEventName | undefined;

  if (explicit) {
    return explicit;
  }

  let url: URL;

  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return null;
  }

  if (url.origin !== window.location.origin) {
    return null;
  }

  if (url.pathname === AUDIT_PATH) {
    return "audit_cta_click";
  }

  if (url.pathname === "/kapcsolat") {
    return "contact_cta_click";
  }

  return null;
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as Element | null;
  const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;

  if (!anchor) {
    return;
  }

  const name = classifyLink(anchor);

  if (!name) {
    return;
  }

  trackEvent(name, {
    link_text: anchor.textContent?.trim().slice(0, 100),
    link_url: anchor.getAttribute("href") ?? "",
    placement: anchor.dataset.trackPlacement,
    package: anchor.dataset.trackPackage,
  });
}

export function initAnalytics() {
  if (initialized || typeof window === "undefined") {
    return;
  }

  initialized = true;
  window.gtag = window.gtag ?? (gtag as GtagFunction);

  gtag("consent", "default", {
    ...consentToGoogle(null),
    wait_for_update: 500,
  });

  applyConsent(readConsent());

  window.addEventListener(CONSENT_CHANGE_EVENT, (event) => {
    applyConsent((event as CustomEvent<ConsentState>).detail);
  });

  document.addEventListener("click", handleDocumentClick, { capture: true });
}

export function trackEvent(name: AnalyticsEventName, params: EventParams = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );

  if (import.meta.env.DEV) {
    console.debug("[analytics]", name, cleanParams);
  }

  // Hozzájárulás nélkül semmilyen esemény nem kerül rögzítésre.
  if (!analyticsGranted) {
    return;
  }

  gtag("event", name, cleanParams);
}
