import { useEffect, useRef } from "react";
import {
  BarChart3,
  CheckCircle2,
  Globe2,
  MousePointerClick,
  Smartphone,
  Sparkles,
  UsersRound,
  Workflow,
  Zap,
} from "lucide-react";

const KEYWORDS = ["Weboldal", "Lead", "CRM", "Automatizáció", "Analytics"];

export function Hero3D() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;

    if (!scene) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const finePointer = window.matchMedia("(pointer: fine)");

    if (reducedMotion.matches || !finePointer.matches) {
      return;
    }

    let frame = 0;

    const reset = () => {
      cancelAnimationFrame(frame);
      scene.style.removeProperty("--hero-rx");
      scene.style.removeProperty("--hero-ry");
      scene.style.removeProperty("--hero-back-x");
      scene.style.removeProperty("--hero-back-y");
      scene.style.removeProperty("--hero-front-x");
      scene.style.removeProperty("--hero-front-y");
      scene.style.removeProperty("--hero-opposite-x");
      scene.style.removeProperty("--hero-opposite-y");
      scene.style.removeProperty("--hero-mid-x");
      scene.style.removeProperty("--hero-mid-y");
      scene.style.removeProperty("--hero-phone-x");
      scene.style.removeProperty("--hero-phone-y");
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = scene.getBoundingClientRect();
      const x = Math.max(
        -1,
        Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2),
      );
      const y = Math.max(
        -1,
        Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2),
      );

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        scene.style.setProperty("--hero-rx", `${-7 - y * 9}deg`);
        scene.style.setProperty("--hero-ry", `${-10 + x * 16}deg`);
        scene.style.setProperty("--hero-back-x", `${x * 7}px`);
        scene.style.setProperty("--hero-back-y", `${y * 5}px`);
        scene.style.setProperty("--hero-front-x", `${x * 19}px`);
        scene.style.setProperty("--hero-front-y", `${y * 13}px`);
        scene.style.setProperty("--hero-opposite-x", `${-x * 14}px`);
        scene.style.setProperty("--hero-opposite-y", `${-y * 10}px`);
        scene.style.setProperty("--hero-mid-x", `${x * 11}px`);
        scene.style.setProperty("--hero-mid-y", `${-y * 8}px`);
        scene.style.setProperty("--hero-phone-x", `${-x * 20}px`);
        scene.style.setProperty("--hero-phone-y", `${y * 14}px`);
      });
    };

    scene.addEventListener("pointermove", onPointerMove);
    scene.addEventListener("pointerleave", reset);

    return () => {
      cancelAnimationFrame(frame);
      scene.removeEventListener("pointermove", onPointerMove);
      scene.removeEventListener("pointerleave", reset);
    };
  }, []);

  return (
    <div ref={sceneRef} className="hero3d-scene" aria-hidden="true">
      <div className="hero3d-aura hero3d-aura-one" />
      <div className="hero3d-aura hero3d-aura-two" />

      <div className="hero3d-world">
        <div className="hero3d-browser">
          <div className="hero3d-browserbar">
            <span className="hero3d-dot" />
            <span className="hero3d-dot" />
            <span className="hero3d-dot" />
            <span className="hero3d-url">vallalkozasod.hu</span>
          </div>
          <div className="hero3d-webcanvas">
            <span className="hero3d-kicker">
              <Sparkles className="h-3 w-3" />
              Ügyfélszerző weboldal
            </span>
            <p className="hero3d-headline">
              A látogatóból legyen valódi érdeklődő.
            </p>
            <p className="hero3d-copy">
              Gyors oldal, világos ajánlat, mérhető CTA és továbbépíthető
              folyamat.
            </p>
            <span className="hero3d-cta">
              Ajánlatot kérek
              <MousePointerClick className="h-3 w-3" />
            </span>

            <div className="hero3d-webgrid">
              <div className="hero3d-webtile" />
              <div className="hero3d-webtile" />
              <div className="hero3d-webtile" />
            </div>
          </div>
        </div>

        <div className="hero3d-card hero3d-crm">
          <div className="hero3d-cardtop">
            <span className="hero3d-cardlabel">
              <UsersRound className="h-3.5 w-3.5" />
              CRM
            </span>
            <span className="hero3d-status">Új lead</span>
          </div>
          <p className="hero3d-leadname">Új érdeklődő</p>
          <p className="hero3d-leadmeta">
            Weboldal → ajánlatkérés → következő teendő
          </p>
          <div className="hero3d-pipeline">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="hero3d-card hero3d-analytics">
          <div className="hero3d-cardtop">
            <span className="hero3d-cardlabel">
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics
            </span>
            <span className="hero3d-status">Mérés aktív</span>
          </div>
          <div className="hero3d-analyticsgrid">
            <div className="hero3d-metric">
              <span>CTA kattintás</span>
              <strong>követve</strong>
            </div>
            <div className="hero3d-metric">
              <span>Űrlap</span>
              <strong>követve</strong>
            </div>
            <div className="hero3d-metric">
              <span>Forrás</span>
              <strong>UTM</strong>
            </div>
          </div>
        </div>

        <div className="hero3d-card hero3d-automation">
          <div className="hero3d-cardtop">
            <span className="hero3d-cardlabel">
              <Workflow className="h-3.5 w-3.5" />
              Automatizáció
            </span>
            <Zap className="h-4 w-4 text-success" />
          </div>
          <div className="hero3d-automationline">
            <span className="hero3d-node">Űrlap</span>
            <span className="hero3d-arrow">→</span>
            <span className="hero3d-node">CRM</span>
            <span className="hero3d-arrow">→</span>
            <span className="hero3d-node">Értesítés</span>
          </div>
        </div>

        <div className="hero3d-phone">
          <div className="hero3d-phonebar" />
          <div className="hero3d-phonebody">
            <Smartphone className="h-3.5 w-3.5 text-brand" />
            <div className="hero3d-phonehero mt-2" />
            <div className="hero3d-phoneline" />
            <div className="hero3d-phoneline short" />
            <div className="hero3d-phonebutton">Ajánlatkérés</div>
            <CheckCircle2 className="mx-auto mt-3 h-4 w-4 text-success" />
          </div>
        </div>
      </div>

      <ul className="hero3d-keywords">
        {KEYWORDS.map((keyword, index) => (
          <li key={keyword}>
            {index === 0 && <Globe2 className="mr-1 inline h-3 w-3" />}
            {keyword}
          </li>
        ))}
      </ul>
    </div>
  );
}
