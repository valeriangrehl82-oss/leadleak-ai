import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LeadDnaBars, LeadDnaCore } from "@/components/LeadDnaVisual";
import { formatChf } from "@/lib/audit";
import { ADMIN_COOKIE_NAME, hasValidAdminSession } from "@/lib/adminAuth";
import { getLeadDnaProfile } from "@/lib/leadDna";
import { getLeadStatusLabel, isLeadStatus, leadStatuses } from "@/lib/leadStatus";
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
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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
      .select("id, name, slug")
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

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-swiss-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href={`/admin/clients/${client.id}`} className="text-sm font-semibold text-swiss-green">
            Zurück zu {client.name}
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">Lead Detail</h1>
          <p className="mt-3 text-slate-600">{client.name}</p>
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

        <div className="mb-6 animate-fade-slide rounded-xl border border-navy-900 bg-navy-950 p-5 text-white shadow-[0_24px_80px_rgba(7,17,31,0.18)]">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Business Plus Funktion</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Lead DNA</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Regelbasierte Priorisierung nach Wert, Dringlichkeit, Rückmelde-Druck, Konkurrenzrisiko und
                Abschlusschance.
              </p>
            </div>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-200">
              {leadDnaProfile.highlightBadge}
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <LeadDnaCore profile={leadDnaProfile} />
            <div className="grid gap-4">
              <LeadDnaBars profile={leadDnaProfile} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Lead DNA Summary</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{leadDnaProfile.summary}</p>
                </div>
                <div className="rounded-lg border border-emerald-300/25 bg-emerald-400/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Empfohlene Aktion</p>
                  <p className="mt-2 text-xl font-bold text-white">{leadDnaProfile.recommendedAction}</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-100">
                    Empfehlung aus bestehenden Lead-Daten, ohne externe KI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Aktueller Status</p>
              <p className="mt-1 text-2xl font-bold text-navy-950">{getLeadStatusLabel(lead.status)}</p>
            </div>
            <form action={updateLeadStatusAction} className="flex gap-2">
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
                className="rounded-md bg-swiss-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Speichern
              </button>
            </form>
          </div>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            {[
              ["Kunde", client.name],
              ["Kontaktperson", lead.customer_name || "-"],
              ["Telefon", lead.customer_phone || "-"],
              ["E-Mail", lead.customer_email || "-"],
              ["Anfrageart", lead.request_type || "-"],
              ["Status", getLeadStatusLabel(lead.status)],
              ["Geschätzter Wert", lead.estimated_value_chf ? formatChf(lead.estimated_value_chf) : "-"],
              ["Quelle", lead.source || "-"],
              ["Erstellt", formatDate(lead.created_at)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-slate-100 bg-slate-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="mt-2 font-semibold text-navy-950">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 grid gap-5">
            <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Nachricht</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{lead.message || "-"}</p>
            </div>
            <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Interne Zusammenfassung</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {lead.internal_summary || "-"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
