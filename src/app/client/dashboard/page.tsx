import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { formatChf } from "@/lib/audit";
import { CLIENT_COOKIE_NAME, isClientPortalConfigError, readClientSessionValue } from "@/lib/clientSession";
import { getLeadStatusLabel } from "@/lib/leadStatus";
import { createServiceRoleClient, isSupabaseConfigError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ClientDashboardPageProps = {
  searchParams: Promise<{ start?: string; end?: string }>;
};

type ClientRow = {
  id: string;
  name: string;
  slug: string;
  portal_enabled: boolean | null;
};

type ClientLeadRow = {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  request_type: string | null;
  status: string | null;
  estimated_value_chf: number | null;
};

function readDateParam(value: string | undefined) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function startOfDayIso(value: string) {
  return `${value}T00:00:00.000Z`;
}

function endOfDayIso(value: string) {
  return `${value}T23:59:59.999Z`;
}

function formatDateInputValue(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getQuickRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

  return {
    start: formatDateInputValue(start),
    end: formatDateInputValue(end),
  };
}

function buildRangeHref(start?: string, end?: string) {
  const params = new URLSearchParams();
  if (start) {
    params.set("start", start);
  }
  if (end) {
    params.set("end", end);
  }

  const query = params.toString();
  return `/client/dashboard${query ? `?${query}` : ""}`;
}

function getStats(leads: ClientLeadRow[]) {
  const countByStatus = (status: string) => leads.filter((lead) => (lead.status || "new") === status).length;
  const totalValue = leads.reduce((sum, lead) => sum + (lead.estimated_value_chf || 0), 0);
  const requestTypeCounts = leads.reduce<Record<string, number>>((counts, lead) => {
    const requestType = lead.request_type?.trim();
    if (!requestType) {
      return counts;
    }
    counts[requestType] = (counts[requestType] || 0) + 1;
    return counts;
  }, {});
  const commonRequestTypes = Object.entries(requestTypeCounts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([requestType, count]) => `${requestType} (${count})`)
    .join(", ");

  return {
    total: leads.length,
    new: countByStatus("new"),
    contacted: countByStatus("contacted"),
    qualified: countByStatus("qualified"),
    won: countByStatus("won"),
    lost: countByStatus("lost"),
    open: leads.filter((lead) => !["won", "lost"].includes(lead.status || "new")).length,
    totalValue,
    commonRequestTypes: commonRequestTypes || "-",
  };
}

async function loadClientDashboard(start: string, end: string) {
  const cookieStore = await cookies();
  const session = readClientSessionValue(cookieStore.get(CLIENT_COOKIE_NAME)?.value);

  if (!session) {
    redirect("/client/login");
  }

  const supabase = createServiceRoleClient();
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, name, slug, portal_enabled")
    .eq("id", session.clientId)
    .maybeSingle<ClientRow>();

  if (clientError || !client || !client.portal_enabled) {
    redirect("/client/login");
  }

  let leadsQuery = supabase
    .from("client_leads")
    .select("id, created_at, customer_name, customer_phone, request_type, status, estimated_value_chf")
    .eq("client_id", client.id);

  if (start) {
    leadsQuery = leadsQuery.gte("created_at", startOfDayIso(start));
  }

  if (end) {
    leadsQuery = leadsQuery.lte("created_at", endOfDayIso(end));
  }

  const { data: leads, error: leadsError } = await leadsQuery.order("created_at", { ascending: false });

  if (leadsError) {
    return { client, leads: [] as ClientLeadRow[], error: "Leads konnten nicht geladen werden." };
  }

  return { client, leads: (leads || []) as ClientLeadRow[], error: "" };
}

export default async function ClientDashboardPage({ searchParams }: ClientDashboardPageProps) {
  const params = await searchParams;
  const start = readDateParam(params.start);
  const end = readDateParam(params.end);

  let data: Awaited<ReturnType<typeof loadClientDashboard>>;

  try {
    data = await loadClientDashboard(start, end);
  } catch (error) {
    if (isSupabaseConfigError(error) || isClientPortalConfigError(error)) {
      return (
        <main className="min-h-screen bg-slate-50">
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

  const { client, leads, error } = data;
  const stats = getStats(leads);
  const quick7 = getQuickRange(7);
  const quick14 = getQuickRange(14);
  const quick30 = getQuickRange(30);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-swiss-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Kundenportal</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">{client.name}</h1>
              <p className="mt-3 text-slate-600">Pilot-Link: /p/{client.slug}</p>
            </div>
            <form action="/api/client/logout" method="post">
              <button
                type="submit"
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy-950 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Zeitraum</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["Letzte 7 Tage", buildRangeHref(quick7.start, quick7.end)],
              ["Letzte 14 Tage", buildRangeHref(quick14.start, quick14.end)],
              ["Letzte 30 Tage", buildRangeHref(quick30.start, quick30.end)],
              ["Alle", buildRangeHref()],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
          {[
            ["Total Leads", String(stats.total)],
            ["Neue Leads", String(stats.new)],
            ["Kontaktiert", String(stats.contacted)],
            ["Qualifiziert", String(stats.qualified)],
            ["Gewonnen", String(stats.won)],
            ["Verloren", String(stats.lost)],
            ["Potenzial", formatChf(stats.totalValue)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(7,17,31,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold text-navy-950">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
          <div className="border-b border-swiss-line px-5 py-4">
            <h2 className="text-xl font-semibold text-navy-950">Leads</h2>
          </div>
          {error ? <div className="m-5 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</div> : null}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Erstellt</th>
                  <th className="px-5 py-3">Kunde</th>
                  <th className="px-5 py-3">Telefon</th>
                  <th className="px-5 py-3">Anfrageart</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Wert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.length ? (
                  leads.map((lead) => (
                    <tr key={lead.id} className="transition hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(lead.created_at)}</td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-navy-950">{lead.customer_name || "-"}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">{lead.customer_phone || "-"}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">{lead.request_type || "-"}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">{getLeadStatusLabel(lead.status)}</td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-navy-950">
                        {lead.estimated_value_chf ? formatChf(lead.estimated_value_chf) : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-600" colSpan={6}>
                      Noch keine Leads im gewählten Zeitraum vorhanden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
          <h2 className="text-xl font-semibold text-navy-950">Pilot-Auswertung</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Total Leads", String(stats.total)],
              ["Geschätzter Gesamtwert", formatChf(stats.totalValue)],
              ["Häufigste Anfragearten", stats.commonRequestTypes],
              ["Gewonnene Leads", String(stats.won)],
              ["Verlorene Leads", String(stats.lost)],
              ["Offene Leads", String(stats.open)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 font-semibold text-navy-950">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            Diese Auswertung dient als Grundlage für den Pilot und ist keine Umsatzgarantie.
          </p>
        </div>
      </section>
    </main>
  );
}
