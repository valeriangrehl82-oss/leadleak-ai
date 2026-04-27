import Link from "next/link";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { ADMIN_COOKIE_NAME, hasValidAdminSession } from "@/lib/adminAuth";
import { createServiceRoleClient, isSupabaseConfigError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AdminClientsPageProps = {
  searchParams: Promise<{ created?: string; error?: string }>;
};

type ClientRow = {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  industry: string;
  contact_person: string | null;
  notification_email: string;
  twilio_phone_number: string | null;
  portal_enabled: boolean | null;
  is_active: boolean | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getPublicPilotUrl(host: string | null, protocol: string | null, slug: string) {
  const resolvedHost = host || "localhost:3000";
  const resolvedProtocol = protocol || (resolvedHost.includes("localhost") ? "http" : "https");
  return `${resolvedProtocol}://${resolvedHost}/p/${slug}`;
}

function statusBadge(isActive: boolean | null | undefined) {
  return isActive
    ? "border-emerald-200 bg-swiss-mint text-emerald-800"
    : "border-slate-200 bg-slate-100 text-slate-600";
}

async function requireAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!hasValidAdminSession(session)) {
    redirect("/admin/login");
  }
}

async function createClientAction(formData: FormData) {
  "use server";

  await requireAdminSession();

  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase();
  const industry = String(formData.get("industry") || "").trim();
  const contactPerson = String(formData.get("contact_person") || "").trim();
  const notificationEmail = String(formData.get("notification_email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const twilioPhoneNumber = String(formData.get("twilio_phone_number") || "").trim();
  const averageOrderValueChf = Number(formData.get("average_order_value_chf") || 250);
  const recoveryMessage = String(formData.get("recovery_message") || "").trim();

  if (!name || !slug || !industry || !notificationEmail) {
    redirect("/admin/clients?error=missing");
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("clients").insert({
    name,
    slug,
    industry,
    contact_person: contactPerson || null,
    notification_email: notificationEmail,
    phone: phone || null,
    twilio_phone_number: twilioPhoneNumber || null,
    average_order_value_chf: Number.isFinite(averageOrderValueChf) ? averageOrderValueChf : 250,
    recovery_message: recoveryMessage || null,
    is_active: true,
  });

  if (error) {
    console.error("Client insert failed:", error);
    redirect("/admin/clients?error=insert");
  }

  redirect("/admin/clients?created=1");
}

async function loadClients() {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("clients")
      .select(
        "id, created_at, name, slug, industry, contact_person, notification_email, twilio_phone_number, portal_enabled, is_active",
      )
      .order("created_at", { ascending: false });

    if (error) {
      return { clients: [], error: "Kunden konnten nicht geladen werden." };
    }

    return { clients: (data || []) as ClientRow[], error: "" };
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return { clients: [], error: error.message };
    }

    return { clients: [], error: "Supabase ist noch nicht konfiguriert." };
  }
}

export default async function AdminClientsPage({ searchParams }: AdminClientsPageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const { clients, error } = await loadClients();
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto");
  const stats = {
    total: clients.length,
    active: clients.filter((client) => client.is_active).length,
    portal: clients.filter((client) => client.portal_enabled).length,
    twilio: clients.filter((client) => client.twilio_phone_number).length,
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-swiss-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Admin Cockpit</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">Kunden</h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Pilotkunden, Portale und öffentliche Erfassungslinks verwalten.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Kunden gesamt", String(stats.total)],
              ["Aktive Piloten", String(stats.active)],
              ["Portale aktiv", String(stats.portal)],
              ["Twilio vorbereitet", String(stats.twilio)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 text-2xl font-bold text-navy-950">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {params.created ? (
          <div className="mb-6 rounded-md bg-swiss-mint p-4 text-sm font-semibold text-emerald-900">
            Kunde wurde angelegt.
          </div>
        ) : null}
        {params.error ? (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-800">
            Kunde konnte nicht angelegt werden. Bitte Pflichtfelder und Slug prüfen.
          </div>
        ) : null}

        <details
          open={!clients.length || Boolean(params.error)}
          className="group rounded-xl border border-slate-200 bg-white shadow-[0_14px_40px_rgba(7,17,31,0.07)]"
        >
          <summary className="cursor-pointer list-none px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Setup</p>
                <h2 className="text-xl font-semibold text-navy-950">Neuen Kunden anlegen</h2>
              </div>
              <span className="rounded-md bg-navy-950 px-4 py-2 text-sm font-semibold text-white">
                <span className="group-open:hidden">Formular öffnen</span>
                <span className="hidden group-open:inline">Formular schliessen</span>
              </span>
            </div>
          </summary>

          <form action={createClientAction} className="border-t border-slate-100 px-6 pb-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <fieldset className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <legend className="px-1 text-sm font-semibold text-navy-950">Betrieb</legend>
                <div className="mt-3 grid gap-4">
                  {[
                    ["name", "Name", "text", ""],
                    ["slug", "Slug", "text", ""],
                    ["industry", "Branche", "text", ""],
                  ].map(([name, label, type, defaultValue]) => (
                    <label key={name} className="space-y-2">
                      <span className="text-sm font-semibold text-navy-950">{label}</span>
                      <input
                        name={name}
                        type={type}
                        defaultValue={defaultValue}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition focus:border-swiss-green focus:ring-2"
                        required
                      />
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <legend className="px-1 text-sm font-semibold text-navy-950">Kontakt</legend>
                <div className="mt-3 grid gap-4">
                  {[
                    ["contact_person", "Kontaktperson", "text", false],
                    ["notification_email", "Benachrichtigungs-E-Mail", "email", true],
                    ["phone", "Telefon", "text", false],
                  ].map(([name, label, type, required]) => (
                    <label key={String(name)} className="space-y-2">
                      <span className="text-sm font-semibold text-navy-950">{label}</span>
                      <input
                        name={String(name)}
                        type={String(type)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition focus:border-swiss-green focus:ring-2"
                        required={Boolean(required)}
                      />
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <legend className="px-1 text-sm font-semibold text-navy-950">Pilot-Einstellungen</legend>
                <div className="mt-3 grid gap-4">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-navy-950">
                      Twilio-Nummer im E.164 Format, z.B. +41310000000
                    </span>
                    <input
                      name="twilio_phone_number"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition focus:border-swiss-green focus:ring-2"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-navy-950">Durchschnittlicher Auftragswert CHF</span>
                    <input
                      name="average_order_value_chf"
                      type="number"
                      defaultValue="250"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition focus:border-swiss-green focus:ring-2"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-navy-950">Rückmeldungsnachricht</span>
                    <textarea
                      name="recovery_message"
                      rows={4}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition focus:border-swiss-green focus:ring-2"
                    />
                  </label>
                </div>
              </fieldset>
            </div>

            <button
              type="submit"
              className="ui-lift mt-6 rounded-md bg-swiss-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              Kunden anlegen
            </button>
          </form>
        </details>

        <div className="mt-8">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Management</p>
              <h2 className="text-2xl font-bold tracking-tight text-navy-950">Bestehende Kunden</h2>
            </div>
          </div>
          {error ? <div className="mb-5 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</div> : null}
          {clients.length ? (
            <div className="grid gap-4">
              {clients.map((client) => {
                const publicUrl = getPublicPilotUrl(host, protocol, client.slug);
                const publicPath = `/p/${client.slug}`;
                const domainHint = host || "localhost:3000";
                return (
                  <article
                    key={client.id}
                    className="card-hover rounded-xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(7,17,31,0.07)]"
                  >
                    <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr_1fr_auto] lg:items-start">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kunde</p>
                        <p className="mt-2 truncate text-lg font-semibold text-navy-950">{client.name}</p>
                        <p className="mt-1 text-sm text-slate-600">{client.industry}</p>
                        <p className="mt-2 truncate text-xs text-slate-500">
                          {client.contact_person || client.notification_email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Setup / Status</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge(client.is_active)}`}>
                            {client.is_active ? "Aktiv" : "Inaktiv"}
                          </span>
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge(client.portal_enabled)}`}>
                            Portal {client.portal_enabled ? "aktiv" : "inaktiv"}
                          </span>
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge(Boolean(client.twilio_phone_number))}`}>
                            {client.twilio_phone_number ? "Twilio vorbereitet" : "Nicht verbunden"}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Öffentlicher Link
                        </p>
                        <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="truncate text-sm font-semibold text-navy-950">{publicPath}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">{domainHint}</p>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <CopyButton text={publicUrl} label="Link kopieren" copiedLabel="Kopiert" />
                          <Link
                            href={`/p/${client.slug}`}
                            target="_blank"
                            className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Öffnen
                          </Link>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <p className="w-full text-xs font-semibold uppercase tracking-wide text-slate-500 lg:text-right">
                          Aktionen
                        </p>
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="rounded-md bg-navy-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800"
                        >
                          Details
                        </Link>
                        <Link
                          href={`/admin/clients/${client.id}/edit`}
                          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy-950 transition hover:bg-slate-50"
                        >
                          Bearbeiten
                        </Link>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-slate-500">Erstellt: {formatDate(client.created_at)}</p>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
              <h3 className="text-lg font-semibold text-navy-950">Noch keine Kunden vorhanden.</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Lege den ersten Pilotkunden an, um Erfassungslink, Portal und Lead-Auswertung vorzubereiten.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
