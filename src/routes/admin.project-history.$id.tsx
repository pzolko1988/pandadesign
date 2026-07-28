import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Clock3,
  Copy,
  ExternalLink,
  History,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/project-history/$id")({
  component: AdminProjectHistoryPage,
});

type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  is_visible: boolean;
  status: "draft" | "published";
  preview_token: string | null;
  preview_expires_at: string | null;
  updated_at: string;
};

type ProjectRevision = {
  id: number;
  revision_number: number;
  snapshot: {
    title?: string;
    slug?: string;
    description?: string;
    is_visible?: boolean;
    status?: string;
    client_name?: string;
    challenge?: string;
    solution?: string;
  };
  created_by: string | null;
  created_at: string;
};

function AdminProjectHistoryPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [revisions, setRevisions] = useState<ProjectRevision[]>([]);

  const [validHours, setValidHours] = useState(168);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    void initializePage();
  }, [id]);

  async function initializePage() {
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
        await navigate({
          to: "/admin/login",
          replace: true,
        });
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

      await loadData();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Az előnézeti oldal betöltése nem sikerült.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadData() {
    const [
      { data: projectData, error: projectError },
      { data: revisionData, error: revisionError },
    ] = await Promise.all([
      supabase
        .from("projects")
        .select(
          "id, title, slug, description, is_visible, status, preview_token, preview_expires_at, updated_at",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("project_revisions")
        .select("id, revision_number, snapshot, created_by, created_at")
        .eq("project_id", id)
        .order("revision_number", {
          ascending: false,
        }),
    ]);

    if (projectError) {
      throw projectError;
    }

    if (revisionError) {
      throw revisionError;
    }

    if (!projectData) {
      throw new Error("A projekt nem található.");
    }

    const loaded = projectData as Project;

    setProject(loaded);
    setRevisions((revisionData ?? []) as ProjectRevision[]);

    if (
      loaded.preview_token &&
      loaded.preview_expires_at &&
      new Date(loaded.preview_expires_at).getTime() > Date.now()
    ) {
      setPreviewUrl(
        `${window.location.origin}/preview/project/${loaded.preview_token}`,
      );
    } else {
      setPreviewUrl("");
    }
  }

  async function generatePreview() {
    if (!project) {
      return;
    }

    setWorking(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { data, error } = await supabase.rpc(
        "generate_project_preview_token",
        {
          p_project_id: project.id,
          p_valid_hours: validHours,
        },
      );

      if (error) {
        throw error;
      }

      const url = `${window.location.origin}/preview/project/${String(data)}`;

      setPreviewUrl(url);

      try {
        await navigator.clipboard.writeText(url);
        setSuccessMessage("Az előnézeti link elkészült és a vágólapra került.");
      } catch {
        setSuccessMessage("Az előnézeti link elkészült.");
      }

      await loadData();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Az előnézeti link létrehozása nem sikerült.",
      );
    } finally {
      setWorking(false);
    }
  }

  async function copyPreviewUrl() {
    if (!previewUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(previewUrl);

      setSuccessMessage("Az előnézeti link a vágólapra került.");
    } catch {
      setErrorMessage("A hivatkozás nem másolható automatikusan.");
    }
  }

  async function revokePreview() {
    if (!project) {
      return;
    }

    setWorking(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase.rpc("revoke_project_preview_token", {
        p_project_id: project.id,
      });

      if (error) {
        throw error;
      }

      setPreviewUrl("");
      setSuccessMessage("Az előnézeti link visszavonva.");
      await loadData();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Az előnézeti link visszavonása nem sikerült.",
      );
    } finally {
      setWorking(false);
    }
  }

  async function restoreRevision(revision: ProjectRevision) {
    const confirmed = window.confirm(
      `Biztosan visszaállítod a(z) ${revision.revision_number}. verziót?\n\nA jelenlegi állapot nem vész el, új verzióként bekerül az előzményekbe.`,
    );

    if (!confirmed) {
      return;
    }

    setWorking(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase.rpc("restore_project_revision", {
        p_revision_id: revision.id,
      });

      if (error) {
        throw error;
      }

      setSuccessMessage(
        `A(z) ${revision.revision_number}. verzió visszaállítva.`,
      );

      await loadData();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A verzió visszaállítása nem sikerült.",
      );
    } finally {
      setWorking(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-muted-foreground">
          Verzióelőzmények betöltése...
        </p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-red-600">
          {errorMessage || "A projekt nem található."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <Link
            to="/admin/projects"
            className="text-sm font-semibold text-brand hover:underline"
          >
            ← Vissza a projektkezelőhöz
          </Link>

          <h1 className="mt-4 text-3xl font-bold">Előnézet és verziók</h1>

          <p className="mt-2 text-muted-foreground">{project.title}</p>
        </header>

        {errorMessage && <Message type="error" text={errorMessage} />}

        {successMessage && <Message type="success" text={successMessage} />}

        <section className="mb-8 rounded-2xl border bg-background p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
              <ShieldCheck className="h-5 w-5" />
            </span>

            <div>
              <h2 className="text-xl font-bold">Titkos előnézeti link</h2>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Az elrejtett projekt belépés nélkül is megtekinthető az
                időkorlátos linkkel.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[220px_1fr]">
            <div>
              <label
                htmlFor="project-preview-hours"
                className="mb-2 block text-sm font-semibold"
              >
                Érvényesség
              </label>

              <select
                id="project-preview-hours"
                value={validHours}
                onChange={(event) => setValidHours(Number(event.target.value))}
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
              >
                <option value={24}>24 óra</option>
                <option value={72}>3 nap</option>
                <option value={168}>7 nap</option>
                <option value={336}>14 nap</option>
                <option value={720}>30 nap</option>
              </select>
            </div>

            <div className="flex flex-wrap items-end gap-2">
              <button
                type="button"
                disabled={working}
                onClick={() => void generatePreview()}
                className="rounded-xl bg-brand px-5 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {previewUrl
                  ? "Új link generálása"
                  : "Előnézeti link generálása"}
              </button>

              {previewUrl && (
                <>
                  <button
                    type="button"
                    onClick={() => void copyPreviewUrl()}
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-muted"
                  >
                    <Copy className="h-4 w-4" />
                    Másolás
                  </button>

                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-muted"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Megnyitás
                  </a>

                  <button
                    type="button"
                    disabled={working}
                    onClick={() => void revokePreview()}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Visszavonás
                  </button>
                </>
              )}
            </div>
          </div>

          {previewUrl && (
            <div className="mt-5 rounded-xl border bg-muted/30 p-4">
              <p className="break-all font-mono text-xs">{previewUrl}</p>

              {project.preview_expires_at && (
                <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                  Lejár: {formatDate(project.preview_expires_at)}
                </p>
              )}
            </div>
          )}
        </section>

        <section className="rounded-2xl border bg-background shadow-sm">
          <div className="border-b p-6">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                <History className="h-5 w-5" />
              </span>

              <div>
                <h2 className="text-xl font-bold">Verzióelőzmények</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Minden tartalmi mentés automatikusan új verziót hoz létre.
                </p>
              </div>
            </div>
          </div>

          {revisions.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              Még nincs mentett verzió.
            </div>
          ) : (
            <div className="divide-y">
              {revisions.map((revision, index) => (
                <article key={revision.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                          {revision.revision_number}. verzió
                        </span>

                        {index === 0 && (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                            Jelenlegi
                          </span>
                        )}

                        <span className="text-xs text-muted-foreground">
                          {formatDate(revision.created_at)}
                        </span>
                      </div>

                      <h3 className="mt-3 font-bold">
                        {revision.snapshot.title || "Cím nélküli változat"}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Állapot:{" "}
                        {revision.snapshot.is_visible
                          ? "publikált"
                          : "piszkozat"}
                      </p>

                      {revision.snapshot.description && (
                        <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                          {revision.snapshot.description}
                        </p>
                      )}
                    </div>

                    {index !== 0 && (
                      <button
                        type="button"
                        disabled={working}
                        onClick={() => void restoreRevision(revision)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-muted disabled:opacity-50"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Verzió visszaállítása
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
