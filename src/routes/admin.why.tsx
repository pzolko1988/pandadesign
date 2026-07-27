import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Check,
  MessageSquare,
  RefreshCw,
  Settings,
  Smartphone,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/why")({
  component: AdminWhyPage,
});

type WhySectionSettings = {
  id: number;
  eyebrow: string;
  title: string;
  description: string;
  is_visible: boolean;
};

type WhyItem = {
  id: string;
  title: string;
  description: string;
  icon_key: string;
  sort_order: number;
  is_visible: boolean;
};

type WhyItemForm = Omit<WhyItem, "id">;

const DEFAULT_SETTINGS: WhySectionSettings = {
  id: 1,
  eyebrow: "Miért mi",
  title: "Miért a PandaDesign?",
  description: "",
  is_visible: true,
};

const EMPTY_ITEM_FORM: WhyItemForm = {
  title: "",
  description: "",
  icon_key: "check",
  sort_order: 10,
  is_visible: true,
};

const ICON_OPTIONS: Array<{
  key: string;
  label: string;
  icon: LucideIcon;
}> = [
  { key: "check", label: "Pipa", icon: Check },
  { key: "sparkles", label: "Csillogás", icon: Sparkles },
  { key: "zap", label: "Villám", icon: Zap },
  { key: "smartphone", label: "Mobiltelefon", icon: Smartphone },
  { key: "settings", label: "Beállítások", icon: Settings },
  { key: "message-square", label: "Üzenet", icon: MessageSquare },
  { key: "refresh", label: "Folyamatos támogatás", icon: RefreshCw },
];

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map((option) => [option.key, option.icon]),
);

function AdminWhyPage() {
  const navigate = useNavigate();

  const [settings, setSettings] =
    useState<WhySectionSettings>(DEFAULT_SETTINGS);
  const [items, setItems] = useState<WhyItem[]>([]);
  const [itemForm, setItemForm] =
    useState<WhyItemForm>(EMPTY_ITEM_FORM);
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

  function getNextSortOrder(currentItems: WhyItem[]) {
    if (currentItems.length === 0) {
      return 10;
    }

    return (
      Math.max(...currentItems.map((item) => item.sort_order)) + 10
    );
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

      await loadContent();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A szerkesztő betöltése közben hiba történt.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadContent() {
    const [
      { data: settingsData, error: settingsError },
      { data: itemsData, error: itemsError },
    ] = await Promise.all([
      supabase
        .from("why_section_settings")
        .select("id, eyebrow, title, description, is_visible")
        .eq("id", 1)
        .maybeSingle(),
      supabase
        .from("why_items")
        .select(
          "id, title, description, icon_key, sort_order, is_visible",
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
      setSettings(settingsData as WhySectionSettings);
    }

    const loadedItems = (itemsData ?? []) as WhyItem[];

    setItems(loadedItems);

    if (!editingId) {
      setItemForm({
        ...EMPTY_ITEM_FORM,
        sort_order: getNextSortOrder(loadedItems),
      });
    }
  }

  function updateSettings<K extends keyof WhySectionSettings>(
    field: K,
    value: WhySectionSettings[K],
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateItemField<K extends keyof WhyItemForm>(
    field: K,
    value: WhyItemForm[K],
  ) {
    setItemForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveSettings(
    event: FormEvent<HTMLFormElement>,
  ) {
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
        .from("why_section_settings")
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

      setSuccessMessage("A szekció beállításai elmentve.");
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

  function startEditing(item: WhyItem) {
    setEditingId(item.id);
    setItemForm({
      title: item.title,
      description: item.description,
      icon_key: item.icon_key,
      sort_order: item.sort_order,
      is_visible: item.is_visible,
    });

    setErrorMessage("");
    setSuccessMessage("");

    document
      .getElementById("why-item-editor")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function resetItemEditor(currentItems = items) {
    setEditingId(null);
    setItemForm({
      ...EMPTY_ITEM_FORM,
      sort_order: getNextSortOrder(currentItems),
    });
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function saveItem(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const title = itemForm.title.trim();
    const description = itemForm.description.trim();
    const sortOrder = Number(itemForm.sort_order);

    if (title.length < 2) {
      setErrorMessage(
        "Az előny címének legalább 2 karakter hosszúnak kell lennie.",
      );
      return;
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setErrorMessage(
        "A megjelenési sorrend 0 vagy annál nagyobb egész szám lehet.",
      );
      return;
    }

    setSavingItem(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      title,
      description,
      icon_key: itemForm.icon_key,
      sort_order: sortOrder,
      is_visible: itemForm.is_visible,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("why_items")
          .update(payload)
          .eq("id", editingId);

        if (error) {
          throw error;
        }

        setSuccessMessage("Az előny sikeresen frissítve.");
      } else {
        const { error } = await supabase
          .from("why_items")
          .insert(payload);

        if (error) {
          throw error;
        }

        setSuccessMessage("Az új előny sikeresen létrehozva.");
      }

      await loadContent();
      setEditingId(null);

      const { data } = await supabase
        .from("why_items")
        .select(
          "id, title, description, icon_key, sort_order, is_visible",
        )
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      const refreshedItems = (data ?? []) as WhyItem[];

      setItems(refreshedItems);
      setItemForm({
        ...EMPTY_ITEM_FORM,
        sort_order: getNextSortOrder(refreshedItems),
      });
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Az előny mentése nem sikerült.",
      );
    } finally {
      setSavingItem(false);
    }
  }

  async function toggleItem(item: WhyItem) {
    setActionId(item.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("why_items")
        .update({
          is_visible: !item.is_visible,
        })
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      setSuccessMessage(
        item.is_visible
          ? "Az előny elrejtve."
          : "Az előny láthatóvá téve.",
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

  async function moveItem(
    item: WhyItem,
    direction: "up" | "down",
  ) {
    const currentIndex = items.findIndex(
      (currentItem) => currentItem.id === item.id,
    );

    const targetIndex =
      direction === "up"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= items.length
    ) {
      return;
    }

    const targetItem = items[targetIndex];

    setActionId(item.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error: firstError } = await supabase
        .from("why_items")
        .update({
          sort_order: targetItem.sort_order,
        })
        .eq("id", item.id);

      if (firstError) {
        throw firstError;
      }

      const { error: secondError } = await supabase
        .from("why_items")
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

  async function deleteItem(item: WhyItem) {
    const confirmed = window.confirm(
      `Biztosan törlöd ezt az előnyt?\n\n${item.title}`,
    );

    if (!confirmed) {
      return;
    }

    setActionId(item.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("why_items")
        .delete()
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      await loadContent();

      if (editingId === item.id) {
        resetItemEditor();
      }

      setSuccessMessage("Az előny törölve.");
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Az előny törlése nem sikerült.",
      );
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-muted-foreground">
          „Miért a PandaDesign?” szerkesztő betöltése...
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

          <h1 className="mt-4 text-3xl font-bold">
            „Miért a PandaDesign?” szerkesztő
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            A szekció címének, leírásának, láthatóságának és
            előnykártyáinak kezelése.
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
            <h2 className="text-xl font-bold">
              Szekcióbeállítások
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Ezek az adatok a teljes blokk fejlécét szabályozzák.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="why-eyebrow"
                className="mb-2 block text-sm font-semibold"
              >
                Felső címke
              </label>

              <input
                id="why-eyebrow"
                value={settings.eyebrow}
                onChange={(event) =>
                  updateSettings("eyebrow", event.target.value)
                }
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label
                htmlFor="why-title"
                className="mb-2 block text-sm font-semibold"
              >
                Főcím
              </label>

              <input
                id="why-title"
                value={settings.title}
                onChange={(event) =>
                  updateSettings("title", event.target.value)
                }
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="why-description"
                className="mb-2 block text-sm font-semibold"
              >
                Bevezető leírás
              </label>

              <textarea
                id="why-description"
                rows={4}
                value={settings.description}
                onChange={(event) =>
                  updateSettings(
                    "description",
                    event.target.value,
                  )
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
                updateSettings(
                  "is_visible",
                  event.target.checked,
                )
              }
              className="h-4 w-4"
            />

            <span>
              <span className="block text-sm font-semibold">
                A teljes szekció látható
              </span>

              <span className="mt-1 block text-xs text-muted-foreground">
                Kikapcsolva a teljes „Miért a PandaDesign?” blokk
                eltűnik a publikus főoldalról.
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={savingSettings}
            className="mt-5 rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingSettings
              ? "Mentés..."
              : "Szekcióbeállítások mentése"}
          </button>
        </form>

        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          <form
            id="why-item-editor"
            onSubmit={saveItem}
            className="h-fit scroll-mt-6 space-y-5 rounded-2xl border bg-background p-6 shadow-sm lg:sticky lg:top-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">
                {editingId
                  ? "Előny szerkesztése"
                  : "Új előny"}
              </h2>

              {editingId && (
                <button
                  type="button"
                  onClick={() => resetItemEditor()}
                  className="text-sm font-semibold text-brand hover:underline"
                >
                  Mégse
                </button>
              )}
            </div>

            <div>
              <label
                htmlFor="why-item-title"
                className="mb-2 block text-sm font-semibold"
              >
                Cím
              </label>

              <input
                id="why-item-title"
                required
                minLength={2}
                value={itemForm.title}
                onChange={(event) =>
                  updateItemField("title", event.target.value)
                }
                placeholder="Például: Egyedi, modern megjelenés"
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label
                htmlFor="why-item-description"
                className="mb-2 block text-sm font-semibold"
              >
                Leírás
              </label>

              <textarea
                id="why-item-description"
                rows={5}
                value={itemForm.description}
                onChange={(event) =>
                  updateItemField(
                    "description",
                    event.target.value,
                  )
                }
                placeholder="Röviden fejtsd ki, mit jelent ez az előny."
                className="w-full resize-y rounded-xl border bg-background px-4 py-3 leading-relaxed outline-none transition focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label
                htmlFor="why-item-icon"
                className="mb-2 block text-sm font-semibold"
              >
                Ikon
              </label>

              <select
                id="why-item-icon"
                value={itemForm.icon_key}
                onChange={(event) =>
                  updateItemField(
                    "icon_key",
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
              >
                {ICON_OPTIONS.map((option) => (
                  <option
                    key={option.key}
                    value={option.key}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="why-item-order"
                className="mb-2 block text-sm font-semibold"
              >
                Megjelenési sorrend
              </label>

              <input
                id="why-item-order"
                type="number"
                min={0}
                step={1}
                value={itemForm.sort_order}
                onChange={(event) =>
                  updateItemField(
                    "sort_order",
                    Number(event.target.value),
                  )
                }
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
              <input
                type="checkbox"
                checked={itemForm.is_visible}
                onChange={(event) =>
                  updateItemField(
                    "is_visible",
                    event.target.checked,
                  )
                }
                className="h-4 w-4"
              />

              <span>
                <span className="block text-sm font-semibold">
                  Látható előny
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
                  : "Előny létrehozása"}
            </button>
          </form>

          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold">
                Meglévő előnyök
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {items.length} darab elem
              </p>
            </div>

            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-background p-10 text-center">
                <h3 className="font-bold">
                  Még nincs előny létrehozva
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Az első elemet a bal oldali szerkesztőben
                  hozhatod létre.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => {
                  const Icon = ICON_MAP[item.icon_key] ?? Check;
                  const itemBusy = actionId === item.id;

                  return (
                    <article
                      key={item.id}
                      className={`rounded-2xl border bg-background p-5 shadow-sm ${
                        item.is_visible
                          ? ""
                          : "opacity-60"
                      }`}
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="flex min-w-0 flex-1 gap-4">
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-50 text-green-700">
                            <Icon className="h-5 w-5" />
                          </span>

                          <div className="min-w-0">
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
                                {item.is_visible
                                  ? "Látható"
                                  : "Elrejtve"}
                              </span>
                            </div>

                            <h3 className="mt-3 text-lg font-bold">
                              {item.title}
                            </h3>

                            {item.description && (
                              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 xl:max-w-[230px] xl:justify-end">
                          <button
                            type="button"
                            disabled={
                              itemBusy || index === 0
                            }
                            onClick={() =>
                              void moveItem(item, "up")
                            }
                            title="Mozgatás felfelé"
                            className="rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            disabled={
                              itemBusy ||
                              index === items.length - 1
                            }
                            onClick={() =>
                              void moveItem(item, "down")
                            }
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
                            onClick={() =>
                              void toggleItem(item)
                            }
                            className="rounded-lg border px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
                          >
                            {item.is_visible
                              ? "Elrejtés"
                              : "Aktiválás"}
                          </button>

                          <button
                            type="button"
                            disabled={itemBusy}
                            onClick={() =>
                              void deleteItem(item)
                            }
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
