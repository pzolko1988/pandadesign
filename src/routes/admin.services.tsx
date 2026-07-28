import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/services")({
  component: AdminServicesPage,
});

type Service = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon_key: string;
  link_url: string;
  sort_order: number;
  is_visible: boolean;
};

type ServiceForm = Omit<Service, "id">;

const emptyForm: ServiceForm = {
  slug: "",
  title: "",
  description: "",
  icon_key: "layers",
  link_url: "/szolgaltatasok",
  sort_order: 1,
  is_visible: true,
};

const iconOptions = [
  { value: "layers", label: "Rétegek / céges oldal" },
  { value: "sparkles", label: "Csillag / landing oldal" },
  { value: "shopping-bag", label: "Bevásárlótáska / webshop" },
  { value: "refresh", label: "Frissítés / újratervezés" },
  { value: "life-buoy", label: "Támogatás / karbantartás" },
  { value: "code", label: "Kód / egyedi fejlesztés" },
];

function AdminServicesPage() {
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
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

    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

    if (adminError) {
      setErrorMessage(adminError.message);
      setLoading(false);
      return;
    }

    if (!isAdmin) {
      setErrorMessage("Ehhez az oldalhoz nincs adminisztrátori jogosultságod.");
      setLoading(false);
      return;
    }

    await loadServices();
  }

  async function loadServices() {
    const { data, error } = await supabase
      .from("services")
      .select(
        "id, slug, title, description, icon_key, link_url, sort_order, is_visible",
      )
      .order("sort_order", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setServices((data ?? []) as Service[]);
    setLoading(false);
  }

  function updateField<K extends keyof ServiceForm>(
    field: K,
    value: ServiceForm[K],
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

  function startEditing(service: Service) {
    setEditingId(service.id);

    setForm({
      slug: service.slug,
      title: service.title,
      description: service.description,
      icon_key: service.icon_key,
      link_url: service.link_url,
      sort_order: service.sort_order,
      is_visible: service.is_visible,
    });

    setErrorMessage("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetEditor() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      sort_order: services.length + 1,
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
      setErrorMessage("A szolgáltatás címe kötelező.");
      setSaving(false);
      return;
    }

    if (!slug) {
      setErrorMessage("Nem sikerült létrehozni az URL-azonosítót.");
      setSaving(false);
      return;
    }

    const payload = {
      slug,
      title: form.title.trim(),
      description: form.description.trim(),
      icon_key: form.icon_key,
      link_url: form.link_url.trim() || "/szolgaltatasok",
      sort_order: Number(form.sort_order),
      is_visible: form.is_visible,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { error } = await supabase
        .from("services")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      setSuccessMessage("A szolgáltatás sikeresen frissítve.");
    } else {
      const { error } = await supabase.from("services").insert(payload);

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      setSuccessMessage("Az új szolgáltatás sikeresen létrehozva.");
    }

    setEditingId(null);
    setForm(emptyForm);

    await loadServices();
    setSaving(false);
  }

  async function toggleVisibility(service: Service) {
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("services")
      .update({
        is_visible: !service.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", service.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage(
      service.is_visible
        ? "A szolgáltatás elrejtve."
        : "A szolgáltatás láthatóvá téve.",
    );

    await loadServices();
  }

  async function deleteService(service: Service) {
    const confirmed = window.confirm(
      `Biztosan törlöd ezt a szolgáltatást?\n\n${service.title}`,
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", service.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("A szolgáltatás törölve.");
    await loadServices();
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-muted-foreground">
          Szolgáltatások betöltése...
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

          <h1 className="mt-4 text-3xl font-bold">Szolgáltatások</h1>

          <p className="mt-2 text-muted-foreground">
            Hozz létre, módosíts, rejts el vagy törölj szolgáltatásokat.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="h-fit space-y-5 rounded-2xl border bg-background p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingId ? "Szolgáltatás szerkesztése" : "Új szolgáltatás"}
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
              label="Cím"
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
              onChange={(value) => updateField("slug", createSlug(value))}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold">Leírás</label>

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
              <label className="mb-2 block text-sm font-semibold">Ikon</label>

              <select
                value={form.icon_key}
                onChange={(event) =>
                  updateField("icon_key", event.target.value)
                }
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand"
              >
                {iconOptions.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>

            <FormField
              label="Hivatkozás"
              value={form.link_url}
              required
              onChange={(value) => updateField("link_url", value)}
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
                  : "Szolgáltatás hozzáadása"}
            </button>
          </form>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Meglévő szolgáltatások</h2>

              <span className="text-sm text-muted-foreground">
                {services.length} elem
              </span>
            </div>

            <div className="space-y-4">
              {services.map((service) => (
                <article
                  key={service.id}
                  className="rounded-2xl border bg-background p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold">{service.title}</h3>

                        <span
                          className={
                            service.is_visible
                              ? "rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700"
                              : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600"
                          }
                        >
                          {service.is_visible ? "Látható" : "Elrejtve"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {service.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>Sorrend: {service.sort_order}</span>

                        <span>Ikon: {service.icon_key}</span>

                        <span>Azonosító: {service.slug}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(service)}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold"
                      >
                        Szerkesztés
                      </button>

                      <button
                        type="button"
                        onClick={() => void toggleVisibility(service)}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold"
                      >
                        {service.is_visible ? "Elrejtés" : "Megjelenítés"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void deleteService(service)}
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                      >
                        Törlés
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {services.length === 0 && (
                <div className="rounded-2xl border bg-background p-8 text-center text-muted-foreground">
                  Még nincs létrehozott szolgáltatás.
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
      <label className="mb-2 block text-sm font-semibold">{label}</label>

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
