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
  type ReactNode,
} from "react";
import {
  ExternalLink,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { supabase } from "@/lib/supabase/client";

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
  client_name: string;
  location: string;
  completed_year: string;
  duration_label: string;
  challenge: string;
  solution: string;
  results: string[];
  services: string[];
  technologies: string[];
  content_html: string;
  content_json: Record<string, unknown>;
  gallery_paths: string[];
  seo_title: string;
  seo_description: string;
  cta_title: string;
  cta_text: string;
  cta_button_text: string;
  created_at: string;
  updated_at: string;
};

type ProjectForm = Omit<
  Project,
  "id" | "created_at" | "updated_at"
>;

const EMPTY_DOCUMENT = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
};

const EMPTY_FORM: ProjectForm = {
  slug: "",
  title: "",
  industry: "",
  category: "Céges oldal",
  description: "",
  image_path: null,
  project_url: "",
  sort_order: 10,
  is_concept: true,
  is_visible: true,
  client_name: "",
  location: "",
  completed_year: "",
  duration_label: "",
  challenge: "",
  solution: "",
  results: [],
  services: [],
  technologies: [],
  content_html: "<p></p>",
  content_json: EMPTY_DOCUMENT,
  gallery_paths: [],
  seo_title: "",
  seo_description: "",
  cta_title:
    "Hasonló weboldalra van szükséged?",
  cta_text:
    "Beszéljük át az elképzelésedet egy díjmentes konzultáción.",
  cta_button_text: "Ajánlatot kérek",
};

const CATEGORIES = [
  "Céges oldal",
  "Landing oldal",
  "Vendéglátás",
  "Egészségügy",
  "Webshop",
  "Turizmus",
  "Ingatlan",
  "Oktatás",
  "Pénzügy",
  "Egyéb",
];

function AdminProjectsPage() {
  const navigate = useNavigate();

  const [projects, setProjects] =
    useState<Project[]>([]);
  const [form, setForm] =
    useState<ProjectForm>(EMPTY_FORM);
  const [editingId, setEditingId] =
    useState<string | null>(null);
  const [slugTouched, setSlugTouched] =
    useState(false);

  const [heroFile, setHeroFile] =
    useState<File | null>(null);
  const [heroPreviewUrl, setHeroPreviewUrl] =
    useState("");

  const [galleryFiles, setGalleryFiles] =
    useState<File[]>([]);
  const [galleryDeletePaths, setGalleryDeletePaths] =
    useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [visibilityFilter, setVisibilityFilter] =
    useState<"all" | "visible" | "hidden">("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    void initializePage();
  }, []);

  useEffect(() => {
    return () => {
      if (heroPreviewUrl) {
        URL.revokeObjectURL(heroPreviewUrl);
      }
    };
  }, [heroPreviewUrl]);

  const galleryLocalPreviews = useMemo(
    () =>
      galleryFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [galleryFiles],
  );

  useEffect(() => {
    return () => {
      galleryLocalPreviews.forEach((item) =>
        URL.revokeObjectURL(item.url),
      );
    };
  }, [galleryLocalPreviews]);

  const filteredProjects = useMemo(() => {
    const search =
      searchTerm.trim().toLocaleLowerCase("hu-HU");

    return projects.filter((project) => {
      if (
        visibilityFilter === "visible" &&
        !project.is_visible
      ) {
        return false;
      }

      if (
        visibilityFilter === "hidden" &&
        project.is_visible
      ) {
        return false;
      }

      if (!search) {
        return true;
      }

      return [
        project.title,
        project.slug,
        project.industry,
        project.category,
        project.client_name,
        project.description,
      ].some((value) =>
        value
          .toLocaleLowerCase("hu-HU")
          .includes(search),
      );
    });
  }, [
    projects,
    searchTerm,
    visibilityFilter,
  ]);

  const heroStoredUrl = useMemo(
    () =>
      form.image_path
        ? getPortfolioUrl(form.image_path)
        : "",
    [form.image_path],
  );

  const heroUrl =
    heroPreviewUrl || heroStoredUrl;

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

      await loadProjects();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A referenciakezelő betöltése közben hiba történt.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, slug, title, industry, category, description, image_path, project_url, sort_order, is_concept, is_visible, client_name, location, completed_year, duration_label, challenge, solution, results, services, technologies, content_html, content_json, gallery_paths, seo_title, seo_description, cta_title, cta_text, cta_button_text, created_at, updated_at",
      )
      .order("sort_order", {
        ascending: true,
      })
      .order("updated_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    setProjects((data ?? []) as Project[]);
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

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug:
        slugTouched
          ? current.slug
          : slugify(value),
      seo_title:
        current.seo_title ||
        value,
    }));
  }

  function getNextSortOrder() {
    if (projects.length === 0) {
      return 10;
    }

    return (
      Math.max(
        ...projects.map(
          (project) => project.sort_order,
        ),
      ) + 10
    );
  }

  function resetEditor() {
    if (heroPreviewUrl) {
      URL.revokeObjectURL(heroPreviewUrl);
    }

    setEditingId(null);
    setSlugTouched(false);
    setHeroFile(null);
    setHeroPreviewUrl("");
    setGalleryFiles([]);
    setGalleryDeletePaths([]);

    setForm({
      ...EMPTY_FORM,
      sort_order: getNextSortOrder(),
    });

    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function startEditing(project: Project) {
    if (heroPreviewUrl) {
      URL.revokeObjectURL(heroPreviewUrl);
    }

    setEditingId(project.id);
    setSlugTouched(true);
    setHeroFile(null);
    setHeroPreviewUrl("");
    setGalleryFiles([]);
    setGalleryDeletePaths([]);

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
      client_name: project.client_name,
      location: project.location,
      completed_year: project.completed_year,
      duration_label: project.duration_label,
      challenge: project.challenge,
      solution: project.solution,
      results: project.results ?? [],
      services: project.services ?? [],
      technologies:
        project.technologies ?? [],
      content_html:
        project.content_html || "<p></p>",
      content_json:
        project.content_json ?? EMPTY_DOCUMENT,
      gallery_paths:
        project.gallery_paths ?? [],
      seo_title: project.seo_title,
      seo_description:
        project.seo_description,
      cta_title: project.cta_title,
      cta_text: project.cta_text,
      cta_button_text:
        project.cta_button_text,
    });

    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function validateImage(file: File) {
    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    ) {
      return "Csak JPG, PNG vagy WebP kép tölthető fel.";
    }

    if (file.size > 8 * 1024 * 1024) {
      return "Egy kép legfeljebb 8 MB lehet.";
    }

    return "";
  }

  function handleHeroFile(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) {
      return;
    }

    const validationError =
      validateImage(file);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (heroPreviewUrl) {
      URL.revokeObjectURL(heroPreviewUrl);
    }

    setHeroFile(file);
    setHeroPreviewUrl(
      URL.createObjectURL(file),
    );
    setErrorMessage("");
  }

  function handleGalleryFiles(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(
      event.target.files ?? [],
    );
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    const invalidFile = files.find(
      (file) => validateImage(file),
    );

    if (invalidFile) {
      setErrorMessage(
        `${invalidFile.name}: ${validateImage(invalidFile)}`,
      );
      return;
    }

    if (
      form.gallery_paths.length +
        galleryFiles.length +
        files.length >
      20
    ) {
      setErrorMessage(
        "Egy projekthez legfeljebb 20 galériakép tartozhat.",
      );
      return;
    }

    setGalleryFiles((current) => [
      ...current,
      ...files,
    ]);
    setErrorMessage("");
  }

  function removeStoredHero() {
    if (form.image_path) {
      setGalleryDeletePaths((current) => [
        ...current,
        form.image_path as string,
      ]);
    }

    if (heroPreviewUrl) {
      URL.revokeObjectURL(heroPreviewUrl);
    }

    setHeroFile(null);
    setHeroPreviewUrl("");
    updateField("image_path", null);
  }

  function removeStoredGalleryImage(
    path: string,
  ) {
    updateField(
      "gallery_paths",
      form.gallery_paths.filter(
        (item) => item !== path,
      ),
    );

    setGalleryDeletePaths((current) => [
      ...current,
      path,
    ]);
  }

  async function uploadImage(
    file: File,
    folder: "hero" | "gallery",
  ) {
    const extension =
      file.name.split(".").pop()?.toLowerCase() ||
      "webp";

    const path =
      `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

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

  async function removeStorageFiles(
    paths: string[],
  ) {
    const uniquePaths = Array.from(
      new Set(paths.filter(Boolean)),
    );

    if (uniquePaths.length === 0) {
      return;
    }

    const { error } = await supabase.storage
      .from("portfolio")
      .remove(uniquePaths);

    if (error) {
      console.warn(
        "Egyes projektképek nem törölhetők:",
        error,
      );
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const title = form.title.trim();
    const slug = slugify(form.slug || title);
    const description =
      form.description.trim();

    const plainText = form.content_html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (title.length < 3) {
      setErrorMessage(
        "A projekt címének legalább 3 karakter hosszúnak kell lennie.",
      );
      return;
    }

    if (slug.length < 3) {
      setErrorMessage(
        "Az URL-azonosítónak legalább 3 karakter hosszúnak kell lennie.",
      );
      return;
    }

    if (description.length < 10) {
      setErrorMessage(
        "A rövid leírásnak legalább 10 karakter hosszúnak kell lennie.",
      );
      return;
    }

    if (
      !Number.isInteger(
        Number(form.sort_order),
      ) ||
      Number(form.sort_order) < 0
    ) {
      setErrorMessage(
        "A sorrend 0 vagy annál nagyobb egész szám lehet.",
      );
      return;
    }

    setSaving(true);
    setUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const uploadedPaths: string[] = [];
    let nextHeroPath =
      form.image_path;
    let nextGalleryPaths = [
      ...form.gallery_paths,
    ];

    try {
      if (heroFile) {
        nextHeroPath = await uploadImage(
          heroFile,
          "hero",
        );
        uploadedPaths.push(nextHeroPath);
      }

      for (const file of galleryFiles) {
        const path = await uploadImage(
          file,
          "gallery",
        );

        nextGalleryPaths.push(path);
        uploadedPaths.push(path);
      }

      const payload = {
        slug,
        title,
        industry: form.industry.trim(),
        category:
          form.category.trim() || "Egyéb",
        description,
        image_path: nextHeroPath,
        project_url:
          normalizeExternalUrl(
            form.project_url,
          ),
        sort_order: Number(form.sort_order),
        is_concept: form.is_concept,
        is_visible: form.is_visible,
        client_name:
          form.client_name.trim(),
        location: form.location.trim(),
        completed_year:
          form.completed_year.trim(),
        duration_label:
          form.duration_label.trim(),
        challenge: form.challenge.trim(),
        solution: form.solution.trim(),
        results: cleanList(form.results),
        services: cleanList(form.services),
        technologies: cleanList(
          form.technologies,
        ),
        content_html:
          plainText.length > 0
            ? form.content_html
            : "<p></p>",
        content_json: form.content_json,
        gallery_paths: nextGalleryPaths,
        seo_title:
          form.seo_title.trim(),
        seo_description:
          form.seo_description.trim(),
        cta_title:
          form.cta_title.trim(),
        cta_text: form.cta_text.trim(),
        cta_button_text:
          form.cta_button_text.trim(),
      };

      if (editingId) {
        const { error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", editingId);

        if (error) {
          throw error;
        }

        setSuccessMessage(
          "A részletes projekt sikeresen frissítve.",
        );
      } else {
        const { error } = await supabase
          .from("projects")
          .insert(payload);

        if (error) {
          throw error;
        }

        setSuccessMessage(
          "Az új részletes projekt sikeresen létrehozva.",
        );
      }

      const deletionCandidates = [
        ...galleryDeletePaths,
      ];

      if (
        heroFile &&
        form.image_path &&
        form.image_path !== nextHeroPath
      ) {
        deletionCandidates.push(
          form.image_path,
        );
      }

      await removeStorageFiles(
        deletionCandidates,
      );

      await loadProjects();

      setEditingId(null);
      setSlugTouched(false);
      setHeroFile(null);

      if (heroPreviewUrl) {
        URL.revokeObjectURL(
          heroPreviewUrl,
        );
      }

      setHeroPreviewUrl("");
      setGalleryFiles([]);
      setGalleryDeletePaths([]);
      setForm({
        ...EMPTY_FORM,
        sort_order: getNextSortOrder(),
      });
    } catch (error: unknown) {
      await removeStorageFiles(
        uploadedPaths,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A projekt mentése közben hiba történt.",
      );
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function toggleVisibility(
    project: Project,
  ) {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          is_visible:
            !project.is_visible,
        })
        .eq("id", project.id);

      if (error) {
        throw error;
      }

      setSuccessMessage(
        project.is_visible
          ? "A projekt elrejtve."
          : "A projekt láthatóvá téve.",
      );

      await loadProjects();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A láthatóság módosítása nem sikerült.",
      );
    }
  }

  async function deleteProject(
    project: Project,
  ) {
    const confirmed = window.confirm(
      `Biztosan végleg törlöd ezt a projektet?\n\n${project.title}`,
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);

      if (error) {
        throw error;
      }

      await removeStorageFiles([
        project.image_path ?? "",
        ...(project.gallery_paths ?? []),
      ]);

      if (editingId === project.id) {
        resetEditor();
      }

      await loadProjects();
      setSuccessMessage(
        "A projekt végleg törölve.",
      );
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A projekt törlése nem sikerült.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-muted-foreground">
          Részletes projektek betöltése...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              to="/admin/"
              className="text-sm font-semibold text-brand hover:underline"
            >
              ← Vissza az áttekintéshez
            </Link>

            <h1 className="mt-4 text-3xl font-bold">
              Referenciák és esettanulmányok
            </h1>

            <p className="mt-2 max-w-3xl text-muted-foreground">
              Részletes projektoldalak, Tiptap-tartalom,
              eredmények, galéria és SEO kezelése.
            </p>
          </div>

          <button
            type="button"
            onClick={resetEditor}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Új projekt
          </button>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700"
          >
            {successMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mb-10 space-y-6"
        >
          <EditorSection
            title={
              editingId
                ? "Projekt szerkesztése"
                : "Új projekt létrehozása"
            }
            description="A kártyákhoz és a részletes projektoldalhoz szükséges alapadatok."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                id="project-title"
                label="Projekt címe"
                required
                value={form.title}
                onChange={handleTitleChange}
              />

              <div>
                <label
                  htmlFor="project-slug"
                  className="mb-2 block text-sm font-semibold"
                >
                  URL-azonosító
                </label>

                <div className="flex gap-2">
                  <input
                    id="project-slug"
                    required
                    value={form.slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      updateField(
                        "slug",
                        slugify(
                          event.target.value,
                        ),
                      );
                    }}
                    className="min-w-0 flex-1 rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setSlugTouched(true);
                      updateField(
                        "slug",
                        slugify(form.title),
                      );
                    }}
                    className="rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-muted"
                  >
                    Generálás
                  </button>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  /referenciak/{form.slug || "..."}
                </p>
              </div>

              <TextField
                id="project-industry"
                label="Iparág"
                value={form.industry}
                onChange={(value) =>
                  updateField("industry", value)
                }
                placeholder="Például: Ingatlan"
              />

              <div>
                <label
                  htmlFor="project-category"
                  className="mb-2 block text-sm font-semibold"
                >
                  Kategória
                </label>

                <select
                  id="project-category"
                  value={form.category}
                  onChange={(event) =>
                    updateField(
                      "category",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
                >
                  {CATEGORIES.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <TextField
                id="project-client"
                label="Ügyfél vagy márka neve"
                value={form.client_name}
                onChange={(value) =>
                  updateField(
                    "client_name",
                    value,
                  )
                }
                placeholder="Koncepciónál üresen hagyható"
              />

              <TextField
                id="project-location"
                label="Helyszín"
                value={form.location}
                onChange={(value) =>
                  updateField("location", value)
                }
                placeholder="Például: Budapest"
              />

              <TextField
                id="project-year"
                label="Befejezés éve"
                value={form.completed_year}
                onChange={(value) =>
                  updateField(
                    "completed_year",
                    value,
                  )
                }
                placeholder="2026"
              />

              <TextField
                id="project-duration"
                label="Projekt időtartama"
                value={form.duration_label}
                onChange={(value) =>
                  updateField(
                    "duration_label",
                    value,
                  )
                }
                placeholder="Például: 5 hét"
              />

              <TextField
                id="project-url"
                label="Élő weboldal címe"
                value={form.project_url}
                onChange={(value) =>
                  updateField(
                    "project_url",
                    value,
                  )
                }
                placeholder="https://..."
              />

              <TextField
                id="project-order"
                label="Megjelenési sorrend"
                type="number"
                value={String(form.sort_order)}
                onChange={(value) =>
                  updateField(
                    "sort_order",
                    Number(value),
                  )
                }
              />

              <div className="md:col-span-2">
                <label
                  htmlFor="project-description"
                  className="mb-2 block text-sm font-semibold"
                >
                  Rövid kártyaleírás
                </label>

                <textarea
                  id="project-description"
                  required
                  minLength={10}
                  maxLength={500}
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value,
                    )
                  }
                  className="w-full resize-y rounded-xl border bg-background px-4 py-3 leading-relaxed outline-none focus:ring-2 focus:ring-brand"
                />

                <p className="mt-2 text-right text-xs text-muted-foreground">
                  {form.description.length}/500 karakter
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <CheckboxField
                label="Koncepcióprojekt"
                description="Bekapcsolva a publikus oldalon külön jelzést kap."
                checked={form.is_concept}
                onChange={(checked) =>
                  updateField(
                    "is_concept",
                    checked,
                  )
                }
              />

              <CheckboxField
                label="Publikusan látható"
                description="Kikapcsolva a projekt csak az adminfelületen látható."
                checked={form.is_visible}
                onChange={(checked) =>
                  updateField(
                    "is_visible",
                    checked,
                  )
                }
              />
            </div>
          </EditorSection>

          <EditorSection
            title="Kiemelt kép"
            description="A főoldali kártyán, a referencialistában és a projekt fejlécében jelenik meg."
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,620px)_1fr]">
              <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-2xl border bg-muted/30">
                {heroUrl ? (
                  <img
                    src={heroUrl}
                    alt="Projekt kiemelt képe"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                )}
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-muted">
                    <Upload className="h-4 w-4" />
                    {heroUrl
                      ? "Kép cseréje"
                      : "Kép feltöltése"}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={uploading}
                      onChange={handleHeroFile}
                      className="sr-only"
                    />
                  </label>

                  {heroUrl && (
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={removeStoredHero}
                      className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Kép eltávolítása
                    </button>
                  )}
                </div>

                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  PNG, JPG vagy WebP, maximum 8 MB.
                  Ajánlott képarány: 16:9.
                </p>
              </div>
            </div>
          </EditorSection>

          <EditorSection
            title="Esettanulmány összefoglaló"
            description="Strukturált tartalom, amely gyorsan áttekinthetővé teszi a projekt üzleti értékét."
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <LongTextField
                id="project-challenge"
                label="A kihívás"
                value={form.challenge}
                onChange={(value) =>
                  updateField(
                    "challenge",
                    value,
                  )
                }
                placeholder="Milyen problémával érkezett az ügyfél?"
              />

              <LongTextField
                id="project-solution"
                label="A megoldás"
                value={form.solution}
                onChange={(value) =>
                  updateField(
                    "solution",
                    value,
                  )
                }
                placeholder="Milyen megoldást terveztünk és valósítottunk meg?"
              />

              <ArrayTextarea
                id="project-results"
                label="Eredmények"
                value={form.results}
                onChange={(value) =>
                  updateField("results", value)
                }
                placeholder={"Gyorsabb betöltés\nTöbb ajánlatkérés\nKönnyebb tartalomkezelés"}
              />

              <ArrayTextarea
                id="project-services"
                label="Elvégzett szolgáltatások"
                value={form.services}
                onChange={(value) =>
                  updateField("services", value)
                }
                placeholder={"UX/UI tervezés\nWebfejlesztés\nSEO beállítás"}
              />

              <div className="lg:col-span-2">
                <ArrayTextarea
                  id="project-technologies"
                  label="Technológiák"
                  value={form.technologies}
                  onChange={(value) =>
                    updateField(
                      "technologies",
                      value,
                    )
                  }
                  placeholder={"React\nTanStack Router\nSupabase\nTailwind CSS"}
                />
              </div>
            </div>
          </EditorSection>

          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold">
                Részletes projektleírás
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                A blogmodulból már telepített Tiptap
                szerkesztőt használja.
              </p>
            </div>

            <RichTextEditor
              value={form.content_html}
              disabled={saving}
              placeholder="Írd le a tervezési folyamatot, a döntéseket, a megoldásokat és az eredményeket..."
              onChange={(html, json) =>
                setForm((current) => ({
                  ...current,
                  content_html: html,
                  content_json: json,
                }))
              }
            />
          </section>

          <EditorSection
            title="Projektgaléria"
            description="További képernyőképek, mobilnézetek és részletek. Legfeljebb 20 kép."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {form.gallery_paths.map((path) => (
                <GalleryItem
                  key={path}
                  imageUrl={getPortfolioUrl(path)}
                  onRemove={() =>
                    removeStoredGalleryImage(path)
                  }
                />
              ))}

              {galleryLocalPreviews.map(
                (item, index) => (
                  <GalleryItem
                    key={`${item.file.name}-${index}`}
                    imageUrl={item.url}
                    pending
                    onRemove={() =>
                      setGalleryFiles((current) =>
                        current.filter(
                          (_, fileIndex) =>
                            fileIndex !== index,
                        ),
                      )
                    }
                  />
                ),
              )}

              <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-5 text-center transition hover:bg-muted/40">
                <Upload className="h-7 w-7 text-brand" />

                <span className="mt-3 text-sm font-semibold">
                  Galériaképek hozzáadása
                </span>

                <span className="mt-1 text-xs text-muted-foreground">
                  Több kép is kijelölhető
                </span>

                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  disabled={uploading}
                  onChange={handleGalleryFiles}
                  className="sr-only"
                />
              </label>
            </div>
          </EditorSection>

          <EditorSection
            title="Keresőoptimalizálás"
            description="Üresen hagyva a projekt címe és rövid leírása használható."
          >
            <div className="space-y-5">
              <TextField
                id="project-seo-title"
                label="SEO-cím"
                value={form.seo_title}
                onChange={(value) =>
                  updateField(
                    "seo_title",
                    value,
                  )
                }
              />

              <LongTextField
                id="project-seo-description"
                label="Meta leírás"
                value={form.seo_description}
                onChange={(value) =>
                  updateField(
                    "seo_description",
                    value,
                  )
                }
                rows={4}
              />
            </div>
          </EditorSection>

          <EditorSection
            title="Projektoldali záró CTA"
            description="A részletes projektoldal végén megjelenő ajánlatkérő blokk."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                id="project-cta-title"
                label="CTA főcím"
                value={form.cta_title}
                onChange={(value) =>
                  updateField(
                    "cta_title",
                    value,
                  )
                }
              />

              <TextField
                id="project-cta-button"
                label="Gomb szövege"
                value={form.cta_button_text}
                onChange={(value) =>
                  updateField(
                    "cta_button_text",
                    value,
                  )
                }
              />

              <div className="md:col-span-2">
                <LongTextField
                  id="project-cta-text"
                  label="CTA leírás"
                  value={form.cta_text}
                  onChange={(value) =>
                    updateField(
                      "cta_text",
                      value,
                    )
                  }
                  rows={3}
                />
              </div>
            </div>
          </EditorSection>

          <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border bg-background/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Állapot:{" "}
              <strong>
                {form.is_visible
                  ? "publikusan látható"
                  : "elrejtett"}
              </strong>
            </p>

            <div className="flex flex-wrap gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetEditor}
                  className="rounded-xl border px-5 py-3 font-semibold hover:bg-muted"
                >
                  Mégse
                </button>
              )}

              <button
                type="submit"
                disabled={saving || uploading}
                className="rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Mentés..."
                  : editingId
                    ? "Projekt frissítése"
                    : "Projekt létrehozása"}
              </button>
            </div>
          </div>
        </form>

        <section className="rounded-2xl border bg-background shadow-sm">
          <div className="border-b p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Meglévő projektek
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {filteredProjects.length} találat
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(260px,1fr)_200px_auto]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value,
                      )
                    }
                    placeholder="Keresés..."
                    className="w-full rounded-xl border py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-brand"
                  />
                </label>

                <select
                  value={visibilityFilter}
                  onChange={(event) =>
                    setVisibilityFilter(
                      event.target.value as
                        | "all"
                        | "visible"
                        | "hidden",
                    )
                  }
                  className="rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="all">
                    Minden projekt
                  </option>
                  <option value="visible">
                    Látható
                  </option>
                  <option value="hidden">
                    Elrejtett
                  </option>
                </select>

                <button
                  type="button"
                  onClick={() => void loadProjects()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-muted"
                >
                  <RefreshCw className="h-4 w-4" />
                  Frissítés
                </button>
              </div>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="p-10 text-center">
              <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/30" />

              <h3 className="mt-4 font-bold">
                Nincs megjeleníthető projekt
              </h3>
            </div>
          ) : (
            <div className="divide-y">
              {filteredProjects.map((project) => (
                <article
                  key={project.id}
                  className="grid gap-5 p-5 lg:grid-cols-[220px_1fr_auto]"
                >
                  <div className="aspect-[16/10] overflow-hidden rounded-xl border bg-muted/30">
                    {project.image_path ? (
                      <img
                        src={getPortfolioUrl(
                          project.image_path,
                        )}
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          project.is_visible
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {project.is_visible
                          ? "Látható"
                          : "Elrejtett"}
                      </span>

                      {project.is_concept && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                          Koncepció
                        </span>
                      )}

                      <span className="text-xs text-muted-foreground">
                        Sorrend: {project.sort_order}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-bold">
                      {project.title}
                    </h3>

                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-brand">
                      {[
                        project.industry,
                        project.category,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {project.description}
                    </p>

                    <p className="mt-3 text-xs text-muted-foreground">
                      /referenciak/{project.slug}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-start gap-2 lg:max-w-[180px] lg:justify-end">
                    {project.is_visible && (
                      <Link
                        to="/referenciak/$slug"
                        params={{
                          slug: project.slug,
                        }}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-muted"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Megnyitás
                      </Link>
                    )}

                    <Link
                      to="/admin/project-history/$id"
                      params={{
                        id: project.id,
                      }}
                      className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-muted"
                    >
                      Előnézet és verziók
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        startEditing(project)
                      }
                      className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-muted"
                    >
                      Szerkesztés
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void toggleVisibility(project)
                      }
                      className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-muted"
                    >
                      {project.is_visible
                        ? "Elrejtés"
                        : "Aktiválás"}
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() =>
                        void deleteProject(project)
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Törlés
                    </button>
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

type EditorSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function EditorSection({
  title,
  description,
  children,
}: EditorSectionProps) {
  return (
    <section className="rounded-2xl border bg-background p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
};

function TextField({
  id,
  label,
  value,
  onChange,
  required = false,
  placeholder,
  type = "text",
}: TextFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
      />
    </div>
  );
}

type LongTextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

function LongTextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 7,
}: LongTextFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold"
      >
        {label}
      </label>

      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border bg-background px-4 py-3 leading-relaxed outline-none focus:ring-2 focus:ring-brand"
      />
    </div>
  );
}

type ArrayTextareaProps = {
  id: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
};

function ArrayTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
}: ArrayTextareaProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold"
      >
        {label}
      </label>

      <textarea
        id={id}
        rows={7}
        value={value.join("\n")}
        onChange={(event) =>
          onChange(
            event.target.value.split("\n"),
          )
        }
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border bg-background px-4 py-3 leading-relaxed outline-none focus:ring-2 focus:ring-brand"
      />

      <p className="mt-2 text-xs text-muted-foreground">
        Soronként egy elem.
      </p>
    </div>
  );
}

type CheckboxFieldProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function CheckboxField({
  label,
  description,
  checked,
  onChange,
}: CheckboxFieldProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="mt-1 h-4 w-4"
      />

      <span>
        <span className="block text-sm font-semibold">
          {label}
        </span>

        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  );
}

type GalleryItemProps = {
  imageUrl: string;
  pending?: boolean;
  onRemove: () => void;
};

function GalleryItem({
  imageUrl,
  pending = false,
  onRemove,
}: GalleryItemProps) {
  return (
    <article className="relative overflow-hidden rounded-2xl border bg-muted/30">
      <img
        src={imageUrl}
        alt=""
        className="aspect-[4/3] h-full w-full object-cover"
      />

      {pending && (
        <span className="absolute bottom-3 left-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          Mentésre vár
        </span>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-red-600 shadow"
        aria-label="Kép eltávolítása"
      >
        <X className="h-4 w-4" />
      </button>
    </article>
  );
}

function getPortfolioUrl(path: string) {
  return supabase.storage
    .from("portfolio")
    .getPublicUrl(path).data.publicUrl;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("hu-HU")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

function cleanList(values: string[]) {
  return values
    .map((value) => value.trim())
    .filter(Boolean);
}

function normalizeExternalUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
}
