import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";

const PRELOAD_RELOAD_GUARD = "pandadesign:vite-preload-reload";
const PRELOAD_RELOAD_COOLDOWN_MS = 60_000;

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();

  try {
    const previousReloadAt = Number(
      window.sessionStorage.getItem(PRELOAD_RELOAD_GUARD),
    );
    const now = Date.now();

    if (
      Number.isFinite(previousReloadAt) &&
      now - previousReloadAt < PRELOAD_RELOAD_COOLDOWN_MS
    ) {
      return;
    }

    window.sessionStorage.setItem(PRELOAD_RELOAD_GUARD, String(now));
  } catch {
    return;
  }

  window.location.reload();
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
  );
});
