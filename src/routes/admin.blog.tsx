import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  ExternalLink,
  FilePenLine,
  Image,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/admin/blog")({
  component: AdminBlogPage,
});

type BlogStatus = "draft" | "published";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  content_json: Record<string, unknown>;
  featured_image_path: string | null;
  author_name: string;
  status: BlogStatus;
  published_at: string | null;
  seo_title: string;
  seo_description: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  content_json: Record<string, unknown>;
  featured_image_path: string | null;
  author_name: string;
  status: BlogStatus;
  seo_title: string;
  seo_description: string;
};

const EMPTY_FORM: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content_html: "<p></p>",
  content_json: {
    type: "doc",
    content: [
      {
        type: "paragraph",
      },
    ],
  },
  featured_image_path: null,
  author_name: "PandaDesign",
  status: "draft",
  seo_title: "",
  seo_description: "",
};

function AdminBlogPage() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<BlogForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BlogStatus | "all">("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const filteredPosts = useMemo(() => {
    const search = searchTerm.trim().toLocaleLowerCase("hu-HU");

    return posts.filter((post) => {
      if (statusFilter !== "all" && post.status !== statusFilter) {
        return false;
      }

      if (!search) {
        return true;
      }

      return [post.title, post.slug, post.excerpt, post.author_name].some(
        (value) => value.toLocaleLowerCase("hu-HU").includes(search),
      );
    });
  }, [posts, searchTerm, statusFilter]);

  const loadPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        "id, title, slug, excerpt, content_html, content_json, featured_image_path, author_name, status, published_at, seo_title, seo_description, created_by, updated_by, created_at, updated_at",
      )
      .order("updated_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    setPosts((data ?? []) as BlogPost[]);
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

      await loadPosts();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A blogkezelő betöltése közben hiba történt.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadPosts, navigate]);

  useEffect(() => {
    void initializePage();
  }, [initializePage]);

  function updateField<K extends keyof BlogForm>(field: K, value: BlogForm[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugTouched ? current.slug : slugify(value),
      seo_title: current.seo_title || value,
    }));
  }

  function resetEditor() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function startEditing(post: BlogPost) {
    setEditingId(post.id);
    setSlugTouched(true);

    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content_html: post.content_html || "<p></p>",
      content_json: post.content_json ?? EMPTY_FORM.content_json,
      featured_image_path: post.featured_image_path,
      author_name: post.author_name,
      status: post.status,
      seo_title: post.seo_title,
      seo_description: post.seo_description,
    });

    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function uploadFeaturedImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setErrorMessage("Csak PNG, JPG vagy WebP kép tölthető fel.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage("A kép mérete legfeljebb 8 MB lehet.");
      return;
    }

    setUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const previousPath = form.featured_image_path;
    const extension = file.name.split(".").pop()?.toLowerCase() || "webp";

    const path = `featured/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    try {
      const { error } = await supabase.storage
        .from("blog-media")
        .upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      setForm((current) => ({
        ...current,
        featured_image_path: path,
      }));

      if (previousPath) {
        const { error: deleteError } = await supabase.storage
          .from("blog-media")
          .remove([previousPath]);

        if (deleteError) {
          console.warn("A korábbi blogkép nem törölhető:", deleteError);
        }
      }

      setSuccessMessage(
        "A kiemelt kép feltöltve. A bejegyzés mentésével véglegesítheted.",
      );
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A kép feltöltése nem sikerült.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function removeFeaturedImage() {
    const path = form.featured_image_path;

    if (!path) {
      return;
    }

    const confirmed = window.confirm("Biztosan törlöd a kiemelt képet?");

    if (!confirmed) {
      return;
    }

    setUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase.storage
        .from("blog-media")
        .remove([path]);

      if (error) {
        throw error;
      }

      setForm((current) => ({
        ...current,
        featured_image_path: null,
      }));

      setSuccessMessage("A kiemelt kép törölve.");
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "A kép törlése nem sikerült.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = form.title.trim();
    const slug = slugify(form.slug);
    const excerpt = form.excerpt.trim();
    const authorName = form.author_name.trim();
    const seoTitle = form.seo_title.trim();
    const seoDescription = form.seo_description.trim();

    const plainText = form.content_html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (title.length < 3) {
      setErrorMessage("A címnek legalább 3 karakter hosszúnak kell lennie.");
      return;
    }

    if (slug.length < 3) {
      setErrorMessage(
        "Az URL-azonosítónak legalább 3 karakter hosszúnak kell lennie.",
      );
      return;
    }

    if (excerpt.length < 10) {
      setErrorMessage(
        "A kivonatnak legalább 10 karakter hosszúnak kell lennie.",
      );
      return;
    }

    if (plainText.length < 20) {
      setErrorMessage("A blogbejegyzés tartalma még túl rövid.");
      return;
    }

    if (!authorName) {
      setErrorMessage("A szerző neve nem lehet üres.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("A felhasználói munkamenet nem található.");
      }

      const payload = {
        title,
        slug,
        excerpt,
        content_html: form.content_html,
        content_json: form.content_json,
        featured_image_path: form.featured_image_path,
        author_name: authorName,
        status: form.status,
        seo_title: seoTitle,
        seo_description: seoDescription,
        updated_by: user.id,
      };

      if (editingId) {
        const { error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", editingId);

        if (error) {
          throw error;
        }

        setSuccessMessage("A blogbejegyzés sikeresen frissítve.");
      } else {
        const { error } = await supabase.from("blog_posts").insert({
          ...payload,
          created_by: user.id,
        });

        if (error) {
          throw error;
        }

        setSuccessMessage("Az új blogbejegyzés sikeresen létrehozva.");
      }

      await loadPosts();
      resetEditor();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A blogbejegyzés mentése nem sikerült.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(post: BlogPost) {
    const confirmed = window.confirm(
      `Biztosan végleg törlöd ezt a blogbejegyzést?\n\n${post.title}`,
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", post.id);

      if (error) {
        throw error;
      }

      if (post.featured_image_path) {
        const { error: storageError } = await supabase.storage
          .from("blog-media")
          .remove([post.featured_image_path]);

        if (storageError) {
          console.warn("A blogkép nem törölhető:", storageError);
        }
      }

      setPosts((current) => current.filter((item) => item.id !== post.id));

      if (editingId === post.id) {
        resetEditor();
      }

      setSuccessMessage("A blogbejegyzés végleg törölve.");
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A blogbejegyzés törlése nem sikerült.",
      );
    } finally {
      setSaving(false);
    }
  }

  const featuredImageUrl = form.featured_image_path
    ? supabase.storage.from("blog-media").getPublicUrl(form.featured_image_path)
        .data.publicUrl
    : "";

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-muted-foreground">
          Blogkezelő betöltése...
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

            <h1 className="mt-4 text-3xl font-bold">Blogkezelő</h1>

            <p className="mt-2 max-w-3xl text-muted-foreground">
              Blogbejegyzések létrehozása Tiptap gazdag szövegszerkesztővel.
            </p>
          </div>

          <button
            type="button"
            onClick={resetEditor}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Új bejegyzés
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

        <form onSubmit={handleSubmit} className="mb-10 space-y-6">
          <section className="rounded-2xl border bg-background p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId ? "Bejegyzés szerkesztése" : "Új blogbejegyzés"}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  A tartalmat először piszkozatként is elmentheted.
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetEditor}
                  className="text-sm font-semibold text-brand hover:underline"
                >
                  Szerkesztés megszakítása
                </button>
              )}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <TextField
                id="blog-title"
                label="Bejegyzés címe"
                required
                value={form.title}
                onChange={handleTitleChange}
              />

              <div>
                <label
                  htmlFor="blog-slug"
                  className="mb-2 block text-sm font-semibold"
                >
                  URL-azonosító
                </label>

                <div className="flex gap-2">
                  <input
                    id="blog-slug"
                    required
                    value={form.slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      updateField("slug", slugify(event.target.value));
                    }}
                    placeholder="pelda-blogbejegyzes"
                    className="min-w-0 flex-1 rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setSlugTouched(true);
                      updateField("slug", slugify(form.title));
                    }}
                    className="rounded-xl border px-4 py-3 text-sm font-semibold transition hover:bg-muted"
                  >
                    Generálás
                  </button>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Publikus cím: /blog/{form.slug || "..."}
                </p>
              </div>

              <TextField
                id="blog-author"
                label="Szerző"
                required
                value={form.author_name}
                onChange={(value) => updateField("author_name", value)}
              />

              <div>
                <label
                  htmlFor="blog-status"
                  className="mb-2 block text-sm font-semibold"
                >
                  Állapot
                </label>

                <select
                  id="blog-status"
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as BlogStatus)
                  }
                  className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
                >
                  <option value="draft">Piszkozat</option>

                  <option value="published">Publikált</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <label
                  htmlFor="blog-excerpt"
                  className="mb-2 block text-sm font-semibold"
                >
                  Rövid kivonat
                </label>

                <textarea
                  id="blog-excerpt"
                  required
                  minLength={10}
                  maxLength={500}
                  rows={4}
                  value={form.excerpt}
                  onChange={(event) =>
                    updateField("excerpt", event.target.value)
                  }
                  placeholder="Rövid összefoglaló a bloglistához és a közösségi megosztásokhoz."
                  className="w-full resize-y rounded-xl border bg-background px-4 py-3 leading-relaxed outline-none transition focus:ring-2 focus:ring-brand"
                />

                <p className="mt-2 text-right text-xs text-muted-foreground">
                  {form.excerpt.length}/500 karakter
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-background p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold">Kiemelt kép</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Ajánlott képarány: 16:9. Maximum 8 MB.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,520px)_1fr]">
              <div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl border bg-muted/30">
                {featuredImageUrl ? (
                  <img
                    src={featuredImageUrl}
                    alt="Kiemelt blogkép"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image className="h-12 w-12 text-muted-foreground/30" />
                )}
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition hover:bg-muted">
                    <Upload className="h-4 w-4" />

                    {uploading
                      ? "Feltöltés..."
                      : featuredImageUrl
                        ? "Kép cseréje"
                        : "Kép feltöltése"}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={uploading}
                      onChange={(event) => void uploadFeaturedImage(event)}
                      className="sr-only"
                    />
                  </label>

                  {featuredImageUrl && (
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => void removeFeaturedImage()}
                      className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      Kép törlése
                    </button>
                  )}
                </div>

                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  PNG, JPG és WebP támogatott. A kép a Supabase blog-media
                  tárhelyére kerül.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold">Bejegyzés tartalma</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                A Tiptap szerkesztő csak ezen az adminoldalon töltődik be.
              </p>
            </div>

            <RichTextEditor
              value={form.content_html}
              disabled={saving}
              onChange={(html, json) =>
                setForm((current) => ({
                  ...current,
                  content_html: html,
                  content_json: json,
                }))
              }
            />
          </section>

          <section className="rounded-2xl border bg-background p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold">Keresőoptimalizálás</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Üresen hagyva a bejegyzés címe és kivonata használható
                alapértelmezésként.
              </p>
            </div>

            <div className="space-y-5">
              <TextField
                id="blog-seo-title"
                label="SEO-cím"
                value={form.seo_title}
                onChange={(value) => updateField("seo_title", value)}
                description={`${form.seo_title.length}/180 karakter`}
              />

              <div>
                <label
                  htmlFor="blog-seo-description"
                  className="mb-2 block text-sm font-semibold"
                >
                  Meta leírás
                </label>

                <textarea
                  id="blog-seo-description"
                  maxLength={500}
                  rows={4}
                  value={form.seo_description}
                  onChange={(event) =>
                    updateField("seo_description", event.target.value)
                  }
                  className="w-full resize-y rounded-xl border bg-background px-4 py-3 leading-relaxed outline-none transition focus:ring-2 focus:ring-brand"
                />

                <p className="mt-2 text-right text-xs text-muted-foreground">
                  {form.seo_description.length}/500 karakter
                </p>
              </div>
            </div>
          </section>

          <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border bg-background/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Mentés állapota:{" "}
              <strong>
                {form.status === "published" ? "publikált" : "piszkozat"}
              </strong>
            </p>

            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-xl bg-brand px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Mentés..."
                : editingId
                  ? "Módosítások mentése"
                  : "Bejegyzés létrehozása"}
            </button>
          </div>
        </form>

        <section className="rounded-2xl border bg-background shadow-sm">
          <div className="border-b p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-bold">Blogbejegyzések</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {filteredPosts.length} találat
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(260px,1fr)_200px_auto]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Keresés..."
                    className="w-full rounded-xl border py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-brand"
                  />
                </label>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as BlogStatus | "all")
                  }
                  className="rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="all">Minden állapot</option>
                  <option value="draft">Piszkozat</option>
                  <option value="published">Publikált</option>
                </select>

                <button
                  type="button"
                  onClick={() => void loadPosts()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition hover:bg-muted"
                >
                  <RefreshCw className="h-4 w-4" />
                  Frissítés
                </button>
              </div>
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="p-10 text-center">
              <FilePenLine className="mx-auto h-10 w-10 text-muted-foreground/30" />

              <h3 className="mt-4 font-bold">Nincs megjeleníthető bejegyzés</h3>
            </div>
          ) : (
            <div className="divide-y">
              {filteredPosts.map((post) => {
                const imageUrl = post.featured_image_path
                  ? supabase.storage
                      .from("blog-media")
                      .getPublicUrl(post.featured_image_path).data.publicUrl
                  : "";

                return (
                  <article
                    key={post.id}
                    className="grid gap-5 p-5 lg:grid-cols-[180px_1fr_auto]"
                  >
                    <div className="aspect-video overflow-hidden rounded-xl border bg-muted/30">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full place-items-center">
                          <Image className="h-7 w-7 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            post.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {post.status === "published"
                            ? "Publikált"
                            : "Piszkozat"}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          Frissítve: {formatDate(post.updated_at)}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold">{post.title}</h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        /blog/{post.slug}
                      </p>

                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-start gap-2 lg:max-w-[160px] lg:justify-end">
                      {post.status === "published" && (
                        <Link
                          to="/blog/$slug"
                          params={{
                            slug: post.slug,
                          }}
                          target="_blank"
                          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-muted"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Megnyitás
                        </Link>
                      )}

                      <Link
                        to="/admin/blog-history/$id"
                        params={{
                          id: post.id,
                        }}
                        className="rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-muted"
                      >
                        Előnézet és verziók
                      </Link>

                      <button
                        type="button"
                        onClick={() => startEditing(post)}
                        className="rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-muted"
                      >
                        Szerkesztés
                      </button>

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void deletePost(post)}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Törlés
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  description?: string;
};

function TextField({
  id,
  label,
  value,
  onChange,
  required = false,
  description,
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <input
        id={id}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
      />

      {description && (
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
