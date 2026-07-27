import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

        setEmail(session.user.email ?? "");
        setLoading(false);
      } catch (error: unknown) {
        if (!active) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Ismeretlen hiba történt.",
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

          <p className="mt-3 text-red-700">
            {errorMessage}
          </p>
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

            <h1 className="text-3xl font-bold">
              Áttekintés
            </h1>

            <p className="mt-2 text-muted-foreground">
              Bejelentkezve: {email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border bg-background px-5 py-3 font-semibold transition hover:bg-muted"
          >
            Kijelentkezés
          </button>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          <Link
            to="/admin/hero"
            className="rounded-2xl border bg-background p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">
              Főoldal
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Hero szerkesztése
            </h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Főcím, leírás és gombok módosítása.
            </p>
          </Link>

          <article className="rounded-2xl border bg-background p-6 shadow-sm opacity-70">
            <p className="text-sm text-muted-foreground">
              Tartalom
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Szolgáltatások
            </h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Hamarosan elérhető.
            </p>
          </article>

          <article className="rounded-2xl border bg-background p-6 shadow-sm opacity-70">
            <p className="text-sm text-muted-foreground">
              Beállítások
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Weboldal adatai
            </h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Hamarosan elérhető.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}