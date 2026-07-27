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
  ArrowRight,
  MessageSquare,
  Rocket,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/cta")({
  component: AdminCtaPage,
});

type FinalCtaSettings = {
  id: number;
  badge_text: string;
  title: string;
  description: string;
  button_text: string;
  button_url: string;
  icon_key: string;
  is_visible: boolean;
};

const DEFAULT_SETTINGS: FinalCtaSettings = {
  id: 1,
  badge_text: "Ingyenes konzultáció",
  title: "Készen állsz egy jobb weboldalra?",
  description:
    "Beszéljük át az elképzelésedet egy kötelezettségmentes konzultáción.",
  button_text: "Ajánlatot kérek",
  button_url: "/kapcsolat",
  icon_key: "users",
  is_visible: true,
};

const ICON_OPTIONS: Array<{
  key: string;
  label: string;
  icon: LucideIcon;
}> = [
  {
    key: "users",
    label: "Ügyfelek / konzultáció",
    icon: Users,
  },
  {
    key: "message-square",
    label: "Kapcsolatfelvétel",
    icon: MessageSquare,
  },
  {
    key: "sparkles",
    label: "Kiemelt ajánlat",
    icon: Sparkles,
  },
  {
    key: "rocket",
    label: "Indulás / növekedés",
    icon: Rocket,
  },
];

const ICON_MAP: Record<string, LucideIcon> =
  Object.fromEntries(
    ICON_OPTIONS.map((option) => [
      option.key,
      option.icon,
    ]),
  );

function AdminCtaPage() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState<FinalCtaSettings>(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    void initializePage();
  }, []);

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

      const { data, error } = await supabase
        .from("final_cta_settings")
        .select(
          "id, badge_text, title, description, button_text, button_url, icon_key, is_visible",
        )
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setForm(data as FinalCtaSettings);
      }
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A záró CTA szerkesztő betöltése közben hiba történt.",
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof FinalCtaSettings>(
    field: K,
    value: FinalCtaSettings[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const badgeText = form.badge_text.trim();
    const title = form.title.trim();
    const description = form.description.trim();
    const buttonText = form.button_text.trim();
    const buttonUrl = form.button_url.trim();

    if (title.length < 3) {
      setErrorMessage(
        "A főcímnek legalább 3 karakter hosszúnak kell lennie.",
      );
      return;
    }

    if (buttonText.length < 2) {
      setErrorMessage(
        "A gomb szövegének legalább 2 karakter hosszúnak kell lennie.",
      );
      return;
    }

    if (!buttonUrl) {
      setErrorMessage(
        "A gomb célhivatkozása nem lehet üres.",
      );
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("final_cta_settings")
        .upsert(
          {
            id: 1,
            badge_text: badgeText,
            title,
            description,
            button_text: buttonText,
            button_url: buttonUrl,
            icon_key: form.icon_key,
            is_visible: form.is_visible,
          },
          {
            onConflict: "id",
          },
        );

      if (error) {
        throw error;
      }

      setForm((current) => ({
        ...current,
        badge_text: badgeText,
        title,
        description,
        button_text: buttonText,
        button_url: buttonUrl,
      }));

      setSuccessMessage(
        "A záró CTA beállításai sikeresen elmentve.",
      );
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A záró CTA mentése nem sikerült.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-muted-foreground">
          Záró CTA szerkesztő betöltése...
        </p>
      </main>
    );
  }

  const PreviewIcon =
    ICON_MAP[form.icon_key] ?? Users;

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
            Záró CTA szerkesztő
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            A főoldal utolsó, kiemelt kapcsolatfelvételi
            blokkjának szerkesztése.
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

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="h-fit space-y-5 rounded-2xl border bg-background p-6 shadow-sm lg:sticky lg:top-6"
          >
            <div>
              <h2 className="text-xl font-bold">
                CTA-beállítások
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                A módosítások mentés után jelennek meg a
                publikus főoldalon.
              </p>
            </div>

            <div>
              <label
                htmlFor="cta-badge"
                className="mb-2 block text-sm font-semibold"
              >
                Felső címke
              </label>

              <input
                id="cta-badge"
                value={form.badge_text}
                onChange={(event) =>
                  updateField(
                    "badge_text",
                    event.target.value,
                  )
                }
                placeholder="Például: Ingyenes konzultáció"
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label
                htmlFor="cta-title"
                className="mb-2 block text-sm font-semibold"
              >
                Főcím
              </label>

              <textarea
                id="cta-title"
                required
                minLength={3}
                rows={3}
                value={form.title}
                onChange={(event) =>
                  updateField(
                    "title",
                    event.target.value,
                  )
                }
                className="w-full resize-y rounded-xl border bg-background px-4 py-3 font-semibold leading-relaxed outline-none transition focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label
                htmlFor="cta-description"
                className="mb-2 block text-sm font-semibold"
              >
                Leírás
              </label>

              <textarea
                id="cta-description"
                rows={5}
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value,
                  )
                }
                className="w-full resize-y rounded-xl border bg-background px-4 py-3 leading-relaxed outline-none transition focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label
                htmlFor="cta-button-text"
                className="mb-2 block text-sm font-semibold"
              >
                Gomb szövege
              </label>

              <input
                id="cta-button-text"
                required
                minLength={2}
                value={form.button_text}
                onChange={(event) =>
                  updateField(
                    "button_text",
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label
                htmlFor="cta-button-url"
                className="mb-2 block text-sm font-semibold"
              >
                Gomb célhivatkozása
              </label>

              <input
                id="cta-button-url"
                required
                value={form.button_url}
                onChange={(event) =>
                  updateField(
                    "button_url",
                    event.target.value,
                  )
                }
                placeholder="/kapcsolat vagy https://..."
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
              />

              <p className="mt-2 text-xs text-muted-foreground">
                Belső oldalnál például: /kapcsolat
              </p>
            </div>

            <div>
              <label
                htmlFor="cta-icon"
                className="mb-2 block text-sm font-semibold"
              >
                Címke ikonja
              </label>

              <select
                id="cta-icon"
                value={form.icon_key}
                onChange={(event) =>
                  updateField(
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

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={(event) =>
                  updateField(
                    "is_visible",
                    event.target.checked,
                  )
                }
                className="h-4 w-4"
              />

              <span>
                <span className="block text-sm font-semibold">
                  A záró CTA látható
                </span>

                <span className="mt-1 block text-xs text-muted-foreground">
                  Kikapcsolva a teljes blokk eltűnik a
                  publikus főoldalról.
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
                : "Záró CTA mentése"}
            </button>
          </form>

          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold">
                Élő előnézet
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                A kártya a publikus főoldali megjelenést
                közelíti.
              </p>
            </div>

            {!form.is_visible && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                A szekció jelenleg el van rejtve.
              </div>
            )}

            <div
              className={`relative overflow-hidden rounded-3xl bg-brand p-8 text-brand-foreground shadow-lg md:p-12 ${
                form.is_visible ? "" : "opacity-50"
              }`}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-40 bg-[radial-gradient(600px_300px_at_100%_0%,color-mix(in_oklab,var(--success)_50%,transparent),transparent)]"
              />

              <div className="relative max-w-2xl">
                {form.badge_text && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                    <PreviewIcon className="h-3.5 w-3.5" />
                    {form.badge_text}
                  </div>
                )}

                <h2 className="mt-5 whitespace-pre-line text-3xl font-bold tracking-tight md:text-4xl">
                  {form.title ||
                    "A CTA főcíme itt jelenik meg"}
                </h2>

                {form.description && (
                  <p className="mt-4 whitespace-pre-line text-base text-brand-foreground/80 md:text-lg">
                    {form.description}
                  </p>
                )}

                <div className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-brand">
                  {form.button_text || "CTA gomb"}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
