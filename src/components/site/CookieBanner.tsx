import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "pandadesign.cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {}
  }, []);

  const save = (value: string) => {
    try { localStorage.setItem(KEY, value); } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto max-w-4xl rounded-2xl border bg-white shadow-elegant p-5 md:p-6">
        {!showSettings ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-ink-soft max-w-2xl">
              <p className="font-semibold text-ink mb-1">Sütik használata</p>
              A weboldal működéséhez szükséges sütiket használunk. Analitikai és marketing sütiket
              kizárólag az Ön hozzájárulásával töltünk be.
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>Beállítások</Button>
              <Button variant="ghost" size="sm" onClick={() => save("rejected")}>Elutasítom</Button>
              <Button variant="cta" size="sm" onClick={() => save("accepted")}>Elfogadom</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-ink">Süti beállítások</p>
            <ul className="space-y-2 text-ink-soft">
              <li><span className="font-medium text-ink">Szükséges sütik:</span> mindig aktívak, az oldal működéséhez elengedhetetlenek.</li>
              <li><span className="font-medium text-ink">Analitikai sütik:</span> a látogatottság mérésére, csak hozzájárulással.</li>
              <li><span className="font-medium text-ink">Marketing sütik:</span> személyre szabott hirdetésekhez, csak hozzájárulással.</li>
            </ul>
            <div className="flex flex-wrap gap-2 justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={() => save("rejected")}>Csak a szükségeseket</Button>
              <Button variant="cta" size="sm" onClick={() => save("accepted")}>Mindent elfogadok</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}