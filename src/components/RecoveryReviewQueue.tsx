"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import type { RecoveryBrainResult } from "@/lib/recoveryBrain";

export type RecoveryQueueItem = {
  id: string;
  createdAt: string;
  customerName: string | null;
  clientName: string;
  requestType: string | null;
  status: string | null;
  estimatedValueChf: number | null;
  recovery: RecoveryBrainResult;
};

const filters = [
  { value: "all", label: "Alle" },
  { value: "urgent", label: "Hohe Dringlichkeit" },
  { value: "appointment", label: "Terminbedarf" },
  { value: "new", label: "Neue Leads" },
  { value: "qualified", label: "Qualifizierte Leads" },
] as const;

type FilterValue = (typeof filters)[number]["value"];

function formatChf(value: number | null) {
  if (!value) {
    return "-";
  }

  return `CHF ${new Intl.NumberFormat("de-CH").format(value).replace(/\u2019/g, "'")}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusLabel(status: string | null) {
  const labels: Record<string, string> = {
    new: "Neu",
    contacted: "Kontaktiert",
    qualified: "Qualifiziert",
  };

  return labels[status || "new"] || "Neu";
}

function getStatusTone(status: string | null) {
  const tones: Record<string, string> = {
    new: "border-blue-200 bg-blue-50 text-blue-800",
    contacted: "border-cyan-200 bg-cyan-50 text-cyan-800",
    qualified: "border-emerald-200 bg-emerald-50 text-emerald-800",
  };

  return tones[status || "new"] || tones.new;
}

function getUrgencyTone(urgency: string) {
  if (urgency === "Hoch") {
    return "border-emerald-300/35 bg-emerald-400/15 text-emerald-100";
  }

  if (urgency === "Mittel/Hoch") {
    return "border-cyan-300/35 bg-cyan-400/15 text-cyan-100";
  }

  return "border-white/10 bg-white/5 text-slate-200";
}

function matchesFilter(item: RecoveryQueueItem, filter: FilterValue) {
  if (filter === "urgent") {
    return item.recovery.urgencyLabel === "Hoch";
  }

  if (filter === "appointment") {
    return item.recovery.appointmentNeed;
  }

  if (filter === "new") {
    return (item.status || "new") === "new";
  }

  if (filter === "qualified") {
    return item.status === "qualified";
  }

  return true;
}

export function RecoveryReviewQueue({ items }: { items: RecoveryQueueItem[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const filteredItems = useMemo(
    () => items.filter((item) => matchesFilter(item, activeFilter)),
    [activeFilter, items],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-swiss-green bg-swiss-green text-white shadow-[0_10px_28px_rgba(37,165,106,0.18)]"
                  : "border-slate-200 bg-white text-slate-700 hover:border-swiss-green hover:bg-swiss-mint"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {filteredItems.length ? (
        <div className="grid gap-5">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="premium-card p-5"
            >
              <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-swiss-green">
                        {item.clientName}
                      </p>
                      <h2 className="mt-2 text-xl font-bold tracking-tight text-navy-950">
                        {item.customerName || "Unbekannter Kontakt"}
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.requestType || "Anfrage ohne Kategorie"} · {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      ["Potenzial", formatChf(item.estimatedValueChf)],
                      ["Kategorie", item.recovery.category],
                      ["Terminbedarf", item.recovery.appointmentNeed ? "Ja" : "Nein"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                        <p className="mt-2 font-semibold text-navy-950">{value}</p>
                      </div>
                    ))}
                    <div className="premium-card-dark p-4 text-white">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Dringlichkeit</p>
                      <span
                        className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getUrgencyTone(
                          item.recovery.urgencyLabel,
                        )}`}
                      >
                        {item.recovery.urgencyLabel}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-lg border border-emerald-200 bg-swiss-mint p-4">
                    <p className="text-sm font-semibold text-emerald-950">Empfohlene nächste Aktion</p>
                    <p className="mt-2 text-sm leading-6 text-emerald-950">{item.recovery.recommendedAction}</p>
                  </div>

                  <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-navy-950">Fehlende Angaben</p>
                    {item.recovery.missingInformation.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.recovery.missingInformation.map((missing) => (
                          <span
                            key={missing}
                            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                          >
                            {missing}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-600">Keine zentralen Pflichtangaben erkannt.</p>
                    )}
                  </div>
                </div>

                <div className="premium-card-dark p-5 text-white">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                        Vorschlag für Rückmeldung
                      </p>
                      <h3 className="mt-2 text-xl font-semibold">Vor Versand prüfen</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <CopyButton
                        text={item.recovery.suggestedReply}
                        label="Antwort kopieren"
                        copiedLabel="Kopiert"
                        className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
                      />
                      <Link
                        href={`/admin/leads/${item.id}`}
                        className="rounded-md bg-swiss-green px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
                      >
                        Lead öffnen
                      </Link>
                    </div>
                  </div>
                  <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-100">
                    {item.recovery.suggestedReply}
                  </p>
                  <p className="mt-5 rounded-lg border border-white/10 bg-white/5 p-3 text-xs leading-5 text-slate-300">
                    Recovery Brain erstellt Vorschläge zur Unterstützung der Rückmeldung. Es werden keine Nachrichten
                    automatisch versendet.
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="premium-empty">
          <h2 className="text-xl font-semibold text-navy-950">Keine offenen Recovery-Vorschläge</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Sobald neue oder qualifizierte Anfragen eingehen, erscheinen hier Antwortvorschläge zur Prüfung.
          </p>
        </div>
      )}
    </div>
  );
}
