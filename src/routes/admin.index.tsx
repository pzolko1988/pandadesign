import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Scale } from "lucide-react";
import { supabase } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!active) {
          return;
        }

        if (error) {
          setErrorMessage(error.message);
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

        if (!active) {
          return;
        }

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

        setEmail(session.user.email ?? "");
        setLoading(false);
      } catch (error: unknown) {
        if (!active) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Ismeretlen hiba történt.",
        );

        setLoading(false);
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();

    await navigate({
      to: "/admin/login",
      replace: true,
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-muted-foreground">
          Adminfelület betöltése...
        </p>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen px-6 py-20">
        <div className="mx-auto max-w-xl rounded-2xl border bg-background p-6">
          <h1 className="text-2xl font-bold text-red-600">
            Adminfelületi hiba
          </h1>

          <p className="mt-3 text-red-700">{errorMessage}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold text-brand">
              PandaDesign admin
            </p>

            <h1 className="text-3xl font-bold">Áttekintés</h1>

            <p className="mt-2 text-muted-foreground">Bejelentkezve: {email}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border bg-background px-5 py-3 font-semibold transition hover:bg-muted"
          >
            Kijelentkezés
          </button>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Link
            to="/admin/hero"
            className="rounded-2xl border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">Főoldal</p>

            <h2 className="mt-2 text-xl font-bold">Hero szerkesztése</h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Főcím, leírás és gombok módosítása.
            </p>
          </Link>

          <Link
            to="/admin/services"
            className="rounded-2xl border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">Tartalom</p>

            <h2 className="mt-2 text-xl font-bold">Szolgáltatások</h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Hozzáadás, szerkesztés, sorrend és láthatóság.
            </p>
          </Link>

          <Link
            to="/admin/process"
            className="rounded-2xl border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">Főoldal</p>

            <h2 className="mt-2 text-xl font-bold">Munkafolyamat</h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Lépések hozzáadása, szerkesztése és sorrendezése.
            </p>
          </Link>

          <Link
            to="/admin/projects"
            className="rounded-2xl border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">Tartalom</p>

            <h2 className="mt-2 text-xl font-bold">Referenciák</h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Projektek, képek, kategóriák és láthatóság kezelése.
            </p>
          </Link>

          <Link
            to="/admin/pricing"
            className="rounded-2xl border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">Értékesítés</p>

            <h2 className="mt-2 text-xl font-bold">Árak és csomagok</h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Árak, csomagelemek, kiemelés, CTA és sorrend kezelése.
            </p>
          </Link>

          <Link
            to="/admin/why"
            className="rounded-2xl border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">Főoldal</p>

            <h2 className="mt-2 text-xl font-bold">Miért a PandaDesign?</h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Szekciócím, leírás, előnyök, ikonok és sorrend kezelése.
            </p>
          </Link>

          <Link
            to="/admin/testimonials"
            className="rounded-2xl border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">Bizalomépítés</p>

            <h2 className="mt-2 text-xl font-bold">Véleménykezelő</h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Ügyfélvélemények, értékelések, sorrend és láthatóság kezelése.
            </p>
          </Link>

          <Link
            to="/admin/cta"
            className="rounded-2xl border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">Konverzió</p>

            <h2 className="mt-2 text-xl font-bold">Záró CTA</h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Kiemelt üzenet, gomb, ikon és láthatóság kezelése.
            </p>
          </Link>

          <Link
            to="/admin/faq"
            className="rounded-2xl border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">Tartalom</p>

            <h2 className="mt-2 text-xl font-bold">GYIK szerkesztő</h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Kérdések, válaszok, sorrend és láthatóság kezelése.
            </p>
          </Link>

          <Link
            to="/admin/leads"
            className="rounded-2xl border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">Értékesítés</p>

            <h2 className="mt-2 text-xl font-bold">Leadkezelő</h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Ajánlatkérések, státuszok, prioritások és belső jegyzetek
              kezelése.
            </p>
          </Link>

          <Link
            to="/admin/blog"
            className="rounded-2xl border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">Tartalommarketing</p>

            <h2 className="mt-2 text-xl font-bold">Blog</h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Blogbejegyzések, kiemelt képek, SEO és gazdag szöveges tartalom
              kezelése.
            </p>
          </Link>

          <Link
            to="/admin/navigation"
            className="rounded-2xl border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">Globális megjelenés</p>

            <h2 className="mt-2 text-xl font-bold">Fejléc és lábléc</h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Menüpontok, mobilmenü, értesítési sáv, CTA és lábléccsoportok.
            </p>
          </Link>

          <Link
            to="/admin/settings"
            className="rounded-2xl border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">Beállítások</p>

            <h2 className="mt-2 text-xl font-bold">Weboldal adatai</h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Arculat, kapcsolattartás, közösségi linkek, SEO és lábléc
              kezelése.
            </p>
          </Link>

          <Link
            to="/admin/legal"
            className="rounded-2xl border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
              <Scale className="h-5 w-5" />
            </span>

            <p className="mt-4 text-sm text-muted-foreground">Jogi tartalom</p>

            <h2 className="mt-2 text-xl font-bold">Jogi dokumentumok</h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Piszkozatok, közzététel, előnézet és verzióelőzmények kezelése.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}
