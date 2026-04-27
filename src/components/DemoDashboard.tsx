"use client";

import { useMemo, useState } from "react";
import { kpis, leads } from "@/lib/mockData";
import type { Lead, LeadStatus } from "@/lib/types";

const statusStyles: Record<LeadStatus, string> = {
  New: "bg-blue-50 text-blue-700 ring-blue-200",
  Qualified: "bg-amber-50 text-amber-800 ring-amber-200",
  Booked: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Lost: "bg-slate-100 text-slate-600 ring-slate-200",
};

const statusLabels: Record<LeadStatus, string> = {
  New: "Neu",
  Qualified: "Qualifiziert",
  Booked: "Gebucht",
  Lost: "Verloren",
};

const priorityStyles = {
  Hoch: "border-red-200 bg-red-50 text-red-700",
  Mittel: "border-amber-200 bg-amber-50 text-amber-800",
  Basis: "border-slate-200 bg-slate-100 text-slate-600",
};

const lostOpportunities = [
  {
    title: "Reifenwechsel-Anfrage",
    scenario: "Kunde braucht kurzfristig einen Termin vor dem Wochenende.",
    visible: "Terminwunsch, Telefonnummer und Potenzial wurden strukturiert sichtbar.",
    value: "CHF 250",
  },
  {
    title: "MFK-Vorbereitung",
    scenario: "MFK-Termin steht an, Fahrzeug soll vorher geprüft werden.",
    visible: "Dringlichkeit und nächste Rückfrage wurden sauber dokumentiert.",
    value: "CHF 680",
  },
  {
    title: "Rückruf wegen Bremsen",
    scenario: "Bremsen quietschen, Kunde ist unsicher und sucht schnelle Einschätzung.",
    visible: "Sicherheitsrelevante Anfrage wurde als hohe Priorität markiert.",
    value: "CHF 720",
  },
  {
    title: "Klimaservice",
    scenario: "Preissensible Anfrage, Kunde vergleicht mehrere Garagen.",
    visible: "Konkurrenzdruck und Nachfassbedarf wurden für das Team erkennbar.",
    value: "CHF 190",
  },
];

const pilotStats = [
  ["Leads strukturiert", "18"],
  ["Geschätztes Potenzial", "CHF 14’800"],
  ["Offene Rückmeldungen", "6"],
  ["Gewonnene Chancen", "4"],
];

function parseChf(value: string) {
  return Number(value.replace(/[^\d]/g, "")) || 0;
}

function getPriority(lead: Lead) {
  const text = `${lead.anfrage} ${lead.summary} ${lead.urgency}`.toLowerCase();
  const value = parseChf(lead.value);
  const highSignal = ["brems", "batterie", "mfk", "dringend", "kurzfristig"].some((term) => text.includes(term));

  if (lead.status === "Lost") {
    return "Basis";
  }

  if (highSignal || value >= 650) {
    return "Hoch";
  }

  if (value >= 300 || lead.status === "Qualified") {
    return "Mittel";
  }

  return "Basis";
}

export function DemoDashboard() {
  const [selectedLead, setSelectedLead] = useState<Lead>(leads[0]);
  const selectedPriority = useMemo(() => getPriority(selectedLead), [selectedLead]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className="card-hover rounded-xl border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(7,17,31,0.07)]"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{kpi.label}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-navy-950">{kpi.value}</p>
            <p className="mt-2 text-sm leading-5 text-slate-500">{kpi.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Vorher / Nachher</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ohne System</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                {["Anruf verpasst", "Keine Dokumentation", "Keine Priorität", "Kein Follow-up"].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-swiss-mint p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Mit LeadLeak</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-emerald-950">
                {["Lead erfasst", "Anfrage priorisiert", "Rückmeldung möglich", "Auswertung sichtbar"].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-swiss-green" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">
            Was sonst verloren gegangen wäre
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Aus einzelnen verpassten Kontaktpunkten werden konkrete Anfragen mit Kontext, Status und geschätztem Wert.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {lostOpportunities.map((item) => (
              <article key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-navy-950">{item.title}</h3>
                  <span className="shrink-0 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    {item.value}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.scenario}</p>
                <p className="mt-3 rounded-lg border border-white bg-white p-3 text-sm leading-6 text-slate-700">
                  {item.visible}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
          <div className="border-b border-swiss-line px-5 py-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Demo Lead Liste</p>
            <h2 className="mt-1 text-lg font-semibold text-navy-950">Verpasste Anfragen als strukturierte Leads</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Kontakt</th>
                  <th className="px-5 py-3">Anfrage</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Priorität</th>
                  <th className="px-5 py-3 text-right">Potenzial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => {
                  const priority = getPriority(lead);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`cursor-pointer transition hover:bg-swiss-mint/60 ${
                        selectedLead.id === lead.id ? "bg-swiss-mint" : "bg-white"
                      }`}
                    >
                      <td className="min-w-48 px-5 py-4">
                        <p className="font-semibold text-navy-950">{lead.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{lead.phone}</p>
                      </td>
                      <td className="min-w-60 px-5 py-4">
                        <p className="font-semibold text-slate-800">{lead.anfrage}</p>
                        <p className="mt-1 text-xs text-slate-500">{lead.lastAction}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[lead.status]}`}>
                          {statusLabels[lead.status]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${priorityStyles[priority]}`}>
                          {priority}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-navy-950">{lead.value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-xl border border-white/10 bg-navy-950 p-6 text-white shadow-[0_18px_55px_rgba(7,17,31,0.18)]">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Lead Detail Preview</p>
          <h2 className="mt-3 text-2xl font-semibold">{selectedLead.name}</h2>
          <p className="mt-1 text-sm text-slate-300">{selectedLead.anfrage}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              Priorität: {selectedPriority}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              Potenzial: {selectedLead.value}
            </span>
          </div>
          <div className="mt-6 space-y-5 text-sm leading-6 text-slate-200">
            <div>
              <p className="font-semibold text-white">Kurzfassung</p>
              <p className="mt-1">{selectedLead.summary}</p>
            </div>
            <div>
              <p className="font-semibold text-white">Lead DNA / Prioritätshinweis</p>
              <p className="mt-1">{selectedLead.urgency}</p>
            </div>
            <div className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 p-4">
              <p className="font-semibold text-white">Empfohlene Aktion</p>
              <p className="mt-2 text-emerald-50">{selectedLead.recommendedAction}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">Vorschlag für Rückmeldung</p>
              <p className="mt-2 text-slate-100">{selectedLead.suggestedMessage}</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">
              Auswertung für das Abschlussgespräch
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy-950">
              Von verstreuten Anfragen zu einer nachvollziehbaren Entscheidungsgrundlage.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Die Demo zeigt, wie aus verstreuten Anfragen eine nachvollziehbare Entscheidungsgrundlage für den Betrieb
            entsteht.
          </p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pilotStats.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-2 text-xl font-bold text-navy-950">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-500">
          Diese Beispieldaten dienen der Demo und ersetzen keine echte Pilot-Auswertung.
        </p>
      </section>
    </div>
  );
}
