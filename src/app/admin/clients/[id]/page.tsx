import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { formatChf } from "@/lib/audit";
import { ADMIN_COOKIE_NAME, hasValidAdminSession } from "@/lib/adminAuth";
import { createServiceRoleClient, isSupabaseConfigError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ClientDetailPageProps = {
  params: Promise<{ id: string }>;
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

async function requireAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!hasValidAdminSession(session)) {
    redirect("/admin/login");
  }
}

async function loadClientDetail(id: string) {
  try {
    const supabase = createServiceRoleClient();
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
      supabase
        .from("client_leads")
        .select("id, created_at, customer_name, customer_phone, request_type, status, estimated_value_chf, source, message")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
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
      return { client, leads: (leads || []) as ClientLeadRow[], messages: [], error: "Nachrichten konnten nicht geladen werden." };
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

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  await requireAdminSession();
  const { id } = await params;
  const { client, leads, messages, error } = await loadClientDetail(id);

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

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-swiss-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link href="/admin/clients" className="text-sm font-semibold text-swiss-green">
            Zurück zu Kunden
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">{client.name}</h1>
          <p className="mt-3 text-slate-600">Öffentlicher Pilot-Link: {publicLink}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="rounded-lg border border-swiss-line bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-navy-950">Kundendetails</h2>
            <dl className="mt-5 space-y-3 text-sm">
              {[
                ["Slug", client.slug],
                ["Branche", client.industry],
                ["Kontaktperson", client.contact_person || "-"],
                ["Notification E-Mail", client.notification_email],
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

          <div className="overflow-hidden rounded-lg border border-swiss-line bg-white shadow-soft">
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
                    <th className="px-5 py-3">Source</th>
                    <th className="px-5 py-3">Wert</th>
                    <th className="px-5 py-3">Erstellt</th>
                    <th className="px-5 py-3">Nachricht</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.length ? (
                    leads.map((lead) => (
                      <tr key={lead.id}>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-navy-950">
                          {lead.customer_name || "-"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-700">{lead.customer_phone || "-"}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-700">{lead.request_type || "-"}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-700">{lead.status || "new"}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-700">{lead.source || "-"}</td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-navy-950">
                          {lead.estimated_value_chf ? formatChf(lead.estimated_value_chf) : "-"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(lead.created_at)}</td>
                        <td className="min-w-64 px-5 py-4 text-slate-700">{lead.message || "-"}</td>
                      </tr>
                    ))
                  ) : (
                  <tr>
                      <td className="px-5 py-8 text-center text-slate-600" colSpan={8}>
                        Noch keine Leads vorhanden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-swiss-line bg-white shadow-soft">
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
                    <tr key={message.id}>
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
