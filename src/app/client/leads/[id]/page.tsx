import Link from "next/link";
import { redirect } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { LeadActivityTimeline } from "@/components/LeadActivityTimeline";
import { LeadDnaBars, LeadDnaCore, LeadDnaPrivacyNote } from "@/components/LeadDnaVisual";
import { formatChf } from "@/lib/audit";
import { isClientPortalConfigError } from "@/lib/clientSession";
import { requireClientPortalClient, type ClientPortalClient } from "@/lib/clientPortalAuth";
import {
  getLeadActivitiesForLead,
  logClientNoteUpdate,
  logFollowUpUpdate,
  logNextActionUpdate,
  logStatusChange,
  type LeadActivityRow,
} from "@/lib/leadActivities";
import { getLeadDnaProfile } from "@/lib/leadDna";
import { getLeadStatusLabel, isLeadStatus, leadStatuses } from "@/lib/leadStatus";
import { analyzeRecoveryBrain } from "@/lib/recoveryBrain";
import { isSupabaseConfigError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ClientLeadDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
};

type ClientLeadDetailRow = {
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
  client_note: string | null;
  next_action: string | null;
  next_follow_up_at: string | null;
  client_last_updated_at: string | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toDateTimeLocalValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function nullableDateTime(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function getStatusTone(status: string | null | undefined) {
  const value = status || "new";
  const tones: Record<string, string> = {
    new: "border-blue-200 bg-blue-50 text-blue-800",
    contacted: "border-cyan-200 bg-cyan-50 text-cyan-800",
    qualified: "border-emerald-200 bg-emerald-50 text-emerald-800",
    won: "border-emerald-300 bg-emerald-100 text-emerald-900",
    lost: "border-slate-200 bg-slate-100 text-slate-700",
  };

  return tones[value] || tones.new;
}

async function updateLeadStatusAction(formData: FormData) {
  "use server";

  const leadId = String(formData.get("lead_id") || "").trim();
  const status = String(formData.get("status") || "").trim();

  if (!leadId || !isLeadStatus(status)) {
    redirect(`/client/leads/${leadId || ""}?error=status`);
  }

  const { client, supabase } = await requireClientPortalClient();
  const { data: existingLead, error: existingLeadError } = await supabase
    .from("client_leads")
    .select("id, client_id, status")
    .eq("id", leadId)
    .eq("client_id", client.id)
    .maybeSingle<{ id: string; client_id: string; status: string | null }>();

  if (existingLeadError || !existingLead) {
    console.error("Client lead status lookup failed:", existingLeadError);
    redirect(`/client/leads/${leadId}?error=status`);
  }

  const { data, error } = await supabase
    .from("client_leads")
    .update({ status, client_last_updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .eq("client_id", client.id)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error || !data) {
    console.error("Client lead status update failed:", error);
    redirect(`/client/leads/${leadId}?error=status`);
  }

  await logStatusChange({
    supabase,
    leadId,
    clientId: client.id,
    oldStatus: existingLead.status,
    newStatus: status,
    actorType: "client",
    actorLabel: client.name,
  });

  redirect(`/client/leads/${leadId}?updated=status`);
}

async function updateLeadNoteAction(formData: FormData) {
  "use server";

  const leadId = String(formData.get("lead_id") || "").trim();

  if (!leadId) {
    redirect("/client/dashboard");
  }

  const { client, supabase } = await requireClientPortalClient();
  const nextClientNote = String(formData.get("client_note") || "").trim() || null;
  const nextAction = String(formData.get("next_action") || "").trim() || null;
  const nextFollowUpAt = nullableDateTime(formData.get("next_follow_up_at"));

  const { data: existingLead, error: existingLeadError } = await supabase
    .from("client_leads")
    .select("id, client_id, client_note, next_action, next_follow_up_at")
    .eq("id", leadId)
    .eq("client_id", client.id)
    .maybeSingle<{
      id: string;
      client_id: string;
      client_note: string | null;
      next_action: string | null;
      next_follow_up_at: string | null;
    }>();

  if (existingLeadError || !existingLead) {
    console.error("Client lead note lookup failed:", existingLeadError);
    redirect(`/client/leads/${leadId}?error=note`);
  }

  const { data, error } = await supabase
    .from("client_leads")
    .update({
      client_note: nextClientNote,
      next_action: nextAction,
      next_follow_up_at: nextFollowUpAt,
      client_last_updated_at: new Date().toISOString(),
    })
    .eq("id", leadId)
    .eq("client_id", client.id)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error || !data) {
    console.error("Client lead note update failed:", error);
    redirect(`/client/leads/${leadId}?error=note`);
  }

  await Promise.all([
    logClientNoteUpdate({
      supabase,
      leadId,
      clientId: client.id,
      oldValue: existingLead.client_note,
      newValue: nextClientNote,
      actorType: "client",
      actorLabel: client.name,
    }),
    logNextActionUpdate({
      supabase,
      leadId,
      clientId: client.id,
      oldValue: existingLead.next_action,
      newValue: nextAction,
      actorType: "client",
      actorLabel: client.name,
    }),
    logFollowUpUpdate({
      supabase,
      leadId,
      clientId: client.id,
      oldValue: existingLead.next_follow_up_at,
      newValue: nextFollowUpAt,
      actorType: "client",
      actorLabel: client.name,
    }),
  ]);

  redirect(`/client/leads/${leadId}?updated=note`);
}

async function loadLead(id: string) {
  const { client, supabase } = await requireClientPortalClient();
  const { data: lead, error } = await supabase
    .from("client_leads")
    .select(
      "id, created_at, client_id, customer_name, customer_phone, customer_email, request_type, message, status, estimated_value_chf, source, internal_summary, client_note, next_action, next_follow_up_at, client_last_updated_at",
    )
    .eq("id", id)
    .eq("client_id", client.id)
    .maybeSingle<ClientLeadDetailRow>();

  if (error || !lead) {
    return { client, lead: null, activities: [] as LeadActivityRow[], error: "Lead wurde nicht gefunden." };
  }

  const activities = await getLeadActivitiesForLead(lead.id, client.id, supabase);

  return { client, lead, activities, error: "" };
}

export default async function ClientLeadDetailPage({ params, searchParams }: ClientLeadDetailPageProps) {
  const { id } = await params;
  const urlParams = await searchParams;

  let data: {
    client: ClientPortalClient;
    lead: ClientLeadDetailRow | null;
    activities: LeadActivityRow[];
    error: string;
  };

  try {
    data = await loadLead(id);
  } catch (error) {
    if (isSupabaseConfigError(error) || isClientPortalConfigError(error)) {
      return (
        <main className="premium-page">
          <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-800">
              Kundenportal ist noch nicht konfiguriert.
            </div>
          </section>
        </main>
      );
    }

    throw error;
  }

  const { client, lead, activities, error } = data;

  if (!lead) {
    return (
      <main className="premium-page">
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href="/client/dashboard" className="text-sm font-semibold text-swiss-green">
            Zurück zum Cockpit
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
  const statusLabel = getLeadStatusLabel(lead.status);
  const estimatedValue = lead.estimated_value_chf ? formatChf(lead.estimated_value_chf) : "-";

  return (
    <main className="premium-page">
      <section className="premium-surface text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href="/client/dashboard" className="text-sm font-semibold text-emerald-200 hover:text-white">
            Zurück zum Cockpit
          </Link>
          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="premium-eyebrow-dark">Lead Detail</p>
              <h1 className="premium-title-dark mt-3 text-3xl sm:text-5xl">
                {lead.customer_name || "Unbekannter Kontakt"}
              </h1>
              <p className="premium-muted-dark mt-4">
                {lead.request_type || "Anfrage ohne Kategorie"} · {estimatedValue} · Erfasst {formatDate(lead.created_at)}
              </p>
            </div>
            <span className={`w-fit rounded-full border px-3 py-1 text-sm font-semibold ${getStatusTone(lead.status)}`}>
              {statusLabel}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {urlParams.updated ? (
          <div className="mb-6 rounded-md bg-swiss-mint p-4 text-sm font-semibold text-emerald-900">
            Änderung wurde gespeichert.
          </div>
        ) : null}
        {urlParams.error ? (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-800">
            Änderung konnte nicht gespeichert werden. Bitte Angaben prüfen.
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="grid gap-6 content-start">
            <section className="premium-card p-6">
              <h2 className="text-xl font-semibold text-navy-950">Lead Summary</h2>
              <dl className="mt-5 grid gap-3 text-sm">
                {[
                  ["Name", lead.customer_name || "-"],
                  ["Telefon", lead.customer_phone || "-"],
                  ["E-Mail", lead.customer_email || "-"],
                  ["Anfrageart", lead.request_type || "-"],
                  ["Nachricht", lead.message || "-"],
                  ["Geschätzter Wert", estimatedValue],
                  ["Quelle", lead.source || "-"],
                  ["Erfasst am", formatDate(lead.created_at)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                    <dd className="mt-2 whitespace-pre-wrap font-semibold leading-6 text-navy-950">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="premium-card p-6">
              <h2 className="text-xl font-semibold text-navy-950">Quick Actions</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {lead.customer_phone ? (
                  <a href={`tel:${lead.customer_phone}`} className="premium-button-primary px-4 py-2 text-sm">
                    Jetzt anrufen
                  </a>
                ) : null}
                {[
                  ["contacted", "Als kontaktiert markieren"],
                  ["qualified", "Als qualifiziert markieren"],
                  ["won", "Als gewonnen markieren"],
                  ["lost", "Als verloren markieren"],
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

            <section className="premium-card p-6">
              <h2 className="text-xl font-semibold text-navy-950">Activity / Follow-up Context</h2>
              <div className="mt-5 grid gap-3 text-sm">
                {[
                  ["Erfasst", formatDate(lead.created_at)],
                  ["Aktueller Status", statusLabel],
                  ["Nächstes Follow-up", formatDate(lead.next_follow_up_at)],
                  ["Zuletzt durch Betrieb aktualisiert", formatDate(lead.client_last_updated_at)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-2 font-semibold text-navy-950">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <LeadActivityTimeline activities={activities} />
          </div>

          <div className="grid gap-6 content-start">
            <section className="premium-card p-6">
              <h2 className="text-xl font-semibold text-navy-950">Status Update</h2>
              <form action={updateLeadStatusAction} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input type="hidden" name="lead_id" value={lead.id} />
                <select name="status" defaultValue={lead.status || "new"} className="premium-input sm:max-w-xs">
                  {leadStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <button type="submit" className="premium-button-primary px-4 py-3 text-sm">
                  Status speichern
                </button>
              </form>
            </section>

            <section className="premium-card p-6">
              <h2 className="text-xl font-semibold text-navy-950">Client Notes / Next Action</h2>
              <form action={updateLeadNoteAction} className="mt-5 grid gap-4">
                <input type="hidden" name="lead_id" value={lead.id} />
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-navy-950">Interne Notiz</span>
                  <textarea name="client_note" rows={4} defaultValue={lead.client_note || ""} className="premium-input" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-navy-950">Nächste Aktion</span>
                  <textarea name="next_action" rows={3} defaultValue={lead.next_action || ""} className="premium-input" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-navy-950">Follow-up Datum</span>
                  <input
                    name="next_follow_up_at"
                    type="datetime-local"
                    defaultValue={toDateTimeLocalValue(lead.next_follow_up_at)}
                    className="premium-input"
                  />
                </label>
                <button type="submit" className="premium-button-primary px-5 py-3 text-sm">
                  Notiz speichern
                </button>
              </form>
            </section>

            <section className="premium-card-dark p-6 text-white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">AI Recovery Brain</p>
                  <h2 className="mt-2 text-2xl font-semibold">Antwortvorschlag</h2>
                </div>
                <CopyButton
                  text={recoveryBrain.suggestedReply}
                  label="Antwort kopieren"
                  copiedLabel="Kopiert"
                  className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                />
              </div>
              <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-xs leading-5 text-slate-300">
                Vorschlag zur Unterstützung der Rückmeldung. Es werden keine Nachrichten automatisch versendet.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["Kategorie", recoveryBrain.category],
                  ["Dringlichkeit", recoveryBrain.urgencyLabel],
                  ["Terminbedarf", recoveryBrain.appointmentNeed ? "Ja" : "Nein"],
                  ["Empfohlene Aktion", recoveryBrain.recommendedAction],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">{label}</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Fehlende Angaben</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {recoveryBrain.missingInformation.length ? recoveryBrain.missingInformation.join(", ") : "Keine zentralen Angaben erkannt."}
                </p>
              </div>
              <div className="mt-5 rounded-lg border border-emerald-300/20 bg-emerald-400/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Antwortvorschlag</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-100">{recoveryBrain.suggestedReply}</p>
              </div>
            </section>

            <section className="premium-card-dark p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Lead DNA</p>
              <h2 className="mt-2 text-2xl font-semibold">Priorisierungshilfe</h2>
              <div className="mt-5">
                <LeadDnaPrivacyNote />
              </div>
              <div className="mt-5">
                <LeadDnaCore profile={leadDnaProfile} compact />
              </div>
              <div className="mt-5">
                <LeadDnaBars profile={leadDnaProfile} />
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
