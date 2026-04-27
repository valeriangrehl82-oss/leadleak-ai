import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { formatChf } from "@/lib/audit";
import { ADMIN_COOKIE_NAME, hasValidAdminSession } from "@/lib/adminAuth";
import { getLeadStatusLabel, isLeadStatus, leadStatuses } from "@/lib/leadStatus";
import { createServiceRoleClient, isSupabaseConfigError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ClientDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; error?: string; start?: string; end?: string }>;
};

type ClientRow = {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  industry: string;
  contact_person: string | null;
  notification_email: string;
  phone: string | null;
  twilio_phone_number: string | null;
  average_order_value_chf: number | null;
  recovery_message: string | null;
  is_active: boolean | null;
};

type ClientLeadRow = {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
  request_type: string | null;
  status: string | null;
  estimated_value_chf: number | null;
  source: string | null;
  message: string | null;
};

type ClientMessageRow = {
  id: string;
  created_at: string;
  direction: string;
  channel: string;
  from_number: string | null;
  to_number: string | null;
  body: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

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

function getQuickRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

  return {
    start: formatDateInputValue(start),
    end: formatDateInputValue(end),
  };
}

function buildRangeHref(clientId: string, start?: string, end?: string) {
  const params = new URLSearchParams();
  if (start) {
    params.set("start", start);
  }
  if (end) {
    params.set("end", end);
  }

  const query = params.toString();
  return `/admin/clients/${clientId}${query ? `?${query}` : ""}`;
}

function buildCsvHref(clientId: string, start: string, end: string) {
  const params = new URLSearchParams();
  if (start) {
    params.set("start", start);
  }
  if (end) {
    params.set("end", end);
  }

  const query = params.toString();
  return `/api/admin/clients/${clientId}/leads.csv${query ? `?${query}` : ""}`;
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

  const clientId = String(formData.get("client_id") || "").trim();
  const leadId = String(formData.get("lead_id") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const start = readDateParam(String(formData.get("start") || ""));
  const end = readDateParam(String(formData.get("end") || ""));

  if (!clientId || !leadId || !isLeadStatus(status)) {
    redirect(`/admin/clients/${clientId || ""}?error=status`);
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("client_leads")
    .update({ status })
    .eq("id", leadId)
    .eq("client_id", clientId);

  if (error) {
    console.error("Lead status update failed:", error);
    redirect(`/admin/clients/${clientId}?error=status`);
  }

  const params = new URLSearchParams({ updated: "lead" });
  if (start) {
    params.set("start", start);
  }
  if (end) {
    params.set("end", end);
  }

  redirect(`/admin/clients/${clientId}?${params.toString()}`);
}

async function loadClientDetail(id: string, range: { start: string; end: string }) {
  try {
    const supabase = createServiceRoleClient();
    let leadsQuery = supabase
      .from("client_leads")
      .select("id, created_at, customer_name, customer_phone, request_type, status, estimated_value_chf, source, message")
      .eq("client_id", id);

    if (range.start) {
      leadsQuery = leadsQuery.gte("created_at", startOfDayIso(range.start));
    }

    if (range.end) {
      leadsQuery = leadsQuery.lte("created_at", endOfDayIso(range.end));
    }

    const [
      { data: client, error: clientError },
      { data: leads, error: leadsError },
      { data: messages, error: messagesError },
    ] = await Promise.all([
      supabase
        .from("clients")
        .select(
          "id, created_at, name, slug, industry, contact_person, notification_email, phone, twilio_phone_number, average_order_value_chf, recovery_message, is_active",
        )
        .eq("id", id)
        .maybeSingle<ClientRow>(),
      leadsQuery.order("created_at", { ascending: false }),
      supabase
        .from("client_messages")
        .select("id, created_at, direction, channel, from_number, to_number, body")
        .eq("client_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (clientError || !client) {
      return { client: null, leads: [], messages: [], error: "Kunde wurde nicht gefunden." };
    }

    if (leadsError) {
      return { client, leads: [], messages: [], error: "Leads konnten nicht geladen werden." };
    }

    if (messagesError) {
      return {
        client,
        leads: (leads || []) as ClientLeadRow[],
        messages: [],
        error: "Nachrichten konnten nicht geladen werden.",
      };
    }

    return {
      client,
      leads: (leads || []) as ClientLeadRow[],
      messages: (messages || []) as ClientMessageRow[],
      error: "",
    };
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return { client: null, leads: [], messages: [], error: error.message };
    }

    return { client: null, leads: [], messages: [], error: "Supabase ist noch nicht konfiguriert." };
  }
}

function getLeadStats(leads: ClientLeadRow[]) {
  const totalValue = leads.reduce((sum, lead) => sum + (lead.estimated_value_chf || 0), 0);
  const countByStatus = (status: string) =>
    leads.filter((lead) => (lead.status || "new") === status).length;
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
    won: countByStatus("won"),
    lost: countByStatus("lost"),
    open: leads.filter((lead) => !["won", "lost"].includes(lead.status || "new")).length,
    totalValue,
    commonRequestTypes: commonRequestTypes || "-",
  };
}

export default async function ClientDetailPage({ params, searchParams }: ClientDetailPageProps) {
  await requireAdminSession();
  const { id } = await params;
  const urlParams = await searchParams;
  const start = readDateParam(urlParams.start);
  const end = readDateParam(urlParams.end);
  const { client, leads, messages, error } = await loadClientDetail(id, { start, end });

  if (!client) {
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

  const publicLink = `/p/${client.slug}`;
  const csvHref = buildCsvHref(client.id, start, end);
  const stats = getLeadStats(leads);
  const quick7 = getQuickRange(7);
  const quick14 = getQuickRange(14);
  const quick30 = getQuickRange(30);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-swiss-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href="/admin/clients" className="text-sm font-semibold text-swiss-green">
            Zurück zu Kunden
          </Link>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">{client.name}</h1>
              <p className="mt-3 text-slate-600">Öffentlicher Pilot-Link: {publicLink}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/admin/clients/${client.id}/edit`}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy-950 shadow-sm transition hover:bg-slate-50"
              >
                Kunde bearbeiten
              </Link>
              <Link
                href={publicLink}
                target="_blank"
                className="rounded-md border border-swiss-green bg-white px-4 py-2 text-sm font-semibold text-swiss-green shadow-sm transition hover:bg-swiss-mint"
              >
                Öffentlichen Pilot-Link öffnen
              </Link>
              <Link
                href={csvHref}
                className="rounded-md bg-swiss-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                CSV exportieren
              </Link>
            </div>
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
            Änderung konnte nicht gespeichert werden.
          </div>
        ) : null}

        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <form className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]" method="get">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-navy-950">Startdatum</span>
                <input
                  name="start"
                  type="date"
                  defaultValue={start}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none ring-swiss-green focus:border-swiss-green focus:ring-2"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-navy-950">Enddatum</span>
                <input
                  name="end"
                  type="date"
                  defaultValue={end}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none ring-swiss-green focus:border-swiss-green focus:ring-2"
                />
              </label>
              <button
                type="submit"
                className="rounded-md bg-navy-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 sm:self-end"
              >
                Zeitraum anwenden
              </button>
            </form>
            <div className="flex flex-wrap gap-2">
              {[
                ["Letzte 7 Tage", buildRangeHref(client.id, quick7.start, quick7.end)],
                ["Letzte 14 Tage", buildRangeHref(client.id, quick14.start, quick14.end)],
                ["Letzte 30 Tage", buildRangeHref(client.id, quick30.start, quick30.end)],
                ["Alle", buildRangeHref(client.id)],
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
          <p className="mt-3 text-sm text-slate-500">
            Ohne ausgewählten Zeitraum werden alle Leads angezeigt.
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {[
            ["Anzahl Leads", String(stats.total)],
            ["Neue Leads", String(stats.new)],
            ["Kontaktierte Leads", String(stats.contacted)],
            ["Gewonnene Leads", String(stats.won)],
            ["Verlorene Leads", String(stats.lost)],
            ["Geschätztes Gesamtpotenzial", formatChf(stats.totalValue)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(7,17,31,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold text-navy-950">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
            <h2 className="text-xl font-semibold text-navy-950">Kundendetails</h2>
            <dl className="mt-5 space-y-3 text-sm">
              {[
                ["Slug", client.slug],
                ["Branche", client.industry],
                ["Kontaktperson", client.contact_person || "-"],
                ["Benachrichtigung", client.notification_email],
                ["Telefon", client.phone || "-"],
                ["Twilio-Nummer", client.twilio_phone_number || "-"],
                ["Auftragswert", formatChf(client.average_order_value_chf || 250)],
                ["Aktiv", client.is_active ? "Ja" : "Nein"],
                ["Erstellt", formatDate(client.created_at)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                  <dt className="font-semibold text-slate-500">{label}</dt>
                  <dd className="text-right text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
            {client.recovery_message ? (
              <div className="mt-5 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {client.recovery_message}
              </div>
            ) : null}
          </aside>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
            <div className="border-b border-swiss-line px-5 py-4">
              <h2 className="text-xl font-semibold text-navy-950">Leads</h2>
            </div>
            {error ? <div className="m-5 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</div> : null}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Kunde</th>
                    <th className="px-5 py-3">Telefon</th>
                    <th className="px-5 py-3">Anfrageart</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Quelle</th>
                    <th className="px-5 py-3">Wert</th>
                    <th className="px-5 py-3">Erstellt</th>
                    <th className="px-5 py-3">Nachricht</th>
                    <th className="px-5 py-3">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.length ? (
                    leads.map((lead) => (
                      <tr key={lead.id} className="transition hover:bg-slate-50">
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-navy-950">
                          {lead.customer_name || "-"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-700">{lead.customer_phone || "-"}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-700">{lead.request_type || "-"}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                          <form action={updateLeadStatusAction} className="flex min-w-44 gap-2">
                            <input type="hidden" name="client_id" value={client.id} />
                            <input type="hidden" name="lead_id" value={lead.id} />
                            <input type="hidden" name="start" value={start} />
                            <input type="hidden" name="end" value={end} />
                            <select
                              name="status"
                              defaultValue={lead.status || "new"}
                              className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm outline-none ring-swiss-green focus:border-swiss-green focus:ring-2"
                            >
                              {leadStatuses.map((status) => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="rounded-md bg-navy-950 px-3 py-2 text-sm font-semibold text-white hover:bg-navy-800"
                            >
                              OK
                            </button>
                          </form>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-700">{lead.source || "-"}</td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-navy-950">
                          {lead.estimated_value_chf ? formatChf(lead.estimated_value_chf) : "-"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(lead.created_at)}</td>
                        <td className="min-w-64 px-5 py-4 text-slate-700">{lead.message || "-"}</td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-swiss-green">
                            Öffnen
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-5 py-8 text-center text-slate-600" colSpan={9}>
                        Noch keine Leads vorhanden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
          <h2 className="text-xl font-semibold text-navy-950">Pilot-Auswertung</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Leads im Zeitraum", String(stats.total)],
              ["Geschätztes Gesamtpotenzial", formatChf(stats.totalValue)],
              ["Häufigste Anfragearten", stats.commonRequestTypes],
              ["Gewonnene Leads", String(stats.won)],
              ["Verlorene Leads", String(stats.lost)],
              ["Offene Leads", String(stats.open)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 font-semibold text-navy-950">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            Diese Auswertung dient als Grundlage für den 14-Tage-Pilot und ersetzt keine Umsatzgarantie.
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
          <div className="border-b border-swiss-line px-5 py-4">
            <h2 className="text-xl font-semibold text-navy-950">Nachrichten</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Erstellt</th>
                  <th className="px-5 py-3">Richtung</th>
                  <th className="px-5 py-3">Kanal</th>
                  <th className="px-5 py-3">Von</th>
                  <th className="px-5 py-3">An</th>
                  <th className="px-5 py-3">Nachricht</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {messages.length ? (
                  messages.map((message) => (
                    <tr key={message.id} className="transition hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(message.created_at)}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">{message.direction}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">{message.channel}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">{message.from_number || "-"}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">{message.to_number || "-"}</td>
                      <td className="min-w-72 px-5 py-4 text-slate-700">{message.body || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-600" colSpan={6}>
                      Noch keine Nachrichten vorhanden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
