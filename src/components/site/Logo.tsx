import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 font-semibold text-lg tracking-tight ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-brand-foreground text-sm font-bold">P</span>
      <span>
        <span className="text-brand">Panda</span>
        <span className="text-success">Design</span>
      </span>
    </Link>
  );
}