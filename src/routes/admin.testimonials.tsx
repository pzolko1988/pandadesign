import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { MessageSquare, Star } from "lucide-react";
import { supabase } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/testimonials")({
  component: AdminTestimonialsPage,
});

type TestimonialSectionSettings = {
  id: number;
  eyebrow: string;
  title: string;
  description: string;
  is_visible: boolean;
};

type Testimonial = {
  id: string;
  name: string;
  role: string;
  testimonial_text: string;
  rating: number;
  is_sample: boolean;
  sort_order: number;
  is_visible: boolean;
};

type TestimonialForm = Omit<Testimonial, "id">;

const DEFAULT_SETTINGS: TestimonialSectionSettings = {
  id: 1,
  eyebrow: "Vélemények",
  title: "Ügyfeleink véleménye",
  description: "",
  is_visible: true,
};

const EMPTY_FORM: TestimonialForm = {
  name: "",
  role: "",
  testimonial_text: "",
  rating: 5,
  is_sample: false,
  sort_order: 10,
  is_visible: true,
};

function AdminTestimonialsPage() {
  const navigate = useNavigate();

  const [settings, setSettings] =
    useState<TestimonialSectionSettings>(DEFAULT_SETTINGS);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [form, setForm] = useState<TestimonialForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingItem, setSavingItem] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    void initializePage();
  }, []);

  function getNextSortOrder(items: Testimonial[]) {
    if (items.length === 0) {
      return 10;
    }

    return Math.max(...items.map((item) => item.sort_order)) + 10;
  }

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
        setErrorMessage(
          "Ehhez az oldalhoz nincs adminisztrátori jogosultságod.",
        );
        return;
      }

      const loadedItems = await loadContent();

      setForm({
        ...EMPTY_FORM,
        sort_order: getNextSortOrder(loadedItems),
      });
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A véleménykezelő betöltése közben hiba történt.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadContent(): Promise<Testimonial[]> {
    const [
      { data: settingsData, error: settingsError },
      { data: itemsData, error: itemsError },
    ] = await Promise.all([
      supabase
        .from("testimonial_section_settings")
        .select("id, eyebrow, title, description, is_visible")
        .eq("id", 1)
        .maybeSingle(),
      supabase
        .from("testimonials")
        .select(
          "id, name, role, testimonial_text, rating, is_sample, sort_order, is_visible",
        )
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

    if (settingsError) {
      throw settingsError;
    }

    if (itemsError) {
      throw itemsError;
    }

    if (settingsData) {
      setSettings(settingsData as TestimonialSectionSettings);
    }

    const loadedItems = (itemsData ?? []) as Testimonial[];

    setTestimonials(loadedItems);

    return loadedItems;
  }

  function updateSettings<K extends keyof TestimonialSectionSettings>(
    field: K,
    value: TestimonialSectionSettings[K],
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateField<K extends keyof TestimonialForm>(
    field: K,
    value: TestimonialForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const eyebrow = settings.eyebrow.trim();
    const title = settings.title.trim();
    const description = settings.description.trim();

    if (eyebrow.length < 2) {
      setErrorMessage(
        "A felső címkének legalább 2 karakter hosszúnak kell lennie.",
      );
      return;
    }

    if (title.length < 3) {
      setErrorMessage(
        "A szekció címének legalább 3 karakter hosszúnak kell lennie.",
      );
      return;
    }

    setSavingSettings(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("testimonial_section_settings")
        .upsert(
          {
            id: 1,
            eyebrow,
            title,
            description,
            is_visible: settings.is_visible,
          },
          {
            onConflict: "id",
          },
        );

      if (error) {
        throw error;
      }

      setSettings((current) => ({
        ...current,
        eyebrow,
        title,
        description,
      }));

      setSuccessMessage("A véleményszekció beállításai elmentve.");
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A szekció mentése nem sikerült.",
      );
    } finally {
      setSavingSettings(false);
    }
  }

  function startEditing(item: Testimonial) {
    setEditingId(item.id);

    setForm({
      name: item.name,
      role: item.role,
      testimonial_text: item.testimonial_text,
      rating: item.rating,
      is_sample: item.is_sample,
      sort_order: item.sort_order,
      is_visible: item.is_visible,
    });

    setErrorMessage("");
    setSuccessMessage("");

    document.getElementById("testimonial-editor")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function resetEditor(currentItems = testimonials) {
    setEditingId(null);

    setForm({
      ...EMPTY_FORM,
      sort_order: getNextSortOrder(currentItems),
    });

    setErrorMessage("");
    setSuccessMessage("");
  }

  async function saveTestimonial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const role = form.role.trim();
    const testimonialText = form.testimonial_text.trim();
    const rating = Number(form.rating);
    const sortOrder = Number(form.sort_order);

    if (name.length < 2) {
      setErrorMessage("A névnek legalább 2 karakter hosszúnak kell lennie.");
      return;
    }

    if (testimonialText.length < 10) {
      setErrorMessage(
        "A véleménynek legalább 10 karakter hosszúnak kell lennie.",
      );
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setErrorMessage("Az értékelés 1 és 5 közötti egész szám lehet.");
      return;
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setErrorMessage("A sorrend 0 vagy annál nagyobb egész szám lehet.");
      return;
    }

    setSavingItem(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      name,
      role,
      testimonial_text: testimonialText,
      rating,
      is_sample: form.is_sample,
      sort_order: sortOrder,
      is_visible: form.is_visible,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("testimonials")
          .update(payload)
          .eq("id", editingId);

        if (error) {
          throw error;
        }

        setSuccessMessage("A vélemény sikeresen frissítve.");
      } else {
        const { error } = await supabase.from("testimonials").insert(payload);

        if (error) {
          throw error;
        }

        setSuccessMessage("Az új vélemény sikeresen létrehozva.");
      }

      const loadedItems = await loadContent();

      setEditingId(null);
      setForm({
        ...EMPTY_FORM,
        sort_order: getNextSortOrder(loadedItems),
      });
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A vélemény mentése nem sikerült.",
      );
    } finally {
      setSavingItem(false);
    }
  }

  async function toggleVisibility(item: Testimonial) {
    setActionId(item.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("testimonials")
        .update({
          is_visible: !item.is_visible,
        })
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      setSuccessMessage(
        item.is_visible ? "A vélemény elrejtve." : "A vélemény láthatóvá téve.",
      );

      await loadContent();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A láthatóság módosítása nem sikerült.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function moveItem(item: Testimonial, direction: "up" | "down") {
    const currentIndex = testimonials.findIndex(
      (currentItem) => currentItem.id === item.id,
    );

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= testimonials.length
    ) {
      return;
    }

    const targetItem = testimonials[targetIndex];

    setActionId(item.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error: firstError } = await supabase
        .from("testimonials")
        .update({
          sort_order: targetItem.sort_order,
        })
        .eq("id", item.id);

      if (firstError) {
        throw firstError;
      }

      const { error: secondError } = await supabase
        .from("testimonials")
        .update({
          sort_order: item.sort_order,
        })
        .eq("id", targetItem.id);

      if (secondError) {
        throw secondError;
      }

      setSuccessMessage("A sorrend módosítva.");
      await loadContent();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A sorrend módosítása nem sikerült.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function deleteTestimonial(item: Testimonial) {
    const confirmed = window.confirm(
      `Biztosan törlöd ezt a véleményt?\n\n${item.name}`,
    );

    if (!confirmed) {
      return;
    }

    setActionId(item.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      const loadedItems = await loadContent();

      if (editingId === item.id) {
        setEditingId(null);
        setForm({
          ...EMPTY_FORM,
          sort_order: getNextSortOrder(loadedItems),
        });
      }

      setSuccessMessage("A vélemény törölve.");
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A vélemény törlése nem sikerült.",
      );
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-muted-foreground">
          Véleménykezelő betöltése...
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

          <h1 className="mt-4 text-3xl font-bold">Véleménykezelő</h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            A véleményszekció és az ügyfél-visszajelzések kezelése.
          </p>
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
          onSubmit={saveSettings}
          className="mb-8 rounded-2xl border bg-background p-6 shadow-sm"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold">Szekcióbeállítások</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              A publikus véleményblokk címei és láthatósága.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="testimonial-eyebrow"
                className="mb-2 block text-sm font-semibold"
              >
                Felső címke
              </label>

              <input
                id="testimonial-eyebrow"
                value={settings.eyebrow}
                onChange={(event) =>
                  updateSettings("eyebrow", event.target.value)
                }
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label
                htmlFor="testimonial-title"
                className="mb-2 block text-sm font-semibold"
              >
                Főcím
              </label>

              <input
                id="testimonial-title"
                value={settings.title}
                onChange={(event) =>
                  updateSettings("title", event.target.value)
                }
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="testimonial-description"
                className="mb-2 block text-sm font-semibold"
              >
                Bevezető leírás
              </label>

              <textarea
                id="testimonial-description"
                rows={4}
                value={settings.description}
                onChange={(event) =>
                  updateSettings("description", event.target.value)
                }
                className="w-full resize-y rounded-xl border bg-background px-4 py-3 leading-relaxed outline-none transition focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border p-4">
            <input
              type="checkbox"
              checked={settings.is_visible}
              onChange={(event) =>
                updateSettings("is_visible", event.target.checked)
              }
              className="h-4 w-4"
            />

            <span>
              <span className="block text-sm font-semibold">
                A teljes véleményszekció látható
              </span>

              <span className="mt-1 block text-xs text-muted-foreground">
                Kikapcsolva a teljes blokk eltűnik a publikus főoldalról.
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={savingSettings}
            className="mt-5 rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingSettings ? "Mentés..." : "Szekcióbeállítások mentése"}
          </button>
        </form>

        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          <form
            id="testimonial-editor"
            onSubmit={saveTestimonial}
            className="h-fit scroll-mt-6 space-y-5 rounded-2xl border bg-background p-6 shadow-sm lg:sticky lg:top-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">
                {editingId ? "Vélemény szerkesztése" : "Új vélemény"}
              </h2>

              {editingId && (
                <button
                  type="button"
                  onClick={() => resetEditor()}
                  className="text-sm font-semibold text-brand hover:underline"
                >
                  Mégse
                </button>
              )}
            </div>

            <div>
              <label
                htmlFor="testimonial-name"
                className="mb-2 block text-sm font-semibold"
              >
                Név
              </label>

              <input
                id="testimonial-name"
                required
                minLength={2}
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Például: Kovács Anna"
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label
                htmlFor="testimonial-role"
                className="mb-2 block text-sm font-semibold"
              >
                Beosztás vagy vállalkozás
              </label>

              <input
                id="testimonial-role"
                value={form.role}
                onChange={(event) => updateField("role", event.target.value)}
                placeholder="Például: Ügyvezető, Minta Kft."
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label
                htmlFor="testimonial-text"
                className="mb-2 block text-sm font-semibold"
              >
                Vélemény
              </label>

              <textarea
                id="testimonial-text"
                required
                minLength={10}
                rows={8}
                value={form.testimonial_text}
                onChange={(event) =>
                  updateField("testimonial_text", event.target.value)
                }
                placeholder="Írd ide az ügyfél visszajelzését..."
                className="w-full resize-y rounded-xl border bg-background px-4 py-3 leading-relaxed outline-none transition focus:ring-2 focus:ring-brand"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="testimonial-rating"
                  className="mb-2 block text-sm font-semibold"
                >
                  Értékelés
                </label>

                <select
                  id="testimonial-rating"
                  value={form.rating}
                  onChange={(event) =>
                    updateField("rating", Number(event.target.value))
                  }
                  className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} csillag
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="testimonial-order"
                  className="mb-2 block text-sm font-semibold"
                >
                  Sorrend
                </label>

                <input
                  id="testimonial-order"
                  type="number"
                  min={0}
                  step={1}
                  value={form.sort_order}
                  onChange={(event) =>
                    updateField("sort_order", Number(event.target.value))
                  }
                  className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
              <input
                type="checkbox"
                checked={form.is_sample}
                onChange={(event) =>
                  updateField("is_sample", event.target.checked)
                }
                className="h-4 w-4"
              />

              <span>
                <span className="block text-sm font-semibold">
                  Minta tartalom
                </span>

                <span className="mt-1 block text-xs text-muted-foreground">
                  Bekapcsolva a publikus kártyán megjelenik a „Minta tartalom”
                  jelzés.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={(event) =>
                  updateField("is_visible", event.target.checked)
                }
                className="h-4 w-4"
              />

              <span>
                <span className="block text-sm font-semibold">
                  Látható vélemény
                </span>

                <span className="mt-1 block text-xs text-muted-foreground">
                  Bekapcsolva megjelenik a publikus oldalon.
                </span>
              </span>
            </label>

            <button
              type="submit"
              disabled={savingItem}
              className="w-full rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingItem
                ? "Mentés..."
                : editingId
                  ? "Módosítások mentése"
                  : "Vélemény létrehozása"}
            </button>
          </form>

          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold">Meglévő vélemények</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {testimonials.length} darab elem
              </p>
            </div>

            {testimonials.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-background p-10 text-center">
                <h3 className="font-bold">Még nincs vélemény</h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Az első véleményt a bal oldali szerkesztőben hozhatod létre.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {testimonials.map((item, index) => {
                  const itemBusy = actionId === item.id;

                  return (
                    <article
                      key={item.id}
                      className={`rounded-2xl border bg-background p-5 shadow-sm ${
                        item.is_visible ? "" : "opacity-60"
                      }`}
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border bg-muted px-3 py-1 text-xs font-semibold">
                              Sorrend: {item.sort_order}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                item.is_visible
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {item.is_visible ? "Látható" : "Elrejtve"}
                            </span>

                            {item.is_sample && (
                              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                                Minta
                              </span>
                            )}
                          </div>

                          <div className="mt-4 flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, starIndex) => (
                              <Star
                                key={starIndex}
                                className={`h-4 w-4 ${
                                  starIndex < item.rating
                                    ? "fill-current text-amber-500"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>

                          <div className="mt-4 flex gap-3">
                            <MessageSquare className="mt-1 h-5 w-5 shrink-0 text-brand" />

                            <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
                              „{item.testimonial_text}”
                            </p>
                          </div>

                          <div className="mt-4 border-t pt-4">
                            <p className="font-bold">{item.name}</p>

                            {item.role && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {item.role}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 xl:max-w-[230px] xl:justify-end">
                          <button
                            type="button"
                            disabled={itemBusy || index === 0}
                            onClick={() => void moveItem(item, "up")}
                            title="Mozgatás felfelé"
                            className="rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            disabled={
                              itemBusy || index === testimonials.length - 1
                            }
                            onClick={() => void moveItem(item, "down")}
                            title="Mozgatás lefelé"
                            className="rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            disabled={itemBusy}
                            onClick={() => startEditing(item)}
                            className="rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
                          >
                            Szerkesztés
                          </button>

                          <button
                            type="button"
                            disabled={itemBusy}
                            onClick={() => void toggleVisibility(item)}
                            className="rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
                          >
                            {item.is_visible ? "Elrejtés" : "Aktiválás"}
                          </button>

                          <button
                            type="button"
                            disabled={itemBusy}
                            onClick={() => void deleteTestimonial(item)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            Törlés
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
