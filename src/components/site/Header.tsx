import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Főoldal" },
  { to: "/szolgaltatasok", label: "Szolgáltatások" },
  { to: "/referenciak", label: "Referenciák" },
  { to: "/arak", label: "Árak" },
  { to: "/rolunk", label: "Rólunk" },
  { to: "/blog", label: "Blog" },
  { to: "/kapcsolat", label: "Kapcsolat" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const onViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setOpen(false);
      }
    };

    mediaQuery.addEventListener("change", onViewportChange);

    return () => {
      mediaQuery.removeEventListener("change", onViewportChange);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "border-b bg-background/90 shadow-sm backdrop-blur-md"
          : "bg-background/60 backdrop-blur-sm"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Fő navigáció"
        >
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-brand-soft/60 hover:text-brand"
              activeProps={{
                className:
                  "rounded-md bg-brand-soft/60 px-3 py-2 text-sm font-medium text-brand",
              }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="cta">
            <Link to="/kapcsolat">Ajánlatot kérek</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border text-ink transition-colors hover:bg-brand-soft/60 hover:text-brand lg:hidden"
          aria-label={open ? "Menü bezárása" : "Menü megnyitása"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((currentOpen) => !currentOpen)}
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        id="mobile-nav"
        aria-hidden={!open}
        className={`overflow-hidden border-t bg-background transition-all duration-300 ease-out lg:hidden ${
          open
            ? "max-h-[32rem] translate-y-0 opacity-100"
            : "max-h-0 -translate-y-2 border-t-transparent opacity-0"
        }`}
      >
        <nav
          className="container-page flex flex-col gap-1 py-4"
          aria-label="Mobil navigáció"
        >
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-base font-medium text-ink transition-colors hover:bg-brand-soft/60"
              activeProps={{
                className:
                  "rounded-md bg-brand-soft/60 px-3 py-3 text-base font-medium text-brand",
              }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}

          <Button
            asChild
            variant="cta"
            className="mt-3"
            tabIndex={open ? undefined : -1}
          >
            <Link to="/kapcsolat" onClick={() => setOpen(false)}>
              Ajánlatot kérek
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}