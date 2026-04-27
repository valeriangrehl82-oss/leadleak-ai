import Link from "next/link";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { LeadDnaPrivacyNote } from "@/components/LeadDnaVisual";
import { formatChf } from "@/lib/audit";
import {
  calculateDashboardMetrics,
  getMostCommonRequestType,
  getNextBestActions,
  getRecentActivities,
  getStrongestLeadDnaSignal,
  type ClientDashboardLead,
} from "@/lib/clientDashboard";
import { CLIENT_COOKIE_NAME, isClientPortalConfigError, readClientSessionValue } from "@/lib/clientSession";
import { getLeadDnaProfile, getTopLeadDnaHighlights } from "@/lib/leadDna";
import { getLeadStatusLabel } from "@/lib/leadStatus";
import { createServiceRoleClient, isSupabaseConfigError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ClientDashboardPageProps = {
  searchParams: Promise<{ start?: string; end?: string; range?: string }>;
};

type ClientRow = {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  portal_enabled: boolean | null;
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

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
  }).format(new Date(`${value}T12:00:00.000Z`));
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

function buildRangeHref(options: { start?: string; end?: string; range?: "all" } = {}) {
  const params = new URLSearchParams();
  if (options.range) {
    params.set("range", options.range);
  }
  if (options.start) {
    params.set("start", options.start);
  }
  if (options.end) {
    params.set("end", options.end);
  }

  const query = params.toString();
  return `/client/dashboard${query ? `?${query}` : ""}`;
}

function getRangeLabel(start: string, end: string, isAll: boolean) {
  if (isAll) {
    return "Alle Anfragen";
  }
  if (start && end) {
    return `${formatDateLabel(start)} bis ${formatDateLabel(end)}`;
  }
  if (start) {
    return `Ab ${formatDateLabel(start)}`;
  }
  if (end) {
    return `Bis ${formatDateLabel(end)}`;
  }

  return "Alle Anfragen";
}

function getPublicPilotUrl(host: string | null, protocol: string | null, slug: string) {
  const resolvedHost = host || "localhost:3000";
  const resolvedProtocol = protocol || (resolvedHost.includes("localhost") ? "http" : "https");
  return `${resolvedProtocol}://${resolvedHost}/p/${slug}`;
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

function getPriorityTone(priority: "Hoch" | "Mittel" | "Basis") {
  const tones = {
    Hoch: "border-emerald-300/35 bg-emerald-400/15 text-emerald-100",
    Mittel: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
    Basis: "border-white/10 bg-white/5 text-slate-200",
  };

  return tones[priority];
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
    .select("id, name, slug, industry, portal_enabled")
    .eq("id", session.clientId)
    .maybeSingle<ClientRow>();

  if (clientError || !client || !client.portal_enabled) {
    redirect("/client/login");
  }

  let leadsQuery = supabase
    .from("client_leads")
    .select("id, created_at, customer_name, customer_phone, request_type, message, status, estimated_value_chf, source")
    .eq("client_id", client.id);

  if (start) {
    leadsQuery = leadsQuery.gte("created_at", startOfDayIso(start));
  }

  if (end) {
    leadsQuery = leadsQuery.lte("created_at", endOfDayIso(end));
  }

  const { data: leads, error: leadsError } = await leadsQuery.order("created_at", { ascending: false });

  if (leadsError) {
    return { client, leads: [] as ClientDashboardLead[], error: "Leads konnten nicht geladen werden." };
  }

  return { client, leads: (leads || []) as ClientDashboardLead[], error: "" };
}

export default async function ClientDashboardPage({ searchParams }: ClientDashboardPageProps) {
  const params = await searchParams;
  const quick7 = getQuickRange(7);
  const quick14 = getQuickRange(14);
  const quick30 = getQuickRange(30);
  const isAllRange = params.range === "all";
  const hasExplicitRange = Boolean(params.start || params.end || isAllRange);
  const start = isAllRange ? "" : readDateParam(params.start) || (!hasExplicitRange ? quick14.start : "");
  const end = isAllRange ? "" : readDateParam(params.end) || (!hasExplicitRange ? quick14.end : "");

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
  const metrics = calculateDashboardMetrics(leads);
  const actions = getNextBestActions(leads);
  const activities = getRecentActivities(leads);
  const leadDnaHighlights = getTopLeadDnaHighlights(leads, 3);
  const mostCommonType = getMostCommonRequestType(leads);
  const requestHeaders = await headers();
  const publicPilotUrl = getPublicPilotUrl(
    requestHeaders.get("host"),
    requestHeaders.get("x-forwarded-proto"),
    client.slug,
  );
  const rangeLabel = getRangeLabel(start, end, isAllRange);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-navy-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-fade-slide flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
                Revenue Rescue Cockpit
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{client.name}</h1>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                {client.industry ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-slate-200">
                    {client.industry}
                  </span>
                ) : null}
                <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 font-semibold text-emerald-200">
                  Portal aktiv
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-slate-200">
                  Zeitraum: {rangeLabel}
                </span>
              </div>
            </div>
            <form action="/api/client/logout" method="post">
              <button
                type="submit"
                className="ui-lift rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Logout
              </button>
            </form>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="animate-fade-slide animate-delay-1 rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Executive Summary</p>
              {leads.length ? (
                <p className="mt-3 text-2xl font-semibold leading-9 text-white">
                  Im ausgewählten Zeitraum wurden {metrics.total} Anfragen sichtbar gemacht. Das geschätzte
                  Anfragepotenzial liegt bei {formatChf(metrics.totalValue)}. Aktuell sind {metrics.openPriorities}{" "}
                  Anfragen offen oder in Bearbeitung.
                </p>
              ) : (
                <p className="mt-3 text-2xl font-semibold leading-9 text-white">
                  Noch keine Anfragen im ausgewählten Zeitraum. Sobald neue Anfragen über den Erfassungslink eingehen,
                  erscheinen hier Prioritäten, Lead DNA Signale und Auswertung.
                </p>
              )}
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Diese Ansicht zeigt sichtbares Anfragepotenzial und empfohlene nächste Schritte. Sie ist keine
                Umsatzgarantie.
              </p>
            </div>

            <div className="animate-fade-slide animate-delay-2 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
                Öffentlicher Erfassungslink
              </p>
              <p className="mt-2 text-sm leading-6 text-emerald-50">
                Über diesen Link werden neue Anfragen für Ihre Pilotphase erfasst.
              </p>
              <p className="mt-3 break-all rounded-lg border border-white/10 bg-navy-950/70 p-4 text-sm leading-6 text-slate-100">
                {publicPilotUrl}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <CopyButton
                  text={publicPilotUrl}
                  label="Link kopieren"
                  copiedLabel="Link kopiert"
                  className="ui-lift rounded-md bg-swiss-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                />
                <Link
                  href={`/p/${client.slug}`}
                  target="_blank"
                  className="ui-lift rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Link öffnen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-fade-slide rounded-xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Zeitraum</p>
              <p className="mt-1 text-sm text-slate-600">{rangeLabel}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ["Letzte 7 Tage", buildRangeHref({ start: quick7.start, end: quick7.end })],
                ["Letzte 14 Tage", buildRangeHref({ start: quick14.start, end: quick14.end })],
                ["Letzte 30 Tage", buildRangeHref({ start: quick30.start, end: quick30.end })],
                ["Alle", buildRangeHref({ range: "all" })],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="ui-lift rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {[
            ["Erfasste Anfragen", leads.length ? String(metrics.total) : "Noch keine", "Im Zeitraum erfasst"],
            [
              "Geschätztes Anfragepotenzial",
              leads.length ? formatChf(metrics.totalValue) : "Wird berechnet",
              "Orientierung, keine Garantie",
            ],
            [
              "Offene Prioritäten",
              leads.length ? String(metrics.openPriorities) : "Nach erster Anfrage aktiv",
              "Neu, kontaktiert oder qualifiziert",
            ],
            ["Bearbeitungsquote", leads.length ? `${metrics.processingRate}%` : "Wird berechnet", "Nicht mehr im Status Neu"],
            ["Gewonnene Anfragen", leads.length ? String(metrics.won) : "Noch keine", "Als gewonnen markiert"],
            ["Ø Anfragewert", leads.length ? formatChf(metrics.averageValue) : "Wird berechnet", "Durchschnittlicher Schätzwert"],
          ].map(([label, value, helper], index) => (
            <div
              key={label}
              className={`card-hover animate-fade-slide animate-delay-${Math.min(index, 3)} rounded-xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(7,17,31,0.07)]`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-3 text-2xl font-bold tracking-tight text-navy-950">{value}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{helper}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-xl border border-navy-900 bg-navy-950 p-6 text-white shadow-[0_24px_80px_rgba(7,17,31,0.14)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Prioritäten</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Empfohlene nächste Schritte</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {actions.map((action) => (
                <article key={action.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{action.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{action.explanation}</p>
                      {action.related ? <p className="mt-2 text-xs text-emerald-200">{action.related}</p> : null}
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityTone(
                        action.priority,
                      )}`}
                    >
                      {action.priority}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
            <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Aktivität</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy-950">Letzte Aktivitäten</h2>
            {activities.length ? (
              <div className="mt-5 space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-swiss-green shadow-[0_0_18px_rgba(37,165,106,0.35)]" />
                    <div className="border-b border-slate-100 pb-4">
                      <p className="font-semibold text-navy-950">{activity.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{activity.detail}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(activity.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                Noch keine Aktivitäten im ausgewählten Zeitraum. Sobald Anfragen über den Erfassungslink eingehen,
                erscheint hier eine chronologische Übersicht.
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-navy-900 bg-navy-950 p-6 text-white shadow-[0_24px_80px_rgba(7,17,31,0.14)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Business Plus</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Lead DNA Highlights</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">
              Priorisierte Anfrage-Signale auf Basis von Auftragswert, Dringlichkeit, Konkurrenzdruck, Nachfassbedarf
              und Anfragequalität.
            </p>
          </div>
          <div className="mt-5">
            <LeadDnaPrivacyNote />
          </div>
          {leadDnaHighlights.length ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {leadDnaHighlights.map(({ lead, profile }) => (
                <article key={lead.id} className="card-hover rounded-xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Lead DNA</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        {lead.customer_name || "Unbekannter Kontakt"}
                      </h3>
                      <p className="mt-1 text-sm leading-5 text-slate-400">{lead.request_type || "Anfrage ohne Kategorie"}</p>
                    </div>
                    <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      {getStrongestLeadDnaSignal(profile)}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-3 text-sm">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-slate-400">Geschätzter Wert</span>
                      <span className="font-semibold text-white">{formatChf(lead.estimated_value_chf || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-slate-400">Lead DNA Index</span>
                      <span className="font-semibold text-emerald-200">{profile.priorityScore}/100</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Vorschlag</p>
                      <p className="mt-2 font-semibold text-white">{profile.recommendedAction}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5 text-sm leading-6 text-slate-300">
                <h3 className="text-lg font-semibold text-white">Lead DNA wird nach den ersten Anfragen aktiv</h3>
                <p className="mt-2">
                  Sobald Anfragen eingehen, erkennt Lead DNA Prioritätssignale wie Auftragswert, Dringlichkeit,
                  Konkurrenzdruck, Nachfassbedarf und Anfragequalität.
                </p>
                <div className="mt-4">
                  <CopyButton
                    text={publicPilotUrl}
                    label="Erfassungslink kopieren"
                    copiedLabel="Link kopiert"
                    className="rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  />
                </div>
              </div>
              <div className="rounded-lg border border-emerald-300/25 bg-emerald-400/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Beispielprofil</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Bremsen quietschen</h3>
                <p className="mt-3 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-100">
                  Signal: Hohe Dringlichkeit
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Beispielansicht zur Demonstration. Sie fliesst nicht in echte Auswertungen ein.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
          <div className="border-b border-swiss-line px-5 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Lead-Übersicht</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-navy-950">Anfragen im Zeitraum</h2>
              </div>
              <p className="text-sm text-slate-500">Read-only Ansicht</p>
            </div>
          </div>
          {error ? <div className="m-5 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</div> : null}
          <div className="overflow-x-auto">
            <table className="min-w-[980px] divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Erstellt</th>
                  <th className="px-5 py-3">Kontakt</th>
                  <th className="px-5 py-3">Telefon</th>
                  <th className="px-5 py-3">Anfrageart</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Wert</th>
                  <th className="px-5 py-3">Lead DNA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.length ? (
                  leads.map((lead) => {
                    const profile = getLeadDnaProfile(lead);
                    return (
                      <tr key={lead.id} className="transition hover:bg-slate-50">
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(lead.created_at)}</td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-navy-950">
                          {lead.customer_name || "Unbekannter Kontakt"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-700">{lead.customer_phone || "-"}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-700">{lead.request_type || "-"}</td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(lead.status)}`}>
                            {getLeadStatusLabel(lead.status)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-navy-950">
                          {formatChf(lead.estimated_value_chf || 0)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="rounded-full border border-emerald-200 bg-swiss-mint px-3 py-1 text-xs font-semibold text-emerald-800">
                            Index {profile.priorityScore}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="px-5 py-10 text-center text-slate-600" colSpan={7}>
                      <div className="mx-auto max-w-xl">
                        <p className="font-semibold text-navy-950">Noch keine Leads im ausgewählten Zeitraum.</p>
                        <p className="mt-2 text-sm leading-6">
                          Sobald Anfragen über den öffentlichen Erfassungslink eingehen, erscheinen hier Kontakt,
                          Anfrageart, Status, Potenzial und Lead DNA Index.
                        </p>
                        <div className="mt-4">
                          <CopyButton text={publicPilotUrl} label="Erfassungslink kopieren" copiedLabel="Link kopiert" />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Auswertung</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy-950">Pilot-Auswertung</h2>
          {!leads.length ? (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-swiss-mint p-5">
              <h3 className="font-semibold text-emerald-950">Pilot-Auswertung vorbereitet</h3>
              <p className="mt-2 text-sm leading-6 text-emerald-900">
                Sobald erste Anfragen erfasst wurden, zeigt diese Auswertung Anfragevolumen, geschätztes Potenzial,
                häufigste Anfragearten und Bearbeitungsstand.
              </p>
            </div>
          ) : null}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Total Leads", leads.length ? String(metrics.total) : "Noch keine"],
              ["Geschätztes Potenzial", leads.length ? formatChf(metrics.totalValue) : "Wird berechnet"],
              ["Ø Anfragewert", leads.length ? formatChf(metrics.averageValue) : "Wird berechnet"],
              ["Gewonnen / Verloren", leads.length ? `${metrics.won} / ${metrics.lost}` : "Noch keine"],
              ["Offene Leads", leads.length ? String(metrics.open) : "Nach erster Anfrage aktiv"],
              [
                "Häufigste Anfrageart",
                leads.length && mostCommonType.count ? `${mostCommonType.requestType} (${mostCommonType.count})` : "Wird sichtbar",
              ],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 font-semibold text-navy-950">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            {leads.length
              ? "Die Pilot-Auswertung zeigt, welche Anfragearten sichtbar wurden und wie viel Potenzial strukturiert nachbearbeitet werden kann. Die Werte dienen als Orientierung und ersetzen keine Umsatzgarantie."
              : "Für eine aussagekräftige Pilot-Auswertung sollten zuerst Anfragen über den Erfassungslink eingehen."}
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-700">
            Diese Auswertung ist eine Potenzialbetrachtung und keine Umsatzgarantie.
          </p>
        </section>
      </section>
    </main>
  );
}
