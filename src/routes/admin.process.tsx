import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/process")({
  component: AdminProcessPage,
});

type ProcessStep = {
  id: string;
  step_number: string;
  title: string;
  description: string;
  sort_order: number;
  is_visible: boolean;
};

type ProcessForm = Omit<ProcessStep, "id">;

const emptyForm: ProcessForm = {
  step_number: "01",
  title: "",
  description: "",
  sort_order: 1,
  is_visible: true,
};

function AdminProcessPage() {
  const navigate = useNavigate();

  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [form, setForm] = useState<ProcessForm>(emptyForm);
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

    await loadSteps();
  }

  async function loadSteps() {
    const { data, error } = await supabase
      .from("process_steps")
      .select("id, step_number, title, description, sort_order, is_visible")
      .order("sort_order", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setSteps((data ?? []) as ProcessStep[]);
    setLoading(false);
  }

  function updateField<K extends keyof ProcessForm>(
    field: K,
    value: ProcessForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startEditing(step: ProcessStep) {
    setEditingId(step.id);
    setForm({
      step_number: step.step_number,
      title: step.title,
      description: step.description,
      sort_order: step.sort_order,
      is_visible: step.is_visible,
    });
    setErrorMessage("");
    setSuccessMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetEditor() {
    const nextOrder = steps.length + 1;

    setEditingId(null);
    setForm({
      ...emptyForm,
      step_number: String(nextOrder).padStart(2, "0"),
      sort_order: nextOrder,
    });
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.title.trim()) {
      setErrorMessage("A lépés címe kötelező.");
      setSaving(false);
      return;
    }

    if (!form.description.trim()) {
      setErrorMessage("A lépés leírása kötelező.");
      setSaving(false);
      return;
    }

    const payload = {
      step_number:
        form.step_number.trim() || String(form.sort_order).padStart(2, "0"),
      title: form.title.trim(),
      description: form.description.trim(),
      sort_order: Number(form.sort_order),
      is_visible: form.is_visible,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { error } = await supabase
        .from("process_steps")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      setSuccessMessage("A munkafolyamat lépése frissítve.");
    } else {
      const { error } = await supabase.from("process_steps").insert(payload);

      if (error) {
        setErrorMessage(error.message);
        setSaving(false);
        return;
      }

      setSuccessMessage("Az új munkafolyamat-lépés létrehozva.");
    }

    setEditingId(null);
    await loadSteps();

    const nextOrder = steps.length + (editingId ? 1 : 2);
    setForm({
      ...emptyForm,
      step_number: String(nextOrder).padStart(2, "0"),
      sort_order: nextOrder,
    });
    setSaving(false);
  }

  async function toggleVisibility(step: ProcessStep) {
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("process_steps")
      .update({
        is_visible: !step.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", step.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage(
      step.is_visible ? "A lépés elrejtve." : "A lépés láthatóvá téve.",
    );
    await loadSteps();
  }

  async function deleteStep(step: ProcessStep) {
    const confirmed = window.confirm(
      `Biztosan törlöd ezt a lépést?\n\n${step.step_number} – ${step.title}`,
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("process_steps")
      .delete()
      .eq("id", step.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("A munkafolyamat-lépés törölve.");
    await loadSteps();
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-muted-foreground">
          Munkafolyamat betöltése...
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

          <h1 className="mt-4 text-3xl font-bold">Munkafolyamat</h1>

          <p className="mt-2 text-muted-foreground">
            Az „Így dolgozunk” szakasz lépéseinek kezelése.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="h-fit space-y-5 rounded-2xl border bg-background p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingId ? "Lépés szerkesztése" : "Új lépés"}
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
              label="Lépésszám"
              value={form.step_number}
              required
              onChange={(value) => updateField("step_number", value)}
            />

            <FormField
              label="Cím"
              value={form.title}
              required
              onChange={(value) => updateField("title", value)}
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
                  : "Lépés hozzáadása"}
            </button>
          </form>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Meglévő lépések</h2>

              <span className="text-sm text-muted-foreground">
                {steps.length} elem
              </span>
            </div>

            <div className="space-y-4">
              {steps.map((step) => (
                <article
                  key={step.id}
                  className="rounded-2xl border bg-background p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-success tracking-widest">
                          {step.step_number}
                        </span>

                        <h3 className="text-lg font-bold">{step.title}</h3>

                        <span
                          className={
                            step.is_visible
                              ? "rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700"
                              : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600"
                          }
                        >
                          {step.is_visible ? "Látható" : "Elrejtve"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {step.description}
                      </p>

                      <p className="mt-3 text-xs text-muted-foreground">
                        Sorrend: {step.sort_order}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(step)}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold"
                      >
                        Szerkesztés
                      </button>

                      <button
                        type="button"
                        onClick={() => void toggleVisibility(step)}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold"
                      >
                        {step.is_visible ? "Elrejtés" : "Megjelenítés"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void deleteStep(step)}
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                      >
                        Törlés
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {steps.length === 0 && (
                <div className="rounded-2xl border bg-background p-8 text-center text-muted-foreground">
                  Még nincs létrehozott munkafolyamat-lépés.
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
