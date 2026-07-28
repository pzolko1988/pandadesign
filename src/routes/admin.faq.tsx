import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/faq")({
  component: AdminFaqPage,
});

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
};

type FaqForm = Omit<FaqItem, "id">;

const emptyForm: FaqForm = {
  question: "",
  answer: "",
  sort_order: 10,
  is_active: true,
};

function AdminFaqPage() {
  const navigate = useNavigate();

  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [form, setForm] = useState<FaqForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    void initializePage();
  }, []);

  function getNextSortOrder(items: FaqItem[]) {
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

      const items = await loadFaqItems();

      if (items) {
        setForm({
          ...emptyForm,
          sort_order: getNextSortOrder(items),
        });
      }
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A GYIK szerkesztő betöltése közben hiba történt.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadFaqItems(): Promise<FaqItem[] | null> {
    const { data, error } = await supabase
      .from("faq_items")
      .select("id, question, answer, sort_order, is_active")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      return null;
    }

    const items = (data ?? []) as FaqItem[];

    setFaqItems(items);

    return items;
  }

  function updateField<K extends keyof FaqForm>(field: K, value: FaqForm[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startEditing(item: FaqItem) {
    setEditingId(item.id);

    setForm({
      question: item.question,
      answer: item.answer,
      sort_order: item.sort_order,
      is_active: item.is_active,
    });

    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetEditor(items = faqItems) {
    setEditingId(null);

    setForm({
      ...emptyForm,
      sort_order: getNextSortOrder(items),
    });

    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const question = form.question.trim();
    const answer = form.answer.trim();
    const sortOrder = Number(form.sort_order);

    if (question.length < 3) {
      setErrorMessage("A kérdésnek legalább 3 karakter hosszúnak kell lennie.");
      setSaving(false);
      return;
    }

    if (answer.length < 3) {
      setErrorMessage("A válasznak legalább 3 karakter hosszúnak kell lennie.");
      setSaving(false);
      return;
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setErrorMessage(
        "A megjelenési sorrend csak 0 vagy annál nagyobb egész szám lehet.",
      );
      setSaving(false);
      return;
    }

    const payload = {
      question,
      answer,
      sort_order: sortOrder,
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("faq_items")
          .update(payload)
          .eq("id", editingId);

        if (error) {
          throw error;
        }

        setSuccessMessage("A GYIK-elem sikeresen frissítve.");
      } else {
        const { error } = await supabase.from("faq_items").insert(payload);

        if (error) {
          throw error;
        }

        setSuccessMessage("Az új GYIK-elem sikeresen létrehozva.");
      }

      const items = await loadFaqItems();

      if (items) {
        setEditingId(null);

        setForm({
          ...emptyForm,
          sort_order: getNextSortOrder(items),
        });
      }
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A GYIK-elem mentése közben hiba történt.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item: FaqItem) {
    setActionId(item.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("faq_items")
        .update({
          is_active: !item.is_active,
        })
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      setSuccessMessage(
        item.is_active
          ? "A GYIK-elem elrejtve."
          : "A GYIK-elem láthatóvá téve.",
      );

      await loadFaqItems();
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

  async function moveItem(item: FaqItem, direction: "up" | "down") {
    const currentIndex = faqItems.findIndex(
      (currentItem) => currentItem.id === item.id,
    );

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= faqItems.length) {
      return;
    }

    const targetItem = faqItems[targetIndex];

    setActionId(item.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const currentSortOrder = item.sort_order;
      const targetSortOrder = targetItem.sort_order;

      const { error: firstError } = await supabase
        .from("faq_items")
        .update({
          sort_order: targetSortOrder,
        })
        .eq("id", item.id);

      if (firstError) {
        throw firstError;
      }

      const { error: secondError } = await supabase
        .from("faq_items")
        .update({
          sort_order: currentSortOrder,
        })
        .eq("id", targetItem.id);

      if (secondError) {
        throw secondError;
      }

      setSuccessMessage("A megjelenési sorrend módosítva.");

      await loadFaqItems();
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

  async function deleteFaqItem(item: FaqItem) {
    const confirmed = window.confirm(
      `Biztosan törlöd ezt a GYIK-elemet?\n\n${item.question}`,
    );

    if (!confirmed) {
      return;
    }

    setActionId(item.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("faq_items")
        .delete()
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      const items = await loadFaqItems();

      if (editingId === item.id) {
        setEditingId(null);

        setForm({
          ...emptyForm,
          sort_order: getNextSortOrder(items ?? []),
        });
      }

      setSuccessMessage("A GYIK-elem törölve.");
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A GYIK-elem törlése nem sikerült.",
      );
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-muted-foreground">
          GYIK szerkesztő betöltése...
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

          <h1 className="mt-4 text-3xl font-bold">GYIK szerkesztő</h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Kérdések és válaszok létrehozása, szerkesztése, sorrendezése és
            láthatóságának kezelése.
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

        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="h-fit space-y-5 rounded-2xl border bg-background p-6 shadow-sm lg:sticky lg:top-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">
                {editingId ? "GYIK-elem szerkesztése" : "Új GYIK-elem"}
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
                htmlFor="faq-question"
                className="mb-2 block text-sm font-semibold"
              >
                Kérdés
              </label>

              <input
                id="faq-question"
                type="text"
                required
                minLength={3}
                value={form.question}
                onChange={(event) =>
                  updateField("question", event.target.value)
                }
                placeholder="Például: Mennyi idő alatt készül el?"
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
              />

              <p className="mt-2 text-xs text-muted-foreground">
                Legalább 3 karakter.
              </p>
            </div>

            <div>
              <label
                htmlFor="faq-answer"
                className="mb-2 block text-sm font-semibold"
              >
                Válasz
              </label>

              <textarea
                id="faq-answer"
                required
                minLength={3}
                rows={8}
                value={form.answer}
                onChange={(event) => updateField("answer", event.target.value)}
                placeholder="Írd ide a részletes választ..."
                className="w-full resize-y rounded-xl border bg-background px-4 py-3 leading-relaxed outline-none transition focus:ring-2 focus:ring-brand"
              />

              <p className="mt-2 text-xs text-muted-foreground">
                Rövid, közérthető és konkrét választ adj.
              </p>
            </div>

            <div>
              <label
                htmlFor="faq-sort-order"
                className="mb-2 block text-sm font-semibold"
              >
                Megjelenési sorrend
              </label>

              <input
                id="faq-sort-order"
                type="number"
                min={0}
                step={1}
                value={form.sort_order}
                onChange={(event) =>
                  updateField("sort_order", Number(event.target.value))
                }
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
              />

              <p className="mt-2 text-xs text-muted-foreground">
                A kisebb szám előrébb jelenik meg.
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  updateField("is_active", event.target.checked)
                }
                className="h-4 w-4"
              />

              <span>
                <span className="block text-sm font-semibold">
                  Aktív GYIK-elem
                </span>

                <span className="mt-1 block text-xs text-muted-foreground">
                  Az aktív elem megjelenik a publikus weboldalon.
                </span>
              </span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Mentés..."
                : editingId
                  ? "Módosítások mentése"
                  : "GYIK-elem létrehozása"}
            </button>
          </form>

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Meglévő kérdések</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {faqItems.length} darab GYIK-elem
                </p>
              </div>
            </div>

            {faqItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-background p-10 text-center">
                <h3 className="font-bold">Még nincs GYIK-elem</h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Az első kérdést a bal oldali szerkesztőben hozhatod létre.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {faqItems.map((item, index) => {
                  const itemBusy = actionId === item.id;

                  return (
                    <article
                      key={item.id}
                      className={`rounded-2xl border bg-background p-5 shadow-sm ${
                        item.is_active ? "" : "opacity-65"
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
                                item.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {item.is_active ? "Aktív" : "Elrejtve"}
                            </span>
                          </div>

                          <h3 className="mt-4 text-lg font-bold">
                            {item.question}
                          </h3>

                          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                            {item.answer}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 xl:max-w-[230px] xl:justify-end">
                          <button
                            type="button"
                            disabled={itemBusy || index === 0}
                            onClick={() => void moveItem(item, "up")}
                            aria-label={`${item.question} mozgatása felfelé`}
                            title="Mozgatás felfelé"
                            className="rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            disabled={itemBusy || index === faqItems.length - 1}
                            onClick={() => void moveItem(item, "down")}
                            aria-label={`${item.question} mozgatása lefelé`}
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
                            onClick={() => void toggleActive(item)}
                            className="rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
                          >
                            {item.is_active ? "Elrejtés" : "Aktiválás"}
                          </button>

                          <button
                            type="button"
                            disabled={itemBusy}
                            onClick={() => void deleteFaqItem(item)}
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
