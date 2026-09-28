// Süti-hozzájárulás állapota.
//
// A korábbi verzió egyetlen "accepted" / "rejected" értéket tárolt ugyanezen
// a kulcson – ezeket a readConsent() automatikusan az új, kategóriánkénti
// formára alakítja, így a már megadott döntéseket nem kell újra bekérni.

export const CONSENT_STORAGE_KEY = "pandadesign.cookie-consent";
export const CONSENT_CHANGE_EVENT = "pandadesign:consent-change";
export const OPEN_CONSENT_SETTINGS_EVENT = "pandadesign:open-cookie-settings";

export type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") {
    return null;
  }

  let raw: string | null = null;

  try {
    raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }

  if (!raw) {
    return null;
  }

  if (raw === "accepted" || raw === "rejected") {
    const granted = raw === "accepted";

    return {
      necessary: true,
      analytics: granted,
      marketing: granted,
      updatedAt: "",
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState>;

    return {
      necessary: true,
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return null;
  }
}

export function saveConsent(choice: {
  analytics: boolean;
  marketing: boolean;
}) {
  const state: ConsentState = {
    necessary: true,
    analytics: choice.analytics,
    marketing: choice.marketing,
    updatedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // A tárolás tiltott lehet; a döntés ettől még erre a munkamenetre érvényes.
  }

  window.dispatchEvent(
    new CustomEvent<ConsentState>(CONSENT_CHANGE_EVENT, { detail: state }),
  );

  return state;
}

export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_CONSENT_SETTINGS_EVENT));
}
