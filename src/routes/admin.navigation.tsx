import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Menu,
  Plus,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
  DEFAULT_SITE_CHROME_SETTINGS,
  type NavigationItem,
  type NavigationPlacement,
  type SiteChromeSettings,
} from "@/lib/site-navigation";

export const Route = createFileRoute(
  "/admin/navigation",
)({
  component: AdminNavigationPage,
});

type NavigationForm = Omit<
  NavigationItem,
  "id"
>;

const EMPTY_NAVIGATION_FORM:
  NavigationForm = {
    label: "",
    url: "",
    placement: "both",
    group_label: "Navigáció",
    sort_order: 10,
    is_visible: true,
    open_in_new_tab: false,
  };

function AdminNavigationPage() {
  const navigate = useNavigate();

  const [settings, setSettings] =
    useState<SiteChromeSettings>(
      DEFAULT_SITE_CHROME_SETTINGS,
    );

  const [items, setItems] =
    useState<NavigationItem[]>([]);

  const [form, setForm] =
    useState<NavigationForm>(
      EMPTY_NAVIGATION_FORM,
    );

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] =
    useState(false);
  const [savingItem, setSavingItem] =
    useState(false);
  const [actionId, setActionId] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    void initializePage();
  }, []);

  const footerGroups = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .filter(
              (item) =>
                item.placement === "footer" ||
                item.placement === "both",
            )
            .map(
              (item) =>
                item.group_label.trim() ||
                "Navigáció",
            ),
        ),
      ),
    [items],
  );

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

      const loadedItems = await loadContent();

      setForm({
        ...EMPTY_NAVIGATION_FORM,
        sort_order:
          getNextSortOrder(loadedItems),
      });
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A navigációs szerkesztő betöltése nem sikerült.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadContent() {
    const [
      { data: settingsData, error: settingsError },
      { data: navigationData, error: navigationError },
    ] = await Promise.all([
      supabase
        .from("site_chrome_settings")
        .select(
          "id, announcement_text, announcement_url, announcement_visible, header_cta_text, header_cta_url, header_cta_visible, header_sticky, footer_show_navigation, footer_show_contact, footer_show_social, footer_show_back_to_top",
        )
        .eq("id", 1)
        .maybeSingle(),
      supabase
        .from("site_navigation_items")
        .select(
          "id, label, url, placement, group_label, sort_order, is_visible, open_in_new_tab",
        )
        .order("sort_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: true,
        }),
    ]);

    if (settingsError) {
      throw settingsError;
    }

    if (navigationError) {
      throw navigationError;
    }

    if (settingsData) {
      setSettings({
        ...DEFAULT_SITE_CHROME_SETTINGS,
        ...(settingsData as
          Partial<SiteChromeSettings>),
      });
    }

    const loadedItems =
      (navigationData ?? []) as
        NavigationItem[];

    setItems(loadedItems);

    return loadedItems;
  }

  function updateSettings<
    K extends keyof SiteChromeSettings,
  >(
    field: K,
    value: SiteChromeSettings[K],
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateForm<
    K extends keyof NavigationForm,
  >(
    field: K,
    value: NavigationForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function getNextSortOrder(
    currentItems: NavigationItem[],
  ) {
    if (currentItems.length === 0) {
      return 10;
    }

    return (
      Math.max(
        ...currentItems.map(
          (item) => item.sort_order,
        ),
      ) + 10
    );
  }

  async function saveSettings(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const headerCtaText =
      settings.header_cta_text.trim();
    const headerCtaUrl =
      settings.header_cta_url.trim();
    const announcementText =
      settings.announcement_text.trim();
    const announcementUrl =
      settings.announcement_url.trim();

    if (
      settings.header_cta_visible &&
      (!headerCtaText || !headerCtaUrl)
    ) {
      setErrorMessage(
        "Látható fejléc-CTA esetén a gomb szövege és célhivatkozása kötelező.",
      );
      return;
    }

    if (
      settings.announcement_visible &&
      !announcementText
    ) {
      setErrorMessage(
        "Látható értesítési sáv esetén a szöveg kötelező.",
      );
      return;
    }

    setSavingSettings(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        ...settings,
        id: 1,
        announcement_text:
          announcementText,
        announcement_url:
          announcementUrl,
        header_cta_text:
          headerCtaText,
        header_cta_url:
          headerCtaUrl,
      };

      const { error } = await supabase
        .from("site_chrome_settings")
        .upsert(payload, {
          onConflict: "id",
        });

      if (error) {
        throw error;
      }

      setSettings(payload);
      setSuccessMessage(
        "A fejléc és lábléc beállításai elmentve.",
      );
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A beállítások mentése nem sikerült.",
      );
    } finally {
      setSavingSettings(false);
    }
  }

  function resetItemEditor(
    currentItems = items,
  ) {
    setEditingId(null);
    setForm({
      ...EMPTY_NAVIGATION_FORM,
      sort_order:
        getNextSortOrder(currentItems),
    });
  }

  function startEditing(item: NavigationItem) {
    setEditingId(item.id);
    setForm({
      label: item.label,
      url: item.url,
      placement: item.placement,
      group_label: item.group_label,
      sort_order: item.sort_order,
      is_visible: item.is_visible,
      open_in_new_tab:
        item.open_in_new_tab,
    });

    setErrorMessage("");
    setSuccessMessage("");

    document
      .getElementById("navigation-editor")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  async function saveNavigationItem(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const label = form.label.trim();
    const url = form.url.trim();
    const groupLabel =
      form.group_label.trim() ||
      "Navigáció";

    if (!label) {
      setErrorMessage(
        "A menüpont neve kötelező.",
      );
      return;
    }

    if (!url) {
      setErrorMessage(
        "A célhivatkozás kötelező.",
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

    setSavingItem(true);
    setErrorMessage("");
    setSuccessMessage("");

    const payload = {
      label,
      url,
      placement: form.placement,
      group_label: groupLabel,
      sort_order:
        Number(form.sort_order),
      is_visible: form.is_visible,
      open_in_new_tab:
        form.open_in_new_tab,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("site_navigation_items")
          .update(payload)
          .eq("id", editingId);

        if (error) {
          throw error;
        }

        setSuccessMessage(
          "A menüpont sikeresen frissítve.",
        );
      } else {
        const { error } = await supabase
          .from("site_navigation_items")
          .insert(payload);

        if (error) {
          throw error;
        }

        setSuccessMessage(
          "Az új menüpont létrehozva.",
        );
      }

      const loadedItems =
        await loadContent();

      resetItemEditor(loadedItems);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A menüpont mentése nem sikerült.",
      );
    } finally {
      setSavingItem(false);
    }
  }

  async function toggleVisibility(
    item: NavigationItem,
  ) {
    setActionId(item.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("site_navigation_items")
        .update({
          is_visible: !item.is_visible,
        })
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      await loadContent();

      setSuccessMessage(
        item.is_visible
          ? "A menüpont elrejtve."
          : "A menüpont láthatóvá téve.",
      );
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
    item: NavigationItem,
    direction: "up" | "down",
  ) {
    const index = items.findIndex(
      (current) => current.id === item.id,
    );

    const targetIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      index < 0 ||
      targetIndex < 0 ||
      targetIndex >= items.length
    ) {
      return;
    }

    const target = items[targetIndex];

    setActionId(item.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error: firstError } =
        await supabase
          .from("site_navigation_items")
          .update({
            sort_order: target.sort_order,
          })
          .eq("id", item.id);

      if (firstError) {
        throw firstError;
      }

      const { error: secondError } =
        await supabase
          .from("site_navigation_items")
          .update({
            sort_order: item.sort_order,
          })
          .eq("id", target.id);

      if (secondError) {
        throw secondError;
      }

      await loadContent();
      setSuccessMessage(
        "A menüpont sorrendje módosítva.",
      );
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

  async function deleteItem(
    item: NavigationItem,
  ) {
    const confirmed = window.confirm(
      `Biztosan törlöd ezt a menüpontot?\n\n${item.label}`,
    );

    if (!confirmed) {
      return;
    }

    setActionId(item.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("site_navigation_items")
        .delete()
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      const loadedItems =
        await loadContent();

      if (editingId === item.id) {
        resetItemEditor(loadedItems);
      }

      setSuccessMessage(
        "A menüpont törölve.",
      );
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A menüpont törlése nem sikerült.",
      );
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-muted-foreground">
          Navigációs szerkesztő betöltése...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <Link
            to="/admin/"
            className="text-sm font-semibold text-brand hover:underline"
          >
            ← Vissza az áttekintéshez
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Fejléc és lábléc
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            Menüpontok, felső értesítési sáv,
            fejléc-CTA és láblécmegjelenés kezelése.
          </p>
        </header>

        {errorMessage && (
          <Message
            type="error"
            text={errorMessage}
          />
        )}

        {successMessage && (
          <Message
            type="success"
            text={successMessage}
          />
        )}

        <form
          onSubmit={saveSettings}
          className="mb-8 rounded-2xl border bg-background p-6 shadow-sm"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold">
              Globális megjelenés
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              A logó, kapcsolati adatok és közösségi
              linkek továbbra is a Weboldal adatai
              menüpontban kezelhetők.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border p-5">
              <h3 className="font-bold">
                Felső értesítési sáv
              </h3>

              <div className="mt-5 space-y-4">
                <TextField
                  id="announcement-text"
                  label="Szöveg"
                  value={
                    settings.announcement_text
                  }
                  onChange={(value) =>
                    updateSettings(
                      "announcement_text",
                      value,
                    )
                  }
                  placeholder="Például: Ingyenes konzultáció júliusban"
                />

                <TextField
                  id="announcement-url"
                  label="Hivatkozás"
                  value={
                    settings.announcement_url
                  }
                  onChange={(value) =>
                    updateSettings(
                      "announcement_url",
                      value,
                    )
                  }
                  placeholder="/kapcsolat vagy https://..."
                />

                <CheckboxField
                  label="Értesítési sáv látható"
                  description="Kikapcsolva a teljes felső sáv eltűnik."
                  checked={
                    settings.announcement_visible
                  }
                  onChange={(checked) =>
                    updateSettings(
                      "announcement_visible",
                      checked,
                    )
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border p-5">
              <h3 className="font-bold">
                Fejléc beállításai
              </h3>

              <div className="mt-5 space-y-4">
                <TextField
                  id="header-cta-text"
                  label="CTA-gomb szövege"
                  value={
                    settings.header_cta_text
                  }
                  onChange={(value) =>
                    updateSettings(
                      "header_cta_text",
                      value,
                    )
                  }
                />

                <TextField
                  id="header-cta-url"
                  label="CTA-gomb hivatkozása"
                  value={
                    settings.header_cta_url
                  }
                  onChange={(value) =>
                    updateSettings(
                      "header_cta_url",
                      value,
                    )
                  }
                />

                <CheckboxField
                  label="CTA-gomb látható"
                  description="Asztali és mobil fejlécben is megjelenik."
                  checked={
                    settings.header_cta_visible
                  }
                  onChange={(checked) =>
                    updateSettings(
                      "header_cta_visible",
                      checked,
                    )
                  }
                />

                <CheckboxField
                  label="Ragadós fejléc"
                  description="Görgetés közben a fejléc a képernyő tetején marad."
                  checked={
                    settings.header_sticky
                  }
                  onChange={(checked) =>
                    updateSettings(
                      "header_sticky",
                      checked,
                    )
                  }
                />
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-2xl border p-5">
            <h3 className="font-bold">
              Lábléc beállításai
            </h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <CheckboxField
                label="Navigáció"
                description="Csoportosított lábléclinkek megjelenítése."
                checked={
                  settings.footer_show_navigation
                }
                onChange={(checked) =>
                  updateSettings(
                    "footer_show_navigation",
                    checked,
                  )
                }
              />

              <CheckboxField
                label="Kapcsolati adatok"
                description="E-mail, telefon és cím megjelenítése."
                checked={
                  settings.footer_show_contact
                }
                onChange={(checked) =>
                  updateSettings(
                    "footer_show_contact",
                    checked,
                  )
                }
              />

              <CheckboxField
                label="Közösségi linkek"
                description="Facebook, Instagram és LinkedIn ikonok."
                checked={
                  settings.footer_show_social
                }
                onChange={(checked) =>
                  updateSettings(
                    "footer_show_social",
                    checked,
                  )
                }
              />

              <CheckboxField
                label="Vissza a tetejére"
                description="Görgető gomb a lábléc alsó sorában."
                checked={
                  settings.footer_show_back_to_top
                }
                onChange={(checked) =>
                  updateSettings(
                    "footer_show_back_to_top",
                    checked,
                  )
                }
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={savingSettings}
            className="mt-6 rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {savingSettings
              ? "Mentés..."
              : "Megjelenési beállítások mentése"}
          </button>
        </form>

        <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
          <form
            id="navigation-editor"
            onSubmit={saveNavigationItem}
            className="h-fit scroll-mt-6 space-y-5 rounded-2xl border bg-background p-6 shadow-sm xl:sticky xl:top-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId
                    ? "Menüpont szerkesztése"
                    : "Új menüpont"}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Belső és külső link is megadható.
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={() =>
                    resetItemEditor()
                  }
                  className="text-sm font-semibold text-brand hover:underline"
                >
                  Mégse
                </button>
              )}
            </div>

            <TextField
              id="navigation-label"
              label="Megjelenő név"
              required
              value={form.label}
              onChange={(value) =>
                updateForm("label", value)
              }
            />

            <TextField
              id="navigation-url"
              label="Célhivatkozás"
              required
              value={form.url}
              onChange={(value) =>
                updateForm("url", value)
              }
              placeholder="/blog vagy https://..."
            />

            <div>
              <label
                htmlFor="navigation-placement"
                className="mb-2 block text-sm font-semibold"
              >
                Megjelenési hely
              </label>

              <select
                id="navigation-placement"
                value={form.placement}
                onChange={(event) =>
                  updateForm(
                    "placement",
                    event.target
                      .value as NavigationPlacement,
                  )
                }
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="both">
                  Fejléc és lábléc
                </option>
                <option value="header">
                  Csak fejléc
                </option>
                <option value="footer">
                  Csak lábléc
                </option>
              </select>
            </div>

            <TextField
              id="navigation-group"
              label="Lábléccsoport"
              value={form.group_label}
              onChange={(value) =>
                updateForm(
                  "group_label",
                  value,
                )
              }
              placeholder="Például: Navigáció vagy Jogi információk"
            />

            <TextField
              id="navigation-order"
              label="Sorrend"
              type="number"
              value={String(form.sort_order)}
              onChange={(value) =>
                updateForm(
                  "sort_order",
                  Number(value),
                )
              }
            />

            <CheckboxField
              label="Látható menüpont"
              description="Kikapcsolva az elem nem jelenik meg a publikus oldalon."
              checked={form.is_visible}
              onChange={(checked) =>
                updateForm(
                  "is_visible",
                  checked,
                )
              }
            />

            <CheckboxField
              label="Megnyitás új lapon"
              description="Külső weboldalaknál ajánlott."
              checked={
                form.open_in_new_tab
              }
              onChange={(checked) =>
                updateForm(
                  "open_in_new_tab",
                  checked,
                )
              }
            />

            <button
              type="submit"
              disabled={savingItem}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />

              {savingItem
                ? "Mentés..."
                : editingId
                  ? "Menüpont frissítése"
                  : "Menüpont létrehozása"}
            </button>
          </form>

          <section className="rounded-2xl border bg-background shadow-sm">
            <div className="border-b p-5">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Menu className="h-5 w-5" />
                </span>

                <div>
                  <h2 className="text-xl font-bold">
                    Menüpontok
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {items.length} elem ·{" "}
                    {footerGroups.length} lábléccsoport
                  </p>
                </div>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                Még nincs menüpont.
              </div>
            ) : (
              <div className="divide-y">
                {items.map((item, index) => {
                  const busy =
                    actionId === item.id;

                  return (
                    <article
                      key={item.id}
                      className={`p-5 ${
                        item.is_visible
                          ? ""
                          : "opacity-55"
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                              {placementLabel(
                                item.placement,
                              )}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                item.is_visible
                                  ? "bg-green-100 text-green-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {item.is_visible
                                ? "Látható"
                                : "Elrejtett"}
                            </span>

                            <span className="text-xs text-muted-foreground">
                              Sorrend:{" "}
                              {item.sort_order}
                            </span>
                          </div>

                          <h3 className="mt-3 font-bold">
                            {item.label}
                          </h3>

                          <p className="mt-1 break-all text-sm text-muted-foreground">
                            {item.url}
                          </p>

                          {(item.placement ===
                            "footer" ||
                            item.placement ===
                              "both") && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Lábléccsoport:{" "}
                              {item.group_label ||
                                "Navigáció"}
                            </p>
                          )}

                          {item.open_in_new_tab && (
                            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <ExternalLink className="h-3.5 w-3.5" />
                              Új lapon nyílik meg
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 lg:max-w-[260px] lg:justify-end">
                          <button
                            type="button"
                            title="Mozgatás felfelé"
                            disabled={
                              busy || index === 0
                            }
                            onClick={() =>
                              void moveItem(
                                item,
                                "up",
                              )
                            }
                            className="grid h-9 w-9 place-items-center rounded-lg border hover:bg-muted disabled:opacity-35"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            title="Mozgatás lefelé"
                            disabled={
                              busy ||
                              index ===
                                items.length - 1
                            }
                            onClick={() =>
                              void moveItem(
                                item,
                                "down",
                              )
                            }
                            className="grid h-9 w-9 place-items-center rounded-lg border hover:bg-muted disabled:opacity-35"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              startEditing(item)
                            }
                            className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-muted"
                          >
                            Szerkesztés
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void toggleVisibility(
                                item,
                              )
                            }
                            className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-muted"
                          >
                            {item.is_visible
                              ? "Elrejtés"
                              : "Aktiválás"}
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void deleteItem(item)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
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

function CheckboxField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
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

function Message({
  type,
  text,
}: {
  type: "error" | "success";
  text: string;
}) {
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

function placementLabel(
  placement: NavigationPlacement,
) {
  switch (placement) {
    case "header":
      return "Csak fejléc";
    case "footer":
      return "Csak lábléc";
    default:
      return "Fejléc és lábléc";
  }
}
