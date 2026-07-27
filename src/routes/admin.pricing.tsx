import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Plus,
  Trash2,
} from "lucide-react";
import { supabase } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/pricing")({
  component: AdminPricingPage,
});

type PricingPackage = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_label: string;
  currency: string;
  price_suffix: string;
  badge_text: string;
  cta_text: string;
  cta_url: string;
  features: string[];
  sort_order: number;
  is_featured: boolean;
  is_visible: boolean;
};

type PricingForm = Omit<PricingPackage, "id">;

const emptyForm: PricingForm = {
  slug: "",
  name: "",
  description: "",
  price_label: "",
  currency: "Ft",
  price_suffix: "-tól, +ÁFA",
  badge_text: "Legnépszerűbb",
  cta_text: "Ajánlatot kérek",
  cta_url: "/kapcsolat",
  features: [""],
  sort_order: 1,
  is_featured: false,
  is_visible: true,
};

function AdminPricingPage() {
  const navigate = useNavigate();

  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [form, setForm] = useState<PricingForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    void initializePage();
  }, []);

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

    await loadPackages();
  }

  async function loadPackages() {
    const { data, error } = await supabase
      .from("pricing_packages")
      .select(
        "id, slug, name, description, price_label, currency, price_suffix, badge_text, cta_text, cta_url, features, sort_order, is_featured, is_visible",
      )
      .order("sort_order", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setPackages(
      (data ?? []).map((item) => ({
        ...item,
        features: Array.isArray(item.features)
          ? (item.features as string[])
          : [],
      })) as PricingPackage[],
    );
    setLoading(false);
  }

  function updateField<K extends keyof PricingForm>(
    field: K,
    value: PricingForm[K],
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

  function updateFeature(index: number, value: string) {
    setForm((current) => ({
      ...current,
      features: current.features.map((feature, featureIndex) =>
        featureIndex === index ? value : feature,
      ),
    }));
  }

  function addFeature() {
    setForm((current) => ({
      ...current,
      features: [...current.features, ""],
    }));
  }

  function removeFeature(index: number) {
    setForm((current) => {
      const nextFeatures = current.features.filter(
        (_, featureIndex) => featureIndex !== index,
      );

      return {
        ...current,
        features: nextFeatures.length > 0 ? nextFeatures : [""],
      };
    });
  }

  function moveFeature(index: number, direction: -1 | 1) {
    setForm((current) => {
      const nextIndex = index + direction;

      if (
        nextIndex < 0 ||
        nextIndex >= current.features.length
      ) {
        return current;
      }

      const nextFeatures = [...current.features];
      [nextFeatures[index], nextFeatures[nextIndex]] = [
        nextFeatures[nextIndex],
        nextFeatures[index],
      ];

      return {
        ...current,
        features: nextFeatures,
      };
    });
  }

  function startEditing(item: PricingPackage) {
    setEditingId(item.id);
    setForm({
      slug: item.slug,
      name: item.name,
      description: item.description,
      price_label: item.price_label,
      currency: item.currency,
      price_suffix: item.price_suffix,
      badge_text: item.badge_text,
      cta_text: item.cta_text,
      cta_url: item.cta_url,
      features:
        item.features.length > 0 ? [...item.features] : [""],
      sort_order: item.sort_order,
      is_featured: item.is_featured,
      is_visible: item.is_visible,
    });
    setErrorMessage("");
    setSuccessMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function duplicatePackage(item: PricingPackage) {
    setEditingId(null);
    setForm({
      slug: `${item.slug}-masolat`,
      name: `${item.name} másolat`,
      description: item.description,
      price_label: item.price_label,
      currency: item.currency,
      price_suffix: item.price_suffix,
      badge_text: item.badge_text,
      cta_text: item.cta_text,
      cta_url: item.cta_url,
      features:
        item.features.length > 0 ? [...item.features] : [""],
      sort_order: packages.length + 1,
      is_featured: false,
      is_visible: false,
    });
    setErrorMessage("");
    setSuccessMessage(
      "A csomag másolata betöltve. Mentéssel hozhatod létre.",
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetEditor() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      features: [""],
      sort_order: packages.length + 1,
    });
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const slug = form.slug.trim() || createSlug(form.name);
    const features = form.features
      .map((feature) => feature.trim())
      .filter(Boolean);

    if (!form.name.trim()) {
      setErrorMessage("A csomag neve kötelező.");
      setSaving(false);
      return;
    }

    if (!slug) {
      setErrorMessage("Nem sikerült létrehozni az URL-azonosítót.");
      setSaving(false);
      return;
    }

    if (!form.price_label.trim()) {
      setErrorMessage(
        "Adj meg árat vagy például ezt: Egyedi ajánlat.",
      );
      setSaving(false);
      return;
    }

    if (features.length === 0) {
      setErrorMessage("Adj meg legalább egy csomagelemet.");
      setSaving(false);
      return;
    }

    if (form.is_featured) {
      const unfeatureQuery = supabase
        .from("pricing_packages")
        .update({
          is_featured: false,
          updated_at: new Date().toISOString(),
        })
        .eq("is_featured", true);

      const { error: unfeatureError } = editingId
        ? await unfeatureQuery.neq("id", editingId)
        : await unfeatureQuery;

      if (unfeatureError) {
        setErrorMessage(unfeatureError.message);
        setSaving(false);
        return;
      }
    }

    const payload = {
      slug,
      name: form.name.trim(),
      description: form.description.trim(),
      price_label: form.price_label.trim(),
      currency: form.currency.trim(),
      price_suffix: form.price_suffix.trim(),
      badge_text: form.badge_text.trim(),
      cta_text: form.cta_text.trim() || "Ajánlatot kérek",
      cta_url: form.cta_url.trim() || "/kapcsolat",
      features,
      sort_order: Number(form.sort_order),
      is_featured: form.is_featured,
      is_visible: form.is_visible,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { error } = await supabase
        .from("pricing_packages")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      setSuccessMessage("A csomag sikeresen frissítve.");
    } else {
      const { error } = await supabase
        .from("pricing_packages")
        .insert(payload);

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      setSuccessMessage("Az új csomag sikeresen létrehozva.");
    }

    setEditingId(null);
    setForm({
      ...emptyForm,
      features: [""],
    });
    await loadPackages();
    setSaving(false);
  }

  async function toggleVisibility(item: PricingPackage) {
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("pricing_packages")
      .update({
        is_visible: !item.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage(
      item.is_visible
        ? "A csomag elrejtve."
        : "A csomag láthatóvá téve.",
    );
    await loadPackages();
  }

  async function deletePackage(item: PricingPackage) {
    const confirmed = window.confirm(
      `Biztosan törlöd ezt a csomagot?\n\n${item.name}`,
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("pricing_packages")
      .delete()
      .eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("A csomag törölve.");
    await loadPackages();
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-muted-foreground">
          Árcsomagok betöltése...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <Link
            to="/admin/"
            className="text-sm font-semibold text-brand hover:underline"
          >
            ← Vissza az áttekintéshez
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Árak és csomagok
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            Kezeld az árakat, a csomag tartalmát, a kiemelést,
            a CTA-gombot, a sorrendet és a láthatóságot.
          </p>
        </header>

        <div className="grid gap-8 xl:grid-cols-[430px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="h-fit space-y-5 rounded-2xl border bg-background p-6 shadow-sm xl:sticky xl:top-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">
                {editingId
                  ? "Csomag szerkesztése"
                  : "Új csomag"}
              </h2>

              {(editingId || form.name) && (
                <button
                  type="button"
                  onClick={resetEditor}
                  className="text-sm font-semibold text-brand"
                >
                  Ürítés
                </button>
              )}
            </div>

            <FormField
              label="Csomag neve"
              value={form.name}
              required
              onChange={(value) => {
                updateField("name", value);
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

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Rövid leírás
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className="w-full resize-y rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div className="grid grid-cols-[1fr_100px] gap-3">
              <FormField
                label="Ár vagy ármegnevezés"
                value={form.price_label}
                required
                placeholder="199 000 vagy Egyedi ajánlat"
                onChange={(value) =>
                  updateField("price_label", value)
                }
              />

              <FormField
                label="Pénznem"
                value={form.currency}
                placeholder="Ft"
                onChange={(value) =>
                  updateField("currency", value)
                }
              />
            </div>

            <FormField
              label="Ár alatti megjegyzés"
              value={form.price_suffix}
              placeholder="-tól, +ÁFA"
              onChange={(value) =>
                updateField("price_suffix", value)
              }
            />

            <div className="rounded-2xl border p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    Csomag tartalma
                  </p>
                  <p className="text-xs text-muted-foreground">
                    A nyilakkal a sorrend is módosítható.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addFeature}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold"
                >
                  <Plus className="h-4 w-4" /> Hozzáadás
                </button>
              </div>

              <div className="space-y-3">
                {form.features.map((feature, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_auto] gap-2"
                  >
                    <input
                      type="text"
                      value={feature}
                      placeholder={`Csomagelem ${index + 1}`}
                      onChange={(event) =>
                        updateFeature(index, event.target.value)
                      }
                      className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
                    />

                    <div className="flex items-center gap-1">
                      <IconButton
                        label="Felfelé"
                        disabled={index === 0}
                        onClick={() => moveFeature(index, -1)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </IconButton>

                      <IconButton
                        label="Lefelé"
                        disabled={
                          index === form.features.length - 1
                        }
                        onClick={() => moveFeature(index, 1)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </IconButton>

                      <IconButton
                        label="Törlés"
                        onClick={() => removeFeature(index)}
                        danger
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <FormField
              label="Kiemelés felirata"
              value={form.badge_text}
              placeholder="Legnépszerűbb"
              onChange={(value) =>
                updateField("badge_text", value)
              }
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                label="CTA-gomb szövege"
                value={form.cta_text}
                required
                onChange={(value) =>
                  updateField("cta_text", value)
                }
              />

              <FormField
                label="CTA-gomb hivatkozása"
                value={form.cta_url}
                required
                onChange={(value) =>
                  updateField("cta_url", value)
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Megjelenési sorrend
              </label>
              <input
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(event) =>
                  updateField(
                    "sort_order",
                    Number(event.target.value),
                  )
                }
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ToggleField
                label="Kiemelt csomag"
                description="Egyszerre egy csomag legyen kiemelt."
                checked={form.is_featured}
                onChange={(checked) =>
                  updateField("is_featured", checked)
                }
              />

              <ToggleField
                label="Megjelenjen az oldalon"
                description="Kikapcsolva piszkozatként megmarad."
                checked={form.is_visible}
                onChange={(checked) =>
                  updateField("is_visible", checked)
                }
              />
            </div>

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
                  : "Csomag hozzáadása"}
            </button>
          </form>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Meglévő csomagok
              </h2>
              <span className="text-sm text-muted-foreground">
                {packages.length} elem
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {packages.map((item) => (
                <article
                  key={item.id}
                  className={`relative rounded-2xl border bg-background p-6 shadow-sm ${
                    item.is_featured
                      ? "border-brand ring-1 ring-brand/20"
                      : ""
                  }`}
                >
                  {item.is_featured && (
                    <span className="absolute right-4 top-4 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-white">
                      {item.badge_text || "Kiemelt"}
                    </span>
                  )}

                  <div className="pr-24">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold">
                        {item.name}
                      </h3>
                      <StatusBadge visible={item.is_visible} />
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>

                    <p className="mt-4 text-3xl font-bold">
                      {item.price_label}
                      {item.currency && (
                        <span className="ml-1 text-lg">
                          {item.currency}
                        </span>
                      )}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {item.price_suffix}
                    </p>
                  </div>

                  <ul className="mt-5 space-y-2 text-sm">
                    {item.features.map((feature) => (
                      <li key={feature}>• {feature}</li>
                    ))}
                  </ul>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(item)}
                      className="rounded-lg border px-3 py-2 text-sm font-semibold"
                    >
                      Szerkesztés
                    </button>

                    <button
                      type="button"
                      onClick={() => duplicatePackage(item)}
                      className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold"
                    >
                      <Copy className="h-4 w-4" /> Másolás
                    </button>

                    <button
                      type="button"
                      onClick={() => void toggleVisibility(item)}
                      className="rounded-lg border px-3 py-2 text-sm font-semibold"
                    >
                      {item.is_visible ? "Elrejtés" : "Megjelenítés"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void deletePackage(item)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600"
                    >
                      Törlés
                    </button>
                  </div>
                </article>
              ))}

              {packages.length === 0 && (
                <div className="rounded-2xl border bg-background p-8 text-center text-muted-foreground lg:col-span-2">
                  Még nincs létrehozott árcsomag.
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
  placeholder?: string;
  onChange: (value: string) => void;
};

function FormField({
  label,
  value,
  required = false,
  placeholder,
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
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
      />
    </div>
  );
}

type ToggleFieldProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: ToggleFieldProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4"
      />
      <span>
        <span className="block text-sm font-semibold">
          {label}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  );
}

type IconButtonProps = {
  label: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function IconButton({
  label,
  disabled = false,
  danger = false,
  onClick,
  children,
}: IconButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-10 w-10 place-items-center rounded-lg border disabled:opacity-30 ${
        danger ? "border-red-200 text-red-600" : ""
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ visible }: { visible: boolean }) {
  return (
    <span
      className={
        visible
          ? "rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700"
          : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600"
      }
    >
      {visible ? "Látható" : "Elrejtve"}
    </span>
  );
}
