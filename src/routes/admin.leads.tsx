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
  Archive,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  Star,
  Trash2,
  UserRound,
} from "lucide-react";
import { supabase } from "../lib/supabase/client";

export const Route = createFileRoute("/admin/leads")({
  component: AdminLeadsPage,
});

type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal_sent"
  | "won"
  | "lost"
  | "spam";

type LeadPriority =
  | "low"
  | "normal"
  | "high";

type ContactLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service_type: string;
  budget_range: string;
  message: string;
  status: LeadStatus;
  priority: LeadPriority;
  privacy_accepted: boolean;
  privacy_accepted_at: string;
  privacy_policy_version: string;
  marketing_consent: boolean;
  marketing_consent_at: string | null;
  source_page: string;
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  user_agent: string;
  viewed_at: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
};

type LeadNote = {
  id: string;
  lead_id: string;
  note: string;
  created_by: string;
  created_at: string;
};

const STATUS_OPTIONS: Array<{
  value: LeadStatus;
  label: string;
}> = [
  { value: "new", label: "Új" },
  { value: "contacted", label: "Kapcsolatfelvétel megtörtént" },
  { value: "qualified", label: "Minősített érdeklődő" },
  { value: "proposal_sent", label: "Ajánlat elküldve" },
  { value: "won", label: "Megnyert" },
  { value: "lost", label: "Elvesztett" },
  { value: "spam", label: "Spam" },
];

const PRIORITY_OPTIONS: Array<{
  value: LeadPriority;
  label: string;
}> = [
  { value: "low", label: "Alacsony" },
  { value: "normal", label: "Normál" },
  { value: "high", label: "Magas" },
];

const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((item) => [
    item.value,
    item.label,
  ]),
) as Record<LeadStatus, string>;

const PRIORITY_LABELS = Object.fromEntries(
  PRIORITY_OPTIONS.map((item) => [
    item.value,
    item.label,
  ]),
) as Record<LeadPriority, string>;

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-sky-100 text-sky-800",
  qualified: "bg-violet-100 text-violet-800",
  proposal_sent: "bg-amber-100 text-amber-800",
  won: "bg-green-100 text-green-800",
  lost: "bg-slate-100 text-slate-700",
  spam: "bg-red-100 text-red-800",
};

function AdminLeadsPage() {
  const navigate = useNavigate();

  const [leads, setLeads] =
    useState<ContactLead[]>([]);
  const [selectedId, setSelectedId] =
    useState<string | null>(null);
  const [notes, setNotes] =
    useState<LeadNote[]>([]);
  const [noteText, setNoteText] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<LeadStatus | "all">("all");

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] =
    useState(false);
  const [saving, setSaving] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    void initializePage();
  }, []);

  useEffect(() => {
    if (selectedId) {
      void loadSelectedLeadData(selectedId);
    } else {
      setNotes([]);
    }
  }, [selectedId]);

  const selectedLead = useMemo(
    () =>
      leads.find((lead) => lead.id === selectedId) ??
      null,
    [leads, selectedId],
  );

  const filteredLeads = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLocaleLowerCase("hu-HU");

    return leads.filter((lead) => {
      const matchesStatus =
        statusFilter === "all" ||
        lead.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        lead.name,
        lead.email,
        lead.phone,
        lead.company,
        lead.service_type,
        lead.budget_range,
        lead.message,
      ].some((value) =>
        value
          .toLocaleLowerCase("hu-HU")
          .includes(normalizedSearch),
      );
    });
  }, [leads, searchTerm, statusFilter]);

  const stats = useMemo(
    () => ({
      total: leads.length,
      new: leads.filter(
        (lead) => lead.status === "new",
      ).length,
      active: leads.filter((lead) =>
        [
          "contacted",
          "qualified",
          "proposal_sent",
        ].includes(lead.status),
      ).length,
      won: leads.filter(
        (lead) => lead.status === "won",
      ).length,
    }),
    [leads],
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
        setErrorMessage(
          "Ehhez az oldalhoz nincs adminisztrátori jogosultságod.",
        );
        return;
      }

      await loadLeads();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A leadkezelő betöltése közben hiba történt.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadLeads() {
    const { data, error } = await supabase
      .from("contact_leads")
      .select(
        "id, name, email, phone, company, service_type, budget_range, message, status, priority, privacy_accepted, privacy_accepted_at, privacy_policy_version, marketing_consent, marketing_consent_at, source_page, referrer, utm_source, utm_medium, utm_campaign, utm_content, utm_term, user_agent, viewed_at, last_contacted_at, created_at, updated_at",
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(500);

    if (error) {
      throw error;
    }

    const loadedLeads =
      (data ?? []) as ContactLead[];

    setLeads(loadedLeads);

    if (
      selectedId &&
      !loadedLeads.some(
        (lead) => lead.id === selectedId,
      )
    ) {
      setSelectedId(null);
    }
  }

  async function loadSelectedLeadData(
    leadId: string,
  ) {
    setDetailLoading(true);
    setErrorMessage("");

    try {
      const lead = leads.find(
        (item) => item.id === leadId,
      );

      if (lead && !lead.viewed_at) {
        const viewedAt = new Date().toISOString();

        const { error: viewedError } = await supabase
          .from("contact_leads")
          .update({
            viewed_at: viewedAt,
          })
          .eq("id", leadId);

        if (viewedError) {
          throw viewedError;
        }

        setLeads((current) =>
          current.map((item) =>
            item.id === leadId
              ? {
                  ...item,
                  viewed_at: viewedAt,
                }
              : item,
          ),
        );
      }

      const { data, error } = await supabase
        .from("contact_lead_notes")
        .select(
          "id, lead_id, note, created_by, created_at",
        )
        .eq("lead_id", leadId)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setNotes((data ?? []) as LeadNote[]);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A lead részletei nem tölthetők be.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function updateLead(
    leadId: string,
    changes: Partial<ContactLead>,
    message: string,
  ) {
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload: Record<string, unknown> = {
        ...changes,
      };

      if (
        changes.status === "contacted" &&
        !selectedLead?.last_contacted_at
      ) {
        payload.last_contacted_at =
          new Date().toISOString();
      }

      const { error } = await supabase
        .from("contact_leads")
        .update(payload)
        .eq("id", leadId);

      if (error) {
        throw error;
      }

      setLeads((current) =>
        current.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                ...payload,
              } as ContactLead
            : lead,
        ),
      );

      setSuccessMessage(message);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A lead frissítése nem sikerült.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function addNote(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedLead) {
      return;
    }

    const note = noteText.trim();

    if (note.length < 2) {
      setErrorMessage(
        "A jegyzetnek legalább 2 karakter hosszúnak kell lennie.",
      );
      return;
    }

    setAddingNote(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          "A felhasználói munkamenet nem található.",
        );
      }

      const { data, error } = await supabase
        .from("contact_lead_notes")
        .insert({
          lead_id: selectedLead.id,
          note,
          created_by: user.id,
        })
        .select(
          "id, lead_id, note, created_by, created_at",
        )
        .single();

      if (error) {
        throw error;
      }

      setNotes((current) => [
        data as LeadNote,
        ...current,
      ]);
      setNoteText("");
      setSuccessMessage("A belső jegyzet elmentve.");
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A jegyzet mentése nem sikerült.",
      );
    } finally {
      setAddingNote(false);
    }
  }

  async function deleteNote(note: LeadNote) {
    const confirmed = window.confirm(
      "Biztosan törlöd ezt a belső jegyzetet?",
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("contact_lead_notes")
        .delete()
        .eq("id", note.id);

      if (error) {
        throw error;
      }

      setNotes((current) =>
        current.filter(
          (currentNote) =>
            currentNote.id !== note.id,
        ),
      );

      setSuccessMessage("A jegyzet törölve.");
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A jegyzet törlése nem sikerült.",
      );
    }
  }

  async function deleteLead(lead: ContactLead) {
    const confirmed = window.confirm(
      `Biztosan végleg törlöd ezt a leadet?\n\n${lead.name} – ${lead.email}`,
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase
        .from("contact_leads")
        .delete()
        .eq("id", lead.id);

      if (error) {
        throw error;
      }

      setLeads((current) =>
        current.filter(
          (currentLead) =>
            currentLead.id !== lead.id,
        ),
      );

      if (selectedId === lead.id) {
        setSelectedId(null);
      }

      setSuccessMessage("A lead végleg törölve.");
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "A lead törlése nem sikerült.",
      );
    } finally {
      setSaving(false);
    }
  }

  function exportCsv() {
    const rows = [
      [
        "Létrehozva",
        "Név",
        "E-mail",
        "Telefon",
        "Vállalkozás",
        "Szolgáltatás",
        "Költségkeret",
        "Státusz",
        "Prioritás",
        "Üzenet",
        "Marketing hozzájárulás",
        "UTM source",
        "UTM medium",
        "UTM campaign",
      ],
      ...filteredLeads.map((lead) => [
        formatDate(lead.created_at),
        lead.name,
        lead.email,
        lead.phone,
        lead.company,
        lead.service_type,
        lead.budget_range,
        STATUS_LABELS[lead.status],
        PRIORITY_LABELS[lead.priority],
        lead.message,
        lead.marketing_consent
          ? "Igen"
          : "Nem",
        lead.utm_source,
        lead.utm_medium,
        lead.utm_campaign,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) =>
            `"${String(cell).replace(/"/g, '""')}"`,
          )
          .join(";"),
      )
      .join("\n");

    const blob = new Blob(
      [`\uFEFF${csv}`],
      {
        type: "text/csv;charset=utf-8",
      },
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      `pandadesign-leads-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main className="min-h-screen px-6 py-20">
        <p className="text-center text-muted-foreground">
          Leadkezelő betöltése...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              to="/admin/"
              className="text-sm font-semibold text-brand hover:underline"
            >
              ← Vissza az áttekintéshez
            </Link>

            <h1 className="mt-4 text-3xl font-bold">
              Kapcsolatfelvételi leadek
            </h1>

            <p className="mt-2 max-w-3xl text-muted-foreground">
              Beérkező ajánlatkérések, státuszok,
              prioritások és belső jegyzetek kezelése.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadLeads()}
              className="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm font-semibold transition hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" />
              Frissítés
            </button>

            <button
              type="button"
              onClick={exportCsv}
              disabled={filteredLeads.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              CSV-export
            </button>
          </div>
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

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Összes lead"
            value={stats.total}
            icon={Archive}
          />

          <StatCard
            label="Új"
            value={stats.new}
            icon={Star}
          />

          <StatCard
            label="Folyamatban"
            value={stats.active}
            icon={Clock3}
          />

          <StatCard
            label="Megnyert"
            value={stats.won}
            icon={CheckCircle2}
          />
        </section>

        <section className="mb-6 grid gap-4 rounded-2xl border bg-background p-4 shadow-sm md:grid-cols-[1fr_260px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Keresés név, e-mail, cég, üzenet vagy szolgáltatás alapján..."
              className="w-full rounded-xl border bg-background py-3 pl-11 pr-4 outline-none transition focus:ring-2 focus:ring-brand"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | LeadStatus
                  | "all",
              )
            }
            className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-brand"
          >
            <option value="all">
              Minden státusz
            </option>

            {STATUS_OPTIONS.map((status) => (
              <option
                key={status.value}
                value={status.value}
              >
                {status.label}
              </option>
            ))}
          </select>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(400px,0.85fr)]">
          <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
            <div className="border-b px-5 py-4">
              <h2 className="font-bold">
                Leadlista
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {filteredLeads.length} találat
              </p>
            </div>

            {filteredLeads.length === 0 ? (
              <div className="p-10 text-center">
                <h3 className="font-bold">
                  Nincs megjeleníthető lead
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Módosítsd a keresést vagy a
                  státuszszűrőt.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredLeads.map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() =>
                      setSelectedId(lead.id)
                    }
                    className={`w-full p-5 text-left transition hover:bg-muted/50 ${
                      selectedId === lead.id
                        ? "bg-brand/5"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          lead.viewed_at
                            ? "bg-slate-300"
                            : "bg-brand"
                        }`}
                        title={
                          lead.viewed_at
                            ? "Megtekintve"
                            : "Új, még nem megtekintett"
                        }
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-bold">
                            {lead.name}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              STATUS_STYLES[lead.status]
                            }`}
                          >
                            {STATUS_LABELS[lead.status]}
                          </span>

                          {lead.priority === "high" && (
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-800">
                              Magas prioritás
                            </span>
                          )}
                        </div>

                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {lead.email}
                          {lead.company
                            ? ` • ${lead.company}`
                            : ""}
                        </p>

                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {lead.message}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            {lead.service_type}
                          </span>

                          <span>
                            {lead.budget_range}
                          </span>

                          <span>
                            {formatDate(lead.created_at)}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <aside className="h-fit rounded-2xl border bg-background shadow-sm xl:sticky xl:top-6">
            {!selectedLead ? (
              <div className="p-10 text-center">
                <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/30" />

                <h2 className="mt-4 font-bold">
                  Válassz ki egy leadet
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  A részletes adatok, státuszok és
                  jegyzetek itt jelennek meg.
                </p>
              </div>
            ) : (
              <LeadDetail
                lead={selectedLead}
                notes={notes}
                noteText={noteText}
                detailLoading={detailLoading}
                saving={saving}
                addingNote={addingNote}
                onNoteTextChange={setNoteText}
                onStatusChange={(status) =>
                  void updateLead(
                    selectedLead.id,
                    { status },
                    "A lead státusza frissítve.",
                  )
                }
                onPriorityChange={(priority) =>
                  void updateLead(
                    selectedLead.id,
                    { priority },
                    "A lead prioritása frissítve.",
                  )
                }
                onAddNote={addNote}
                onDeleteNote={(note) =>
                  void deleteNote(note)
                }
                onDeleteLead={() =>
                  void deleteLead(selectedLead)
                }
              />
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  icon: typeof Archive;
};

function StatCard({
  label,
  value,
  icon: Icon,
}: StatCardProps) {
  return (
    <article className="rounded-2xl border bg-background p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold">
            {value}
          </p>
        </div>

        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}

type LeadDetailProps = {
  lead: ContactLead;
  notes: LeadNote[];
  noteText: string;
  detailLoading: boolean;
  saving: boolean;
  addingNote: boolean;
  onNoteTextChange: (value: string) => void;
  onStatusChange: (status: LeadStatus) => void;
  onPriorityChange: (
    priority: LeadPriority,
  ) => void;
  onAddNote: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
  onDeleteNote: (note: LeadNote) => void;
  onDeleteLead: () => void;
};

function LeadDetail({
  lead,
  notes,
  noteText,
  detailLoading,
  saving,
  addingNote,
  onNoteTextChange,
  onStatusChange,
  onPriorityChange,
  onAddNote,
  onDeleteNote,
  onDeleteLead,
}: LeadDetailProps) {
  return (
    <div>
      <div className="border-b p-5">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
            <UserRound className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <h2 className="text-xl font-bold">
              {lead.name}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Beérkezett: {formatDate(lead.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Státusz
            </label>

            <select
              value={lead.status}
              disabled={saving}
              onChange={(event) =>
                onStatusChange(
                  event.target.value as LeadStatus,
                )
              }
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand"
            >
              {STATUS_OPTIONS.map((status) => (
                <option
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Prioritás
            </label>

            <select
              value={lead.priority}
              disabled={saving}
              onChange={(event) =>
                onPriorityChange(
                  event.target.value as LeadPriority,
                )
              }
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand"
            >
              {PRIORITY_OPTIONS.map((priority) => (
                <option
                  key={priority.value}
                  value={priority.value}
                >
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <DetailLink
            icon={Mail}
            label="E-mail"
            value={lead.email}
            href={`mailto:${lead.email}`}
          />

          {lead.phone && (
            <DetailLink
              icon={Phone}
              label="Telefon"
              value={lead.phone}
              href={`tel:${lead.phone.replace(/\s/g, "")}`}
            />
          )}

          {lead.company && (
            <DetailLink
              icon={UserRound}
              label="Vállalkozás"
              value={lead.company}
            />
          )}

          <DetailLink
            icon={CircleDollarSign}
            label="Igény"
            value={`${lead.service_type} • ${lead.budget_range}`}
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Üzenet
          </p>

          <p className="mt-3 whitespace-pre-line rounded-xl border bg-muted/30 p-4 text-sm leading-6">
            {lead.message}
          </p>
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <MetaItem
            label="Marketing"
            value={
              lead.marketing_consent
                ? "Hozzájárult"
                : "Nem járult hozzá"
            }
          />

          <MetaItem
            label="Adatkezelési verzió"
            value={lead.privacy_policy_version}
          />

          <MetaItem
            label="Forrásoldal"
            value={lead.source_page || "—"}
          />

          <MetaItem
            label="UTM kampány"
            value={
              [
                lead.utm_source,
                lead.utm_medium,
                lead.utm_campaign,
              ]
                .filter(Boolean)
                .join(" / ") || "—"
            }
          />
        </div>

        <section>
          <div className="mb-3">
            <h3 className="font-bold">
              Belső jegyzetek
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Ezek a jegyzetek csak az adminfelületen
              láthatók.
            </p>
          </div>

          <form
            onSubmit={onAddNote}
            className="space-y-3"
          >
            <textarea
              rows={4}
              value={noteText}
              onChange={(event) =>
                onNoteTextChange(event.target.value)
              }
              placeholder="Például: Telefonon egyeztettünk, kedden küldöm az ajánlatot."
              className="w-full resize-y rounded-xl border bg-background px-4 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-brand"
            />

            <button
              type="submit"
              disabled={addingNote}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />

              {addingNote
                ? "Mentés..."
                : "Jegyzet hozzáadása"}
            </button>
          </form>

          {detailLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Jegyzetek betöltése...
            </p>
          ) : notes.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              Ehhez a leadhez még nincs belső jegyzet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {notes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-xl border p-4"
                >
                  <p className="whitespace-pre-line text-sm leading-6">
                    {note.note}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <time className="text-xs text-muted-foreground">
                      {formatDate(note.created_at)}
                    </time>

                    <button
                      type="button"
                      onClick={() =>
                        onDeleteNote(note)
                      }
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Törlés
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="border-t pt-5">
          <button
            type="button"
            disabled={saving}
            onClick={onDeleteLead}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Lead végleges törlése
          </button>
        </div>
      </div>
    </div>
  );
}

type DetailLinkProps = {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
};

function DetailLink({
  icon: Icon,
  label,
  value,
  href,
}: DetailLinkProps) {
  const content = (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0">
        <span className="block text-xs text-muted-foreground">
          {label}
        </span>

        <span className="mt-0.5 block truncate text-sm font-semibold">
          {value}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex items-center gap-3 rounded-xl border p-3 transition hover:bg-muted/40"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border p-3">
      {content}
    </div>
  );
}

function MetaItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium">
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
