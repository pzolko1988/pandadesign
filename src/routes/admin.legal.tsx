import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ExternalLink,
  Eye,
  FilePenLine,
  History,
  RotateCcw,
  Save,
  Send,
} from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { LegalDocumentRenderer } from "@/components/site/LegalDocument";
import { Button } from "@/components/ui/button";
import type {
  AdminLegalPage,
  LegalPageDraft,
  LegalPageRevision,
  LegalPageStatus,
} from "@/lib/legal-pages";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/legal")({
  component: AdminLegalPage,
});

type LegalForm = {
  title: string;
  slug: string;
  version: string;
  effective_from: string;
  content: string;
};

const EMPTY_FORM: LegalForm = {
  title: "",
  slug: "",
  version: "1.0",
  effective_from: "",
  content: "<p></p>",
};

function AdminLegalPage() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<AdminLegalPage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<LegalForm>(EMPTY_FORM);
  const [revisions, setRevisions] = useState<LegalPageRevision[]>([]);
  const [viewingRevisionId, setViewingRevisionId] = useState<string | null>(
    null,
  );
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedId) ?? null,
    [pages, selectedId],
  );

  const loadPages = useCallback(async () => {
    const [pagesResult, draftsResult] = await Promise.all([
      supabase
        .from("legal_pages")
        .select(
          "id, slug, title, content, version, status, effective_from, published_at, created_at, updated_at, created_by, updated_by",
        )
        .order("slug", { ascending: true }),
      supabase
        .from("legal_page_drafts")
        .select(
          "legal_page_id, slug, title, content, version, effective_from, created_at, updated_at, created_by, updated_by",
        ),
    ]);

    if (pagesResult.error) {
      throw pagesResult.error;
    }

    if (draftsResult.error) {
      throw draftsResult.error;
    }

    const drafts = new Map(
      (draftsResult.data ?? []).map((item) => {
        const draft = normalizeDraft(item as Record<string, unknown>);
        return [draft.legal_page_id, draft] as const;
      }),
    );

    const loadedPages = (pagesResult.data ?? []).map((item) => {
      const page = normalizeAdminPage(item as Record<string, unknown>);
      const draft = drafts.get(page.id) ?? draftFromPage(page);

      return { ...page, draft };
    });

    setPages(loadedPages);
    return loadedPages;
  }, []);

  const initializePage = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        await navigate({ to: "/admin/login", replace: true });
        return;
      }

      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_admin");

      if (adminError) {
        throw adminError;
      }

      if (!isAdmin) {
        throw new Error(
          "Ehhez az oldalhoz nincs adminisztrátori jogosultságod.",
        );
      }

      setCurrentUser({
        id: session.user.id,
        email: session.user.email ?? session.user.id,
      });

      await loadPages();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A jogi dokumentumok betöltése nem sikerült.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadPages, navigate]);

  useEffect(() => {
    void initializePage();
  }, [initializePage]);

  function updateField<K extends keyof LegalForm>(
    field: K,
    value: LegalForm[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function loadRevisions(pageId: string) {
    const { data, error } = await supabase
      .from("legal_page_revisions")
      .select(
        "id, legal_page_id, slug, title, content, version, status, effective_from, published_at, created_at, created_by",
      )
      .eq("legal_page_id", pageId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    setRevisions(
      (data ?? []).map((item) =>
        normalizeRevision(item as Record<string, unknown>),
      ),
    );
  }

  async function openDocument(
    page: AdminLegalPage,
    options: { preview?: boolean; history?: boolean } = {},
  ) {
    setSelectedId(page.id);
    setForm(formFromDraft(page.draft));
    setShowPreview(options.preview ?? false);
    setShowHistory(options.history ?? false);
    setViewingRevisionId(null);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await loadRevisions(page.id);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A verzióelőzmények betöltése nem sikerült.",
      );
    }

    window.setTimeout(() => {
      document
        .getElementById("legal-document-editor")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function validateForm(): LegalForm | null {
    const normalized = {
      title: form.title.trim(),
      slug: form.slug.trim().toLowerCase(),
      version: form.version.trim(),
      effective_from: form.effective_from,
      content: form.content,
    };

    if (!normalized.title) {
      setErrorMessage("A dokumentum címe nem lehet üres.");
      return null;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized.slug)) {
      setErrorMessage(
        "A slug csak kisbetűket, számokat és kötőjelet tartalmazhat.",
      );
      return null;
    }

    if (!normalized.version) {
      setErrorMessage("A verziószám nem lehet üres.");
      return null;
    }

    return normalized;
  }

  async function persistDraft(pageId: string, normalized: LegalForm) {
    const { error } = await supabase.rpc("save_legal_page_draft", {
      p_page_id: pageId,
      p_title: normalized.title,
      p_slug: normalized.slug,
      p_content: normalized.content,
      p_version: normalized.version,
      p_effective_from: normalized.effective_from || null,
    });

    if (error) {
      throw error;
    }
  }

  async function refreshSelection(pageId: string) {
    const refreshedPages = await loadPages();
    const refreshedPage =
      refreshedPages.find((page) => page.id === pageId) ?? null;

    if (refreshedPage) {
      setSelectedId(refreshedPage.id);
      setForm(formFromDraft(refreshedPage.draft));
      await loadRevisions(refreshedPage.id);
    }
  }

  async function saveDraft(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!selectedPage) {
      return;
    }

    const normalized = validateForm();
    if (!normalized) {
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await persistDraft(selectedPage.id, normalized);
      await refreshSelection(selectedPage.id);
      setSuccessMessage("A piszkozat sikeresen elmentve.");
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A piszkozat mentése nem sikerült.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function publishDocument() {
    if (!selectedPage) {
      return;
    }

    const normalized = validateForm();
    if (!normalized) {
      return;
    }

    const plainText = normalized.content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!plainText) {
      setErrorMessage("Üres jogi dokumentum nem tehető közzé.");
      return;
    }

    const confirmed = window.confirm(
      `Biztosan közzéteszed ezt a dokumentumot?\n\n${normalized.title}\nVerzió: ${normalized.version}`,
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await persistDraft(selectedPage.id, normalized);

      const { error } = await supabase.rpc("publish_legal_page", {
        p_page_id: selectedPage.id,
      });

      if (error) {
        throw error;
      }

      await refreshSelection(selectedPage.id);
      setSuccessMessage("A dokumentum sikeresen közzétéve.");
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A dokumentum közzététele nem sikerült.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function restoreRevision(revision: LegalPageRevision) {
    if (!selectedPage) {
      return;
    }

    const confirmed = window.confirm(
      `Biztosan visszaállítod a(z) ${revision.version} verziót piszkozatként?\n\nA jelenlegi piszkozat új revisionként megmarad, a publikus dokumentum nem változik.`,
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase.rpc("restore_legal_page_revision", {
        p_revision_id: revision.id,
      });

      if (error) {
        throw error;
      }

      await refreshSelection(selectedPage.id);
      setViewingRevisionId(null);
      setSuccessMessage(
        `A(z) ${revision.version} verzió piszkozatként visszaállítva.`,
      );
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A verzió visszaállítása nem sikerült.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-muted-foreground">
          Jogi dokumentumok betöltése...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <Link
            to="/admin"
            className="text-sm font-semibold text-brand hover:underline"
          >
            ← Vissza az admin főoldalra
          </Link>
          <h1 className="mt-4 text-3xl font-bold">Jogi dokumentumok</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            A piszkozatok elkülönülnek a publikus tartalomtól. A látogatók csak
            a külön közzétett változatot látják.
          </p>
        </header>

        {errorMessage && <Message type="error" text={errorMessage} />}
        {successMessage && <Message type="success" text={successMessage} />}

        {pages.length === 0 ? (
          <div className="rounded-2xl border bg-background p-10 text-center text-muted-foreground shadow-sm">
            Nincs kezelhető jogi dokumentum. Ellenőrizd, hogy a legal CMS
            migráció lefutott-e.
          </div>
        ) : (
          <section className="grid gap-5 md:grid-cols-2">
            {pages.map((page) => (
              <LegalPageCard
                key={page.id}
                page={page}
                onEdit={() => void openDocument(page)}
                onPreview={() => void openDocument(page, { preview: true })}
                onHistory={() => void openDocument(page, { history: true })}
              />
            ))}
          </section>
        )}

        {selectedPage && (
          <section
            id="legal-document-editor"
            className="mt-10 scroll-mt-6 rounded-2xl border bg-background p-5 shadow-sm sm:p-7"
          >
            <div className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-brand">
                  Dokumentumszerkesztő
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  {selectedPage.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Publikus állapot: {statusLabel(selectedPage.status)} · Utolsó
                  piszkozatmódosítás:{" "}
                  {formatDateTime(selectedPage.draft.updated_at)}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedId(null);
                  setShowPreview(false);
                  setShowHistory(false);
                }}
              >
                Bezárás
              </Button>
            </div>

            {selectedPage.status !== "published" && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Ehhez a dokumentumhoz még nincs közzétett publikus változat.
              </div>
            )}

            <form onSubmit={(event) => void saveDraft(event)} className="mt-7">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Dokumentum címe" htmlFor="legal-title">
                  <input
                    id="legal-title"
                    required
                    value={form.title}
                    onChange={(event) =>
                      updateField("title", event.target.value)
                    }
                    className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
                  />
                </Field>
                <Field label="Slug" htmlFor="legal-slug">
                  <input
                    id="legal-slug"
                    required
                    readOnly
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    value={form.slug}
                    title="A publikus jogi URL-ek állandók, ezért a slug nem módosítható."
                    className="w-full rounded-xl border bg-muted px-4 py-3 font-mono text-muted-foreground"
                  />
                </Field>
                <Field label="Verziószám" htmlFor="legal-version">
                  <input
                    id="legal-version"
                    required
                    value={form.version}
                    onChange={(event) =>
                      updateField("version", event.target.value)
                    }
                    className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
                  />
                </Field>
                <Field label="Hatálybalépés dátuma" htmlFor="legal-effective">
                  <input
                    id="legal-effective"
                    type="date"
                    value={form.effective_from}
                    onChange={(event) =>
                      updateField("effective_from", event.target.value)
                    }
                    className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
                  />
                </Field>
                <Field label="Publikus státusz" htmlFor="legal-status">
                  <input
                    id="legal-status"
                    disabled
                    value={statusLabel(selectedPage.status)}
                    className="w-full rounded-xl border bg-muted px-4 py-3 text-muted-foreground"
                  />
                </Field>
                <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Piszkozat:</strong>{" "}
                    {formatDateTime(selectedPage.draft.updated_at)}
                  </p>
                  <p className="mt-1">
                    <strong className="text-foreground">Módosító:</strong>{" "}
                    {formatAdmin(selectedPage.draft.updated_by, currentUser)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold">
                  Tartalom
                </label>
                <RichTextEditor
                  value={form.content}
                  onChange={(html) => updateField("content", html)}
                  placeholder="Írd meg a jogi dokumentum tartalmát..."
                  disabled={saving}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="submit" disabled={saving} variant="outline">
                  <Save className="h-4 w-4" />
                  {saving ? "Mentés..." : "Piszkozat mentése"}
                </Button>
                <Button
                  type="button"
                  disabled={saving}
                  variant="outline"
                  onClick={() => setShowPreview((current) => !current)}
                >
                  <Eye className="h-4 w-4" />
                  Előnézet
                </Button>
                <Button
                  type="button"
                  disabled={saving}
                  variant="cta"
                  onClick={() => void publishDocument()}
                >
                  <Send className="h-4 w-4" />
                  Közzététel
                </Button>
                <Button
                  type="button"
                  disabled={saving}
                  variant="ghost"
                  onClick={() => setShowHistory((current) => !current)}
                >
                  <History className="h-4 w-4" />
                  Verzióelőzmények ({revisions.length})
                </Button>
              </div>
            </form>

            {showPreview && (
              <div className="mt-8 rounded-2xl border bg-secondary/30 p-4 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                  Admin előnézet · nem publikus
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink">
                  {form.title || "Cím nélküli dokumentum"}
                </h2>
                <p className="mt-3 text-sm text-ink-soft">
                  Verzió: {form.version || "–"}
                  {form.effective_from
                    ? ` · Hatálybalépés: ${formatDate(form.effective_from)}`
                    : ""}
                </p>
                <div className="mt-7 overflow-x-auto rounded-2xl bg-white p-5 sm:p-8">
                  <LegalDocumentRenderer html={form.content} />
                </div>
              </div>
            )}

            {showHistory && (
              <LegalRevisionList
                revisions={revisions}
                viewingRevisionId={viewingRevisionId}
                currentUser={currentUser}
                working={saving}
                onView={(id) =>
                  setViewingRevisionId((current) =>
                    current === id ? null : id,
                  )
                }
                onRestore={(revision) => void restoreRevision(revision)}
              />
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function LegalPageCard({
  page,
  onEdit,
  onPreview,
  onHistory,
}: {
  page: AdminLegalPage;
  onEdit: () => void;
  onPreview: () => void;
  onHistory: () => void;
}) {
  return (
    <article className="rounded-2xl border bg-background p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{page.title}</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            /{page.slug}
          </p>
        </div>
        <StatusBadge status={page.status} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <Metadata label="Piszkozat verzió" value={page.draft.version} />
        <Metadata
          label="Hatálybalépés"
          value={
            page.draft.effective_from
              ? formatDate(page.draft.effective_from)
              : "Nincs megadva"
          }
        />
        <Metadata
          label="Utolsó módosítás"
          value={formatDateTime(page.draft.updated_at)}
        />
        <Metadata
          label="Közzététel"
          value={
            page.published_at
              ? formatDateTime(page.published_at)
              : "Nincs közzétéve"
          }
        />
      </dl>

      {page.status !== "published" && (
        <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          Nincs publikus változat.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onEdit}>
          <FilePenLine className="h-4 w-4" />
          Szerkesztés
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onPreview}>
          <ExternalLink className="h-4 w-4" />
          Előnézet
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onHistory}>
          <History className="h-4 w-4" />
          Verziók
        </Button>
      </div>
    </article>
  );
}

function LegalRevisionList({
  revisions,
  viewingRevisionId,
  currentUser,
  working,
  onView,
  onRestore,
}: {
  revisions: LegalPageRevision[];
  viewingRevisionId: string | null;
  currentUser: { id: string; email: string } | null;
  working: boolean;
  onView: (id: string) => void;
  onRestore: (revision: LegalPageRevision) => void;
}) {
  return (
    <section className="mt-8 overflow-hidden rounded-2xl border">
      <div className="border-b bg-muted/30 p-5">
        <h2 className="text-xl font-bold">Verzióelőzmények</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A visszaállítás mindig piszkozatot készít, és nem módosítja
          automatikusan a publikus változatot.
        </p>
      </div>

      {revisions.length === 0 ? (
        <p className="p-8 text-center text-muted-foreground">
          Még nincs korábbi verzió.
        </p>
      ) : (
        <div className="divide-y">
          {revisions.map((revision) => (
            <article key={revision.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                      {revision.version}
                    </span>
                    <StatusBadge status={revision.status} />
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(revision.created_at)}
                    </span>
                  </div>
                  <h3 className="mt-3 font-bold">{revision.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Létrehozó: {formatAdmin(revision.created_by, currentUser)}
                    {revision.effective_from
                      ? ` · Hatálybalépés: ${formatDate(revision.effective_from)}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onView(revision.id)}
                  >
                    <Eye className="h-4 w-4" />
                    Megtekintés
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={working}
                    onClick={() => onRestore(revision)}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Visszaállítás
                  </Button>
                </div>
              </div>

              {viewingRevisionId === revision.id && (
                <div className="mt-5 overflow-x-auto rounded-xl border bg-white p-5">
                  <LegalDocumentRenderer html={revision.content} />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-foreground">{label}</dt>
      <dd className="mt-1 text-muted-foreground">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: LegalPageStatus }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        status === "published"
          ? "bg-green-100 text-green-800"
          : "bg-amber-100 text-amber-900"
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}

function Message({ type, text }: { type: "error" | "success"; text: string }) {
  return (
    <div
      className={`mb-6 rounded-xl border px-5 py-4 text-sm font-medium ${
        type === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-green-700"
      }`}
    >
      {text}
    </div>
  );
}

function formFromDraft(draft: LegalPageDraft): LegalForm {
  return {
    title: draft.title,
    slug: draft.slug,
    version: draft.version,
    effective_from: draft.effective_from ?? "",
    content: draft.content || "<p></p>",
  };
}

function draftFromPage(page: Omit<AdminLegalPage, "draft">): LegalPageDraft {
  return {
    legal_page_id: page.id,
    slug: page.slug,
    title: page.title,
    content: page.content,
    version: page.version,
    effective_from: page.effective_from,
    created_at: page.created_at,
    updated_at: page.updated_at,
    created_by: page.created_by,
    updated_by: page.updated_by,
  };
}

function normalizeAdminPage(
  page: Record<string, unknown>,
): Omit<AdminLegalPage, "draft"> {
  return {
    id: text(page.id),
    slug: text(page.slug),
    title: text(page.title),
    content: text(page.content),
    version: text(page.version),
    status: status(page.status),
    effective_from: nullableText(page.effective_from),
    published_at: nullableText(page.published_at),
    created_at: text(page.created_at),
    updated_at: text(page.updated_at),
    created_by: nullableText(page.created_by),
    updated_by: nullableText(page.updated_by),
  };
}

function normalizeDraft(draft: Record<string, unknown>): LegalPageDraft {
  return {
    legal_page_id: text(draft.legal_page_id),
    slug: text(draft.slug),
    title: text(draft.title),
    content: text(draft.content),
    version: text(draft.version),
    effective_from: nullableText(draft.effective_from),
    created_at: text(draft.created_at),
    updated_at: text(draft.updated_at),
    created_by: nullableText(draft.created_by),
    updated_by: nullableText(draft.updated_by),
  };
}

function normalizeRevision(
  revision: Record<string, unknown>,
): LegalPageRevision {
  return {
    id: text(revision.id),
    legal_page_id: text(revision.legal_page_id),
    slug: text(revision.slug),
    title: text(revision.title),
    content: text(revision.content),
    version: text(revision.version),
    status: status(revision.status),
    effective_from: nullableText(revision.effective_from),
    published_at: nullableText(revision.published_at),
    created_at: text(revision.created_at),
    created_by: nullableText(revision.created_by),
  };
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function nullableText(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function status(value: unknown): LegalPageStatus {
  return value === "published" ? "published" : "draft";
}

function statusLabel(value: LegalPageStatus) {
  return value === "published" ? "Közzétéve" : "Piszkozat";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatAdmin(
  userId: string | null,
  currentUser: { id: string; email: string } | null,
) {
  if (!userId) {
    return "Ismeretlen admin";
  }

  if (currentUser?.id === userId) {
    return currentUser.email;
  }

  return `${userId.slice(0, 8)}…`;
}
