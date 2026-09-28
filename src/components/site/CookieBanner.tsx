import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  OPEN_CONSENT_SETTINGS_EVENT,
  readConsent,
  saveConsent,
} from "@/lib/consent";

export function CookieBanner() {
  const titleId = useId();
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!readConsent()) {
      setVisible(true);
    }

    function openSettings() {
      const current = readConsent();
      setAnalytics(current?.analytics ?? false);
      setMarketing(current?.marketing ?? false);
      setShowSettings(true);
      setVisible(true);
    }

    window.addEventListener(OPEN_CONSENT_SETTINGS_EVENT, openSettings);

    return () => {
      window.removeEventListener(OPEN_CONSENT_SETTINGS_EVENT, openSettings);
    };
  }, []);

  // A beállítások megnyitásakor a fókusz a panelre kerül (billentyűzetes elérés).
  useEffect(() => {
    if (visible && showSettings) {
      containerRef.current?.focus();
    }
  }, [visible, showSettings]);

  function save(choice: { analytics: boolean; marketing: boolean }) {
    saveConsent(choice);
    setVisible(false);
    setShowSettings(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="mx-auto max-h-[85vh] max-w-4xl overflow-y-auto rounded-2xl border bg-white p-5 shadow-elegant outline-none md:p-6"
      >
        {!showSettings ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl text-sm text-ink-soft">
              <p id={titleId} className="mb-1 font-semibold text-ink">
                Sütik használata
              </p>
              A weboldal működéséhez szükséges sütiket használunk. Analitikai és
              marketing sütiket kizárólag a hozzájárulásoddal töltünk be.
              Részletek a{" "}
              <Link
                to="/cookie-tajekoztato"
                className="font-semibold text-brand underline"
              >
                süti-tájékoztatóban
              </Link>
              .
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="min-h-11"
                onClick={() => setShowSettings(true)}
              >
                Beállítások
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="min-h-11"
                onClick={() => save({ analytics: false, marketing: false })}
              >
                Elutasítom
              </Button>
              <Button
                variant="cta"
                size="sm"
                className="min-h-11"
                onClick={() => save({ analytics: true, marketing: true })}
              >
                Elfogadom
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <p id={titleId} className="font-semibold text-ink">
              Süti-beállítások
            </p>
            <p className="text-ink-soft">
              A hozzájárulásodat bármikor módosíthatod vagy visszavonhatod a
              lábléc „Süti-beállítások” linkjével. Részletek a{" "}
              <Link
                to="/cookie-tajekoztato"
                className="font-semibold text-brand underline"
              >
                süti-tájékoztatóban
              </Link>
              .
            </p>

            <ul className="space-y-2">
              <ConsentRow
                title="Szükséges sütik"
                description="Az oldal működéséhez elengedhetetlenek (pl. a süti-döntésed tárolása). Mindig aktívak."
                checked
                disabled
              />
              <ConsentRow
                title="Analitikai sütik"
                description="Névtelen látogatottsági statisztika és a konverziók mérése, hogy javítani tudjuk az oldalt."
                checked={analytics}
                onChange={setAnalytics}
              />
              <ConsentRow
                title="Marketing sütik"
                description="Hirdetések méréséhez és személyre szabásához."
                checked={marketing}
                onChange={setMarketing}
              />
            </ul>

            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="min-h-11"
                onClick={() => save({ analytics: false, marketing: false })}
              >
                Csak a szükségesek
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="min-h-11"
                onClick={() => save({ analytics, marketing })}
              >
                Kiválasztottak mentése
              </Button>
              <Button
                variant="cta"
                size="sm"
                className="min-h-11"
                onClick={() => save({ analytics: true, marketing: true })}
              >
                Mindent elfogadok
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConsentRow({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  const id = useId();

  return (
    <li className="flex items-start gap-3 rounded-xl border p-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--brand)] disabled:opacity-60"
      />
      <label htmlFor={id} className="text-ink-soft">
        <span className="block font-medium text-ink">{title}</span>
        {description}
      </label>
    </li>
  );
}
