import type { LeadActivityRow } from "@/lib/leadActivities";

type LeadActivityTimelineProps = {
  activities: LeadActivityRow[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getActivityFallbackLabel(activityType: string) {
  const labels: Record<string, string> = {
    lead_created: "Lead erstellt",
    status_changed: "Status geändert",
    note_updated: "Interne Notiz aktualisiert",
    next_action_updated: "Nächste Aktion aktualisiert",
    follow_up_updated: "Follow-up Datum aktualisiert",
    recovery_reply_copied: "Antwortvorschlag kopiert",
    lead_deleted: "Lead gelöscht",
    demo_seed_created: "Demo-Lead erstellt",
  };

  return labels[activityType] || "Aktivität erfasst";
}

function getActorLabel(activity: LeadActivityRow) {
  if (activity.actor_label) {
    return activity.actor_label;
  }

  const labels: Record<string, string> = {
    system: "System",
    admin: "Admin",
    client: "Betrieb",
  };

  return labels[activity.actor_type] || "System";
}

export function LeadActivityTimeline({ activities }: LeadActivityTimelineProps) {
  return (
    <section className="premium-card p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Verlauf</p>
          <h2 className="mt-2 text-xl font-semibold text-navy-950">Aktivitätsverlauf</h2>
        </div>
        <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          {activities.length ? `${activities.length} Einträge` : "Noch leer"}
        </span>
      </div>

      {activities.length ? (
        <div className="mt-6 space-y-4">
          {activities.map((activity) => (
            <article key={activity.id} className="relative rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-navy-950">
                    {activity.message || getActivityFallbackLabel(activity.activity_type)}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {getActorLabel(activity)} · {formatDate(activity.created_at)}
                  </p>
                </div>
                <span className="w-fit rounded-full border border-emerald-200 bg-swiss-mint px-3 py-1 text-xs font-semibold text-emerald-800">
                  {getActivityFallbackLabel(activity.activity_type)}
                </span>
              </div>
              {(activity.old_value || activity.new_value) ? (
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-lg border border-white bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Vorher</p>
                    <p className="mt-1 whitespace-pre-wrap text-slate-800">{activity.old_value || "-"}</p>
                  </div>
                  <div className="rounded-lg border border-white bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Neu</p>
                    <p className="mt-1 whitespace-pre-wrap text-slate-800">{activity.new_value || "-"}</p>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
          Für diesen Lead gibt es noch keinen Verlauf.
        </div>
      )}
    </section>
  );
}
