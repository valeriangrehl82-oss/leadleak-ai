import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LeadDnaBars, LeadDnaCore, LeadDnaPrivacyNote } from "@/components/LeadDnaVisual";
import { formatChf } from "@/lib/audit";
import { ADMIN_COOKIE_NAME, hasValidAdminSession } from "@/lib/adminAuth";
import { getLeadDnaProfile } from "@/lib/leadDna";
import { getLeadStatusLabel, isLeadStatus, leadStatuses } from "@/lib/leadStatus";
import { analyzeRecoveryBrain } from "@/lib/recoveryBrain";
import { createServiceRoleClient, isSupabaseConfigError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type LeadDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
};

type LeadRow = {
  id: string;
  created_at: string;
  client_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  request_type: string | null;
  message: string | null;
  status: string | null;
  estimated_value_chf: number | null;
  source: string | null;
  internal_summary: string | null;
};

type ClientRow = {
  id: string;
  name: string;
  slug: string;
  recovery_message: string | null;
  booking_url: string | null;
  booking_enabled: boolean | null;
  recovery_mode: string | null;
  auto_reply_enabled: boolean | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusBadgeClass(status: string | null | undefined) {
  const value = status || "new";
  const classes: Record<string, string> = {
    new: "border-blue-200 bg-blue-50 text-blue-800",
    contacted: "border-cyan-200 bg-cyan-50 text-cyan-800",
    qualified: "border-emerald-200 bg-emerald-50 text-emerald-800",
    won: "border-emerald-300 bg-emerald-100 text-emerald-900",
    lost: "border-slate-200 bg-slate-100 text-slate-700",
  };

  return classes[value] || classes.new;
}

function DetailGroup({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <section className="premium-card p-6">
      <h2 className="text-lg font-semibold text-navy-950">{title}</h2>
      <dl className="mt-5 grid gap-3 text-sm">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-2 whitespace-pre-wrap font-semibold leading-6 text-navy-950">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

async function requireAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!hasValidAdminSession(session)) {
    redirect("/admin/login");
  }
}

async function updateLeadStatusAction(formData: FormData) {
  "use server";

  await requireAdminSession();

  const leadId = String(formData.get("lead_id") || "").trim();
  const status = String(formData.get("status") || "").trim();

  if (!leadId || !isLeadStatus(status)) {
    redirect(`/admin/leads/${leadId || ""}?error=status`);
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("client_leads").update({ status }).eq("id", leadId);

  if (error) {
    console.error("Lead status update failed:", error);
    redirect(`/admin/leads/${leadId}?error=status`);
  }

  redirect(`/admin/leads/${leadId}?updated=1`);
}

async function loadLeadDetail(id: string) {
  try {
    const supabase = createServiceRoleClient();
    const { data: lead, error: leadError } = await supabase
      .from("client_leads")
      .select(
        "id, created_at, client_id, customer_name, customer_phone, customer_email, request_type, message, status, estimated_value_chf, source, internal_summary",
      )
      .eq("id", id)
      .maybeSingle<LeadRow>();

    if (leadError || !lead) {
      return { lead: null, client: null, error: "Lead wurde nicht gefunden." };
    }

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, slug, recovery_message, booking_url, booking_enabled, recovery_mode, auto_reply_enabled")
      .eq("id", lead.client_id)
      .maybeSingle<ClientRow>();

    if (clientError || !client) {
      return { lead, client: null, error: "Kunde zum Lead wurde nicht gefunden." };
    }

    return { lead, client, error: "" };
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return { lead: null, client: null, error: error.message };
    }

    return { lead: null, client: null, error: "Supabase ist noch nicht konfiguriert." };
  }
}

export default async function LeadDetailPage({ params, searchParams }: LeadDetailPageProps) {
  await requireAdminSession();
  const { id } = await params;
  const urlParams = await searchParams;
  const { lead, client, error } = await loadLeadDetail(id);

  if (!lead || !client) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href="/admin/clients" className="text-sm font-semibold text-swiss-green">
            Zurück zu Kunden
          </Link>
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">
            {error}
          </div>
        </section>
      </main>
    );
  }

  const leadDnaProfile = getLeadDnaProfile(lead);
  const recoveryBrain = analyzeRecoveryBrain(lead, client);
  const estimatedValue = lead.estimated_value_chf ? formatChf(lead.estimated_value_chf) : "-";
  const statusLabel = getLeadStatusLabel(lead.status);

  return (
    <main className="premium-page">
      <section className="premium-surface text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href={`/admin/clients/${client.id}`} className="text-sm font-semibold text-emerald-200 hover:text-white">
            Zurück zu {client.name}
          </Link>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="premium-eyebrow-dark">Lead Decision Desk</p>
              <h1 className="premium-title-dark mt-2 text-3xl sm:text-5xl">
                Lead: {lead.customer_name || "Unbekannter Kontakt"}
              </h1>
              <p className="premium-muted-dark mt-3">
                {lead.request_type || "Anfrage ohne Kategorie"} · {estimatedValue} · Erstellt {formatDate(lead.created_at)}
              </p>
            </div>
            <span className={`w-fit rounded-full border px-3 py-1 text-sm font-semibold ${statusBadgeClass(lead.status)}`}>
              Status: {statusLabel}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {urlParams.updated ? (
          <div className="mb-6 rounded-md bg-swiss-mint p-4 text-sm font-semibold text-emerald-900">
            Status wurde gespeichert.
          </div>
        ) : null}
        {urlParams.error ? (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-800">
            Status konnte nicht gespeichert werden.
          </div>
        ) : null}

        <section className="premium-card mb-6 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Workflow</p>
              <h2 className="mt-2 text-xl font-semibold text-navy-950">Lead-Status aktualisieren</h2>
              <p className="mt-2 text-sm text-slate-600">
                Aktueller Status:{" "}
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(lead.status)}`}>
                  {statusLabel}
                </span>
              </p>
            </div>
            <form action={updateLeadStatusAction} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input type="hidden" name="lead_id" value={lead.id} />
              <select
                name="status"
                defaultValue={lead.status || "new"}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-swiss-green focus:border-swiss-green focus:ring-2"
              >
                {leadStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="ui-lift rounded-md bg-swiss-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Speichern
              </button>
            </form>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              ["contacted", "Als kontaktiert markieren"],
              ["qualified", "Als qualifiziert markieren"],
              ["won", "Als gewonnen markieren"],
            ].map(([status, label]) => (
              <form key={status} action={updateLeadStatusAction}>
                <input type="hidden" name="lead_id" value={lead.id} />
                <input type="hidden" name="status" value={status} />
                <button
                  type="submit"
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-navy-950 transition hover:bg-slate-50"
                >
                  {label}
                </button>
              </form>
            ))}
          </div>
        </section>

        <section className="premium-card mb-6 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Assistant</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy-950">AI Recovery Brain</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Vorschlag zur Unterstützung der Rückmeldung. Keine automatisierte Entscheidung.
              </p>
            </div>
            <span className="w-fit rounded-full border border-emerald-200 bg-swiss-mint px-3 py-1 text-sm font-semibold text-emerald-800">
              {client.recovery_mode || "manual"}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["Kategorie", recoveryBrain.category],
              ["Dringlichkeit", recoveryBrain.urgencyLabel],
              ["Terminbedarf", recoveryBrain.appointmentNeed ? "Ja" : "Nein"],
              ["Booking-Link", recoveryBrain.shouldIncludeBookingLink ? "Einfügen" : "Nicht nötig"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 font-semibold text-navy-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-navy-950">Fehlende Angaben</p>
                {recoveryBrain.missingInformation.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recoveryBrain.missingInformation.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-600">Keine zentralen Pflichtangaben erkannt.</p>
                )}
              </div>

              <div className="rounded-lg border border-emerald-200 bg-swiss-mint p-4">
                <p className="text-sm font-semibold text-emerald-950">Empfohlene nächste Aktion</p>
                <p className="mt-2 text-sm leading-6 text-emerald-950">{recoveryBrain.recommendedAction}</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-navy-950">Begründung / Kurzlogik</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{recoveryBrain.reasoningSummary}</p>
              </div>
            </div>

            <div className="premium-card-dark p-5 text-white">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    Antwortvorschlag
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">Vorschlag für Rückmeldung</h3>
                </div>
                <CopyButton
                  text={recoveryBrain.suggestedReply}
                  label="Antwort kopieren"
                  copiedLabel="Kopiert"
                  className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                />
              </div>
              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-100">
                {recoveryBrain.suggestedReply}
              </p>
              {client.auto_reply_enabled ? (
                <p className="mt-4 rounded-md border border-amber-300/30 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
                  Auto-Antwort ist in den Kundeneinstellungen markiert, wird in dieser Version aber nicht automatisch
                  gesendet.
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="premium-card-dark mb-6 animate-fade-slide p-5 text-white">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Business Plus Funktion</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Lead DNA</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Regelbasierte Priorisierung nach Auftragswert, Dringlichkeit, Konkurrenzdruck, Nachfassbedarf und
                Anfragequalität.
              </p>
            </div>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-200">
              {leadDnaProfile.highlightBadge}
            </span>
          </div>
          <div className="mb-5">
            <LeadDnaPrivacyNote />
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <LeadDnaCore profile={leadDnaProfile} />
            <div className="grid gap-4">
              <LeadDnaBars profile={leadDnaProfile} />
              <div className="rounded-lg border border-emerald-300/25 bg-emerald-400/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Empfohlene Aktion</p>
                <p className="mt-2 text-2xl font-bold text-white">{leadDnaProfile.recommendedAction}</p>
                <p className="mt-3 text-sm leading-6 text-emerald-100">
                  Zeitnahe Rückmeldung empfohlen. Die Anfrage zeigt relevante Prioritätssignale und sollte aktiv
                  nachgefasst werden.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <DetailGroup
            title="Kontaktdaten"
            items={[
              ["Kunde", lead.customer_name || "-"],
              ["Telefon", lead.customer_phone || "-"],
              ["E-Mail", lead.customer_email || "-"],
            ]}
          />
          <DetailGroup
            title="Anfrage"
            items={[
              ["Anfrageart", lead.request_type || "-"],
              ["Nachricht", lead.message || "-"],
              ["Geschätzter Wert", estimatedValue],
            ]}
          />
          <DetailGroup
            title="System"
            items={[
              ["Status", statusLabel],
              ["Quelle", lead.source || "-"],
              ["Erstellt", formatDate(lead.created_at)],
              ["Interne Zusammenfassung", lead.internal_summary || "-"],
            ]}
          />
        </div>
      </section>
    </main>
  );
}
