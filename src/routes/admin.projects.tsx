import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { supabase } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/projects")({
  component: AdminProjectsPage,
});

type Project = {
  id: string;
  slug: string;
  title: string;
  industry: string;
  category: string;
  description: string;
  image_path: string | null;
  project_url: string;
  sort_order: number;
  is_concept: boolean;
  is_visible: boolean;
};

type ProjectForm = Omit<Project, "id">;

const emptyForm: ProjectForm = {
  slug: "",
  title: "",
  industry: "",
  category: "Céges oldal",
  description: "",
  image_path: null,
  project_url: "/referenciak",
  sort_order: 1,
  is_concept: true,
  is_visible: true,
};

const categories = [
  "Céges oldal",
  "Vendéglátás",
  "Egészségügy",
  "Webshop",
  "Turizmus",
  "Egyéb",
];

function AdminProjectsPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const storedPreviewUrl = useMemo(() => {
    if (!form.image_path) {
      return "";
    }

    return supabase.storage
      .from("portfolio")
      .getPublicUrl(form.image_path).data.publicUrl;
  }, [form.image_path]);

  const previewUrl = localPreviewUrl || storedPreviewUrl;

  useEffect(() => {
    void initializePage();
  }, []);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  async function initializePage() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      setErrorMessage(sessionError.message);
      setLoading(false);
      return;
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
      setErrorMessage(adminError.message);
      setLoading(false);
      return;
    }

    if (!isAdmin) {
      setErrorMessage(
        "Ehhez az oldalhoz nincs adminisztrátori jogosultságod.",
      );
      setLoading(false);
      return;
    }

    await loadProjects();
  }

  async function loadProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, slug, title, industry, category, description, image_path, project_url, sort_order, is_concept, is_visible",
      )
      .order("sort_order", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setProjects((data ?? []) as Project[]);
    setLoading(false);
  }

  function updateField<K extends keyof ProjectForm>(
    field: K,
    value: ProjectForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function createSlug(value: string) {
    return value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setErrorMessage("");

    if (!file) {
      setSelectedFile(null);
      setLocalPreviewUrl("");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMessage("Csak JPG, PNG vagy WebP kép tölthető fel.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("A kép legfeljebb 5 MB lehet.");
      event.target.value = "";
      return;
    }

    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    setSelectedFile(file);
    setLocalPreviewUrl(URL.createObjectURL(file));
  }

  async function uploadImage(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("portfolio")
      .upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    return path;
  }

  async function removeStoredImage(path: string | null) {
    if (!path) {
      return;
    }

    const { error } = await supabase.storage
      .from("portfolio")
      .remove([path]);

    if (error) {
      console.error("A régi projektkép nem törölhető:", error);
    }
  }

  function startEditing(project: Project) {
    setEditingId(project.id);
    setSelectedFile(null);
    setLocalPreviewUrl("");

    setForm({
      slug: project.slug,
      title: project.title,
      industry: project.industry,
      category: project.category,
      description: project.description,
      image_path: project.image_path,
      project_url: project.project_url,
      sort_order: project.sort_order,
      is_concept: project.is_concept,
      is_visible: project.is_visible,
    });

    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetEditor() {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    setEditingId(null);
    setSelectedFile(null);
    setLocalPreviewUrl("");
    setForm({
      ...emptyForm,
      sort_order: projects.length + 1,
    });
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const slug = form.slug.trim() || createSlug(form.title);

    if (!form.title.trim()) {
      setErrorMessage("A projekt címe kötelező.");
      setSaving(false);
      return;
    }

    if (!slug) {
      setErrorMessage("Nem sikerült létrehozni az URL-azonosítót.");
      setSaving(false);
      return;
    }

    let nextImagePath = form.image_path;
    const previousImagePath = form.image_path;

    try {
      if (selectedFile) {
        nextImagePath = await uploadImage(selectedFile);
      }

      const payload = {
        slug,
        title: form.title.trim(),
        industry: form.industry.trim(),
        category: form.category.trim() || "Egyéb",
        description: form.description.trim(),
        image_path: nextImagePath,
        project_url: form.project_url.trim() || "/referenciak",
        sort_order: Number(form.sort_order),
        is_concept: form.is_concept,
        is_visible: form.is_visible,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", editingId);

        if (error) {
          if (selectedFile && nextImagePath) {
            await removeStoredImage(nextImagePath);
          }
          throw error;
        }

        if (
          selectedFile &&
          previousImagePath &&
          previousImagePath !== nextImagePath
        ) {
          await removeStoredImage(previousImagePath);
        }

        setSuccessMessage("A projekt sikeresen frissítve.");
      } else {
        const { error } = await supabase
          .from("projects")
          .insert(payload);

        if (error) {
          if (selectedFile && nextImagePath) {
            await removeStoredImage(nextImagePath);
          }
          throw error;
        }

        setSuccessMessage("Az új projekt sikeresen létrehozva.");
      }

      setEditingId(null);
      setSelectedFile(null);
      setLocalPreviewUrl("");
      setForm(emptyForm);
      await loadProjects();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A projekt mentése közben hiba történt.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisibility(project: Project) {
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("projects")
      .update({
        is_visible: !project.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage(
      project.is_visible
        ? "A projekt elrejtve."
        : "A projekt láthatóvá téve.",
    );

    await loadProjects();
  }

  async function deleteProject(project: Project) {
    const confirmed = window.confirm(
      `Biztosan törlöd ezt a projektet?\n\n${project.title}`,
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await removeStoredImage(project.image_path);
    setSuccessMessage("A projekt törölve.");
    await loadProjects();
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-muted-foreground">
          Referenciák betöltése...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <Link
            to="/admin/"
            className="text-sm font-semibold text-brand hover:underline"
          >
            ← Vissza az áttekintéshez
          </Link>

          <h1 className="mt-4 text-3xl font-bold">Referenciák</h1>

          <p className="mt-2 text-muted-foreground">
            Projektek, képek, kategóriák és megjelenési sorrend kezelése.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="h-fit space-y-5 rounded-2xl border bg-background p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingId ? "Projekt szerkesztése" : "Új projekt"}
              </h2>

              {editingId && (
                <button
                  type="button"
                  onClick={resetEditor}
                  className="text-sm font-semibold text-brand"
                >
                  Mégse
                </button>
              )}
            </div>

            <FormField
              label="Projekt neve"
              value={form.title}
              required
              onChange={(value) => {
                updateField("title", value);
                if (!editingId) {
                  updateField("slug", createSlug(value));
                }
              }}
            />

            <FormField
              label="URL-azonosító"
              value={form.slug}
              required
              onChange={(value) =>
                updateField("slug", createSlug(value))
              }
            />

            <FormField
              label="Iparág"
              value={form.industry}
              required
              onChange={(value) => updateField("industry", value)}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Kategória
              </label>

              <select
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Rövid leírás
              </label>

              <textarea
                rows={4}
                required
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className="w-full resize-y rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Projektkép
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="block w-full rounded-xl border bg-background px-3 py-3 text-sm"
              />

              <p className="mt-2 text-xs text-muted-foreground">
                JPG, PNG vagy WebP, legfeljebb 5 MB.
              </p>

              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Projektkép előnézete"
                  className="mt-4 aspect-[16/10] w-full rounded-xl border object-cover"
                />
              )}
            </div>

            <FormField
              label="Projekt hivatkozása"
              value={form.project_url}
              required
              onChange={(value) => updateField("project_url", value)}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Megjelenési sorrend
              </label>

              <input
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(event) =>
                  updateField("sort_order", Number(event.target.value))
                }
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <label className="flex items-center gap-3 rounded-xl border p-4">
              <input
                type="checkbox"
                checked={form.is_concept}
                onChange={(event) =>
                  updateField("is_concept", event.target.checked)
                }
                className="h-4 w-4"
              />

              <span className="text-sm font-semibold">
                Koncepcióprojektként jelölve
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border p-4">
              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={(event) =>
                  updateField("is_visible", event.target.checked)
                }
                className="h-4 w-4"
              />

              <span className="text-sm font-semibold">
                Megjelenjen a weboldalon
              </span>
            </label>

            {errorMessage && (
              <p className="whitespace-pre-wrap rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-brand px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              {saving
                ? "Mentés..."
                : editingId
                  ? "Módosítás mentése"
                  : "Projekt hozzáadása"}
            </button>
          </form>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Meglévő projektek</h2>
              <span className="text-sm text-muted-foreground">
                {projects.length} elem
              </span>
            </div>

            <div className="space-y-4">
              {projects.map((project) => {
                const imageUrl = project.image_path
                  ? supabase.storage
                      .from("portfolio")
                      .getPublicUrl(project.image_path).data.publicUrl
                  : "";

                return (
                  <article
                    key={project.id}
                    className="rounded-2xl border bg-background p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row">
                      <div className="aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl border bg-muted sm:w-44">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={project.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full place-items-center px-4 text-center text-xs text-muted-foreground">
                            Nincs feltöltött kép
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold">
                            {project.title}
                          </h3>

                          <span
                            className={
                              project.is_visible
                                ? "rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700"
                                : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600"
                            }
                          >
                            {project.is_visible ? "Látható" : "Elrejtve"}
                          </span>

                          {project.is_concept && (
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              Koncepció
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-brand">
                          {project.industry} · {project.category}
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                          {project.description}
                        </p>

                        <p className="mt-3 text-xs text-muted-foreground">
                          Sorrend: {project.sort_order} · Azonosító: {project.slug}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(project)}
                            className="rounded-lg border px-4 py-2 text-sm font-semibold"
                          >
                            Szerkesztés
                          </button>

                          <button
                            type="button"
                            onClick={() => void toggleVisibility(project)}
                            className="rounded-lg border px-4 py-2 text-sm font-semibold"
                          >
                            {project.is_visible ? "Elrejtés" : "Megjelenítés"}
                          </button>

                          <button
                            type="button"
                            onClick={() => void deleteProject(project)}
                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                          >
                            Törlés
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              {projects.length === 0 && (
                <div className="rounded-2xl border bg-background p-8 text-center text-muted-foreground">
                  Még nincs létrehozott projekt.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
};

function FormField({
  label,
  value,
  required = false,
  onChange,
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <input
        type="text"
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
      />
    </div>
  );
}
