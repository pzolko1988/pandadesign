import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="PandaDesign főoldal"
      className={`inline-flex items-center gap-3 font-semibold tracking-tight transition-opacity hover:opacity-90 ${className}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white font-extrabold text-lg shadow-sm">
        P
      </div>

      <div className="flex flex-col leading-none">
        <span className="text-xl font-bold">
          <span className="text-brand">Panda</span>
          <span className="text-success">Design</span>
        </span>

        <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Modern Web Studio
        </span>
      </div>
    </Link>
  );
}
