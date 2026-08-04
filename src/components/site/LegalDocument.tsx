import { useEffect, useMemo } from "react";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import type { PublicLegalPage } from "@/lib/legal-pages";
import { sanitizeLegalHtml } from "@/lib/sanitize-legal-html";

export function LegalDocumentPage({
  page,
  fallbackTitle,
}: {
  page: PublicLegalPage | null;
  fallbackTitle: string;
}) {
  if (!page) {
    return <LegalDocumentUnavailable title={fallbackTitle} />;
  }

  return (
    <main className="bg-secondary/30 py-14 md:py-20">
      <article className="container-page">
        <div className="mx-auto max-w-4xl rounded-3xl border bg-white px-5 py-8 shadow-soft sm:px-8 md:px-12 md:py-12">
          <header className="border-b pb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Jogi információ
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink md:text-5xl">
              {page.title}
            </h1>
            <LegalDocumentMetadata page={page} />
          </header>

          <LegalDocumentRenderer html={page.content} className="mt-10" />
        </div>
      </article>
    </main>
  );
}

export function LegalDocumentRenderer({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  const sanitizedHtml = useMemo(() => sanitizeLegalHtml(html), [html]);

  return (
    <div
      className={`overflow-x-auto text-base leading-8 text-ink [&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h3]:mb-3 [&_h3]:mt-10 [&_h3]:text-2xl [&_h3]:font-bold [&_p]:my-5 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-8 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-8 [&_li]:my-2 [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-brand [&_blockquote]:bg-brand/5 [&_blockquote]:px-6 [&_blockquote]:py-4 [&_blockquote]:text-lg [&_blockquote]:italic [&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_hr]:my-10 [&_hr]:border-border [&_table]:my-8 [&_table]:w-full [&_table]:min-w-[640px] [&_table]:border-collapse [&_th]:border [&_th]:bg-muted [&_th]:p-3 [&_th]:text-left [&_td]:border [&_td]:p-3 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

export function LegalDocumentMetadata({
  page,
}: {
  page: Pick<PublicLegalPage, "version" | "effective_from" | "updated_at">;
}) {
  return (
    <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-soft">
      <div>
        <dt className="font-semibold text-ink">Verzió</dt>
        <dd>{page.version}</dd>
      </div>
      {page.effective_from && (
        <div>
          <dt className="font-semibold text-ink">Hatálybalépés</dt>
          <dd>{formatDate(page.effective_from)}</dd>
        </div>
      )}
      <div>
        <dt className="font-semibold text-ink">Utolsó módosítás</dt>
        <dd>{formatDate(page.updated_at)}</dd>
      </div>
    </dl>
  );
}

export function LegalDocumentError({ error }: { error: unknown }) {
  useEffect(() => {
    console.error("A jogi dokumentum nem tölthető be:", error);
    reportLovableError(error, { boundary: "legal_document" });
  }, [error]);

  return (
    <main className="min-h-[60vh] bg-secondary/30 px-4 py-20">
      <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-soft">
        <h1 className="text-2xl font-bold text-ink">
          A dokumentum átmenetileg nem érhető el
        </h1>
        <p className="mt-3 text-ink-soft">
          Kérjük, próbáld meg később újra. Ha a probléma továbbra is fennáll,
          vedd fel velünk a kapcsolatot.
        </p>
      </div>
    </main>
  );
}

function LegalDocumentUnavailable({ title }: { title: string }) {
  return (
    <main className="min-h-[60vh] bg-secondary/30 px-4 py-20">
      <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-soft">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        <p className="mt-3 text-ink-soft">
          A dokumentum közzétett változata jelenleg nem érhető el. Kérjük,
          látogass vissza később, vagy kérj tájékoztatást elérhetőségeinken.
        </p>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}
