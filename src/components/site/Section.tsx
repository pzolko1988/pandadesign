import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
  align = "left",
  tone = "default",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  align?: "left" | "center";
  tone?: "default" | "muted" | "brand";
}) {
  const bg =
    tone === "muted" ? "bg-secondary/50" : tone === "brand" ? "bg-brand text-brand-foreground" : "";
  return (
      <section id={id} className={`py-16 md:py-24 ${bg} ${className}`}>
      <div className="container-page">
        {(eyebrow || title || description) && (
            <div className={`max-w-2xl mb-10 md:mb-14 ${align === "center" ? "mx-auto text-center" : ""}`}>
            {eyebrow && (
              <p className={`text-xs font-semibold tracking-widest uppercase mb-3 ${tone === "brand" ? "text-success" : "text-brand"}`}>
                {eyebrow}
              </p>
            )}
            {title && (
                <h2 className={`text-[28px] leading-[1.15] md:text-4xl lg:text-[44px] font-bold ${tone === "brand" ? "" : "text-ink"}`}>
                {title}
              </h2>
            )}
            {description && (
                <p className={`mt-4 text-[15px] md:text-lg leading-relaxed ${tone === "brand" ? "text-brand-foreground/80" : "text-ink-soft"}`}>
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}