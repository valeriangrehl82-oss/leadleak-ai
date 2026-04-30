import Link from "next/link";
import { redirect } from "next/navigation";
import { formatChf } from "@/lib/audit";
import { requireAdminPage } from "@/lib/adminGuard";
import {
  clampFitScore,
  formatDateTime,
  getOutreachPriorityLabel,
  getOutreachStatusLabel,
  isFollowUpDue,
  isOutreachPriority,
  isOutreachStatus,
  normalizeWebsiteUrl,
  nullableDateTime,
  nullableNumber,
  nullableText,
  outreachPriorities,
  outreachStatuses,
  priorityBadgeClass,
  sortOutreachTargets,
  statusBadgeClass,
  toDateTimeLocalValue,
  type OutreachTargetRow,
} from "@/lib/outreach";
import { createServiceRoleClient, isSupabaseConfigError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OutreachPageProps = {
  searchParams: Promise<{ created?: string; updated?: string; error?: string; filter?: string }>;
};

const filters = [
  { value: "all", label: "Alle" },
  { value: "due", label: "Heute nachfassen" },
  { value: "new", label: "Neu" },
  { value: "called", label: "Angerufen" },
  { value: "interested", label: "Interessiert" },
  { value: "demo_scheduled", label: "Demo geplant" },
  { value: "pilot_offered", label: "Pilot angeboten" },
  { value: "pilot_won", label: "Gewonnen" },
  { value: "not_interested", label: "Kein Interesse" },
  { value: "no_response", label: "Keine Rückmeldung" },
];

function endOfToday() {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

function isDueToday(target: OutreachTargetRow) {
  if (!target.next_follow_up_at || ["pilot_won", "not_interested"].includes(target.status || "new")) {
    return false;
  }

  return new Date(target.next_follow_up_at).getTime() <= endOfToday().getTime();
}

function applyFilter(targets: OutreachTargetRow[], filter: string) {
  if (filter === "due") {
    return targets.filter(isDueToday);
  }

  if (filter === "all") {
    return targets;
  }

  return targets.filter((target) => (target.status || "new") === filter);
}

async function createTargetAction(formData: FormData) {
  "use server";

  await requireAdminPage();

  const companyName = nullableText(formData.get("company_name"));
  const priority = String(formData.get("priority") || "medium");
  const fitScore = clampFitScore(Number(formData.get("fit_score") || 50));

  if (!companyName || !isOutreachPriority(priority)) {
    redirectToOutreach("error=missing");
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("outreach_targets").insert({
    company_name: companyName,
    industry: nullableText(formData.get("industry")),
    location: nullableText(formData.get("location")),
    website: nullableText(formData.get("website")),
    phone: nullableText(formData.get("phone")),
    email: nullableText(formData.get("email")),
    contact_person: nullableText(formData.get("contact_person")),
    source: nullableText(formData.get("source")),
    status: "new",
    priority,
    fit_score: fitScore,
    estimated_potential_chf: nullableNumber(formData.get("estimated_potential_chf")),
    notes: nullableText(formData.get("notes")),
    next_action: nullableText(formData.get("next_action")),
    next_follow_up_at: nullableDateTime(formData.get("next_follow_up_at")),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Outreach target insert failed:", error);
    redirectToOutreach("error=insert");
  }

  redirectToOutreach("created=1");
}

async function quickUpdateTargetAction(formData: FormData) {
  "use server";

  await requireAdminPage();

  const targetId = nullableText(formData.get("target_id"));
  const status = String(formData.get("status") || "new");

  if (!targetId || !isOutreachStatus(status)) {
    redirectToOutreach("error=update");
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("outreach_targets")
    .update({
      status,
      next_action: nullableText(formData.get("next_action")),
      next_follow_up_at: nullableDateTime(formData.get("next_follow_up_at")),
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetId);

  if (error) {
    console.error("Outreach quick update failed:", error);
    redirectToOutreach("error=update");
  }

  redirectToOutreach("updated=1");
}

function redirectToOutreach(query: string) {
  redirect(`/admin/outreach?${query}`);
}

async function loadTargets() {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("outreach_targets")
      .select(
        "id, created_at, updated_at, company_name, industry, location, website, phone, email, contact_person, source, status, priority, fit_score, estimated_potential_chf, notes, last_contact_at, next_follow_up_at, next_action, demo_scheduled_at, pilot_value_chf, linked_client_id",
      )
      .order("created_at", { ascending: false });

    if (error) {
      return { targets: [], error: "Outreach-Ziele konnten nicht geladen werden." };
    }

    return { targets: (data || []) as OutreachTargetRow[], error: "" };
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return { targets: [], error: error.message };
    }

    return { targets: [], error: "Supabase ist noch nicht konfiguriert oder die Tabelle fehlt." };
  }
}

export default async function OutreachPage({ searchParams }: OutreachPageProps) {
  const params = await searchParams;
  const activeFilter = params.filter || "all";
  const { targets, error } = await loadTargets();
  const sortedTargets = sortOutreachTargets(targets);
  const visibleTargets = applyFilter(sortedTargets, activeFilter);
  const stats = {
    total: targets.length,
    due: targets.filter(isDueToday).length,
    interested: targets.filter((target) => target.status === "interested").length,
    demo: targets.filter((target) => target.status === "demo_scheduled").length,
    won: targets.filter((target) => target.status === "pilot_won").length,
    noResponse: targets.filter((target) => target.status === "no_response").length,
  };

  return (
    <main className="premium-page">
      <section className="premium-surface text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="premium-eyebrow-dark">Admin Outreach</p>
          <h1 className="premium-title-dark mt-3 text-3xl sm:text-5xl">Outreach Pipeline</h1>
          <p className="premium-muted-dark mt-4 max-w-3xl">
            Zielbetriebe, Anrufe, Demos und Pilotchancen strukturiert verfolgen.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/sales" className="premium-button-primary inline-flex px-4 py-2 text-sm">
              Sales Command Center
            </Link>
            <Link href="/admin/pilot-setup" className="premium-button-secondary inline-flex px-4 py-2 text-sm text-white">
              Pilot Setup Checklist
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {[
              ["Zielbetriebe gesamt", String(stats.total)],
              ["Heute nachfassen", String(stats.due)],
              ["Interessiert", String(stats.interested)],
              ["Demo geplant", String(stats.demo)],
              ["Pilot gewonnen", String(stats.won)],
              ["Keine Rückmeldung", String(stats.noResponse)],
            ].map(([label, value]) => (
              <div key={label} className="premium-glass rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {params.created ? (
          <div className="mb-6 rounded-md bg-swiss-mint p-4 text-sm font-semibold text-emerald-900">
            Zielbetrieb wurde erfasst.
          </div>
        ) : null}
        {params.updated ? (
          <div className="mb-6 rounded-md bg-swiss-mint p-4 text-sm font-semibold text-emerald-900">
            Outreach-Status wurde gespeichert.
          </div>
        ) : null}
        {params.error || error ? (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-800">
            {error || "Aktion konnte nicht gespeichert werden. Bitte Angaben prüfen."}
          </div>
        ) : null}

        <div className="mb-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="premium-card-dark p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Strategischer Fokus</p>
            <h2 className="mt-3 text-2xl font-semibold">
              Ziel: 30 Betriebe recherchieren, 20 Anrufe führen, 5 Demos sichern, 1 Pilotkunde gewinnen.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Nicht Perfektion ist das Ziel, sondern echte Marktrückmeldungen und sauber dokumentierte nächste Schritte.
            </p>
          </section>

          <details id="new-target" open={!targets.length || Boolean(params.error)} className="premium-card group">
            <summary className="cursor-pointer list-none px-6 py-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Neuer Zielbetrieb</p>
                  <h2 className="text-xl font-semibold text-navy-950">Target erfassen</h2>
                </div>
                <span className="rounded-md bg-navy-950 px-4 py-2 text-sm font-semibold text-white">
                  <span className="group-open:hidden">Formular öffnen</span>
                  <span className="hidden group-open:inline">Formular schliessen</span>
                </span>
              </div>
            </summary>

            <form action={createTargetAction} className="border-t border-slate-100 px-6 pb-6">
              <div className="grid gap-5 lg:grid-cols-2">
                <fieldset className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <legend className="px-1 text-sm font-semibold text-navy-950">Betrieb</legend>
                  <div className="mt-3 grid gap-4">
                    <Input name="company_name" label="Firmenname" required />
                    <Input name="industry" label="Branche" />
                    <Input name="location" label="Ort / Region" />
                    <Input name="website" label="Website" />
                  </div>
                </fieldset>

                <fieldset className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <legend className="px-1 text-sm font-semibold text-navy-950">Kontakt</legend>
                  <div className="mt-3 grid gap-4">
                    <Input name="phone" label="Telefon" />
                    <Input name="email" label="E-Mail" type="email" />
                    <Input name="contact_person" label="Kontaktperson" />
                    <Input name="source" label="Quelle" />
                  </div>
                </fieldset>

                <fieldset className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <legend className="px-1 text-sm font-semibold text-navy-950">Sales-Einschätzung</legend>
                  <div className="mt-3 grid gap-4">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-navy-950">Priorität</span>
                      <select name="priority" defaultValue="medium" className="premium-input">
                        {outreachPriorities.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Input name="fit_score" label="Fit Score" type="number" defaultValue="50" />
                    <Input name="estimated_potential_chf" label="Geschätztes Potenzial CHF" type="number" />
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-navy-950">Notizen</span>
                      <textarea name="notes" rows={4} className="premium-input" />
                    </label>
                  </div>
                </fieldset>

                <fieldset className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <legend className="px-1 text-sm font-semibold text-navy-950">Nächste Aktion</legend>
                  <div className="mt-3 grid gap-4">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-navy-950">Nächste Aktion</span>
                      <textarea name="next_action" rows={4} className="premium-input" />
                    </label>
                    <Input name="next_follow_up_at" label="Nächstes Follow-up" type="datetime-local" />
                    <button type="submit" className="premium-button-primary mt-2 px-5 py-3 text-sm">
                      Zielbetrieb speichern
                    </button>
                  </div>
                </fieldset>
              </div>
            </form>
          </details>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive = filter.value === activeFilter;
            return (
              <Link
                key={filter.value}
                href={filter.value === "all" ? "/admin/outreach" : `/admin/outreach?filter=${filter.value}`}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "border-swiss-green bg-swiss-green text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-swiss-green hover:bg-swiss-mint"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        {!targets.length ? (
          <section className="premium-empty p-8 text-center">
            <h2 className="text-2xl font-semibold text-navy-950">Noch keine Zielbetriebe erfasst.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Starte mit 30 Betrieben aus deiner Region. Ziel ist nicht Perfektion, sondern echte Marktrückmeldungen.
            </p>
            <a href="#new-target" className="premium-button-primary mt-5 inline-flex px-5 py-3 text-sm">
              Ersten Zielbetrieb erfassen
            </a>
          </section>
        ) : (
          <div className="grid gap-5">
            {visibleTargets.map((target) => {
              const websiteUrl = normalizeWebsiteUrl(target.website);
              return (
                <article key={target.id} className="premium-card p-5">
                  <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-2xl font-semibold text-navy-950">{target.company_name}</h2>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {[target.industry, target.location].filter(Boolean).join(" · ") || "Branche / Ort offen"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(target.status)}`}>
                            {getOutreachStatusLabel(target.status)}
                          </span>
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${priorityBadgeClass(target.priority)}`}>
                            {getOutreachPriorityLabel(target.priority)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Metric label="Fit Score" value={`${target.fit_score ?? 50}/100`} />
                        <Metric
                          label="Potenzial"
                          value={target.estimated_potential_chf ? formatChf(target.estimated_potential_chf) : "-"}
                        />
                        <Metric label="Nachfassen" value={formatDateTime(target.next_follow_up_at)} />
                        <Metric label="Letzter Kontakt" value={formatDateTime(target.last_contact_at)} />
                      </div>

                      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                        <p className="font-semibold text-navy-950">Nächste Aktion</p>
                        <p className="mt-1">{target.next_action || "Noch keine nächste Aktion definiert."}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link href={`/admin/outreach/${target.id}`} className="premium-button-primary px-4 py-2 text-sm">
                          Details
                        </Link>
                        {target.phone ? (
                          <a href={`tel:${target.phone}`} className="premium-button-secondary px-4 py-2 text-sm">
                            Anrufen
                          </a>
                        ) : null}
                        {websiteUrl ? (
                          <a href={websiteUrl} target="_blank" className="premium-button-secondary px-4 py-2 text-sm">
                            Website öffnen
                          </a>
                        ) : null}
                      </div>
                    </div>

                    <form action={quickUpdateTargetAction} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <input type="hidden" name="target_id" value={target.id} />
                      <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Status aktualisieren</p>
                      <div className="mt-4 grid gap-4">
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-navy-950">Status</span>
                          <select name="status" defaultValue={target.status || "new"} className="premium-input">
                            {outreachStatuses.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-navy-950">Nächste Aktion</span>
                          <textarea name="next_action" defaultValue={target.next_action || ""} rows={3} className="premium-input" />
                        </label>
                        <Input
                          name="next_follow_up_at"
                          label="Nächstes Follow-up"
                          type="datetime-local"
                          defaultValue={toDateTimeLocalValue(target.next_follow_up_at)}
                        />
                        {isFollowUpDue(target) ? (
                          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                            Follow-up ist fällig.
                          </p>
                        ) : null}
                        <button type="submit" className="premium-button-primary px-4 py-2 text-sm">
                          Speichern
                        </button>
                      </div>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function Input({
  name,
  label,
  type = "text",
  defaultValue = "",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-navy-950">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} required={required} className="premium-input" />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-navy-950">{value}</p>
    </div>
  );
}
