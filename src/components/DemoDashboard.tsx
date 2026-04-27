"use client";

import { useState } from "react";
import { kpis, leads } from "@/lib/mockData";
import type { Lead, LeadStatus } from "@/lib/types";

const statusStyles: Record<LeadStatus, string> = {
  New: "bg-blue-50 text-blue-700 ring-blue-200",
  Qualified: "bg-amber-50 text-amber-800 ring-amber-200",
  Booked: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Lost: "bg-slate-100 text-slate-600 ring-slate-200",
};

const pilotStats = [
  ["Leads erfasst", "18"],
  ["Geschätztes Potenzial", "CHF 14’800"],
  ["Offene Rückmeldungen", "6"],
  ["Gewonnene Anfragen", "4"],
];

export function DemoDashboard() {
  const [selectedLead, setSelectedLead] = useState<Lead>(leads[0]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className="card-hover rounded-lg border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(7,17,31,0.06)]"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{kpi.label}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-navy-950">{kpi.value}</p>
            <p className="mt-2 text-sm leading-5 text-slate-500">{kpi.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Vorher / Nachher</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Vorher</p>
              <p className="mt-3 text-lg font-semibold text-navy-950">Nur eine Telefonnummer in der Anrufliste</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Kein Anliegen, kein potenzieller Auftragswert und keine klare nächste Aktion für das Team.
              </p>
            </div>
            <div className="rounded-md border border-emerald-200 bg-swiss-mint p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Nachher</p>
              <p className="mt-3 text-lg font-semibold text-navy-950">
                Qualifizierter Lead mit Anliegen, Dringlichkeit und nächster Aktion
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Eine strukturierte Rückmeldung, die ohne neues Personal direkt bearbeitet werden kann.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">
            Was der Betrieb sonst verloren hätte
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Die Demo zeigt, wie aus einer einzelnen Nummer eine bearbeitbare Anfrage mit Kontext wird.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Verpasster Anruf", value: `${selectedLead.phone} von ${selectedLead.name}` },
              { label: "Rückfrage an Kunde", value: selectedLead.suggestedMessage },
              { label: "Antwort des Kunden", value: selectedLead.customerReply },
              {
                label: "Interne Benachrichtigung",
                value: `Neuer qualifizierter Lead: ${selectedLead.anfrage}, ${selectedLead.value}, ${selectedLead.urgency}`,
              },
            ].map((item) => (
              <div key={item.label} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
          <div className="border-b border-swiss-line px-5 py-4">
            <h2 className="text-lg font-semibold text-navy-950">Strukturierte Leads aus verpassten Anrufen</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Telefon</th>
                  <th className="px-5 py-3">Branche</th>
                  <th className="px-5 py-3">Anfrage</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Geschätzter Wert</th>
                  <th className="px-5 py-3">Letzte Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`cursor-pointer transition hover:bg-swiss-mint/60 ${
                      selectedLead.id === lead.id ? "bg-swiss-mint" : "bg-white"
                    }`}
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-navy-950">{lead.name}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{lead.phone}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{lead.branche}</td>
                    <td className="min-w-56 px-5 py-4 text-slate-700">{lead.anfrage}</td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-navy-950">{lead.value}</td>
                    <td className="min-w-60 px-5 py-4 text-slate-600">{lead.lastAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-lg border border-white/10 bg-navy-950 p-6 text-white shadow-[0_18px_55px_rgba(7,17,31,0.18)]">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Demo-Zusammenfassung</p>
          <h2 className="mt-3 text-2xl font-semibold">{selectedLead.name}</h2>
          <p className="mt-1 text-sm text-slate-300">{selectedLead.phone}</p>
          <div className="mt-6 space-y-5 text-sm leading-6 text-slate-200">
            <div>
              <p className="font-semibold text-white">Kurzfassung</p>
              <p className="mt-1">{selectedLead.summary}</p>
            </div>
            <div>
              <p className="font-semibold text-white">Dringlichkeit</p>
              <p className="mt-1">{selectedLead.urgency}</p>
            </div>
            <div>
              <p className="font-semibold text-white">Nächste Aktion</p>
              <p className="mt-1">{selectedLead.recommendedAction}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <p className="font-semibold text-white">Vorgeschlagene Antwort</p>
              <p className="mt-2 text-slate-100">{selectedLead.suggestedMessage}</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(7,17,31,0.07)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Pilot-Auswertung</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy-950">
              Sichtbarkeit und Struktur für das Abschlussgespräch.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Diese Beispielwerte dienen der Demo und zeigen, welche Auswertung ein Betrieb nach einem Pilot besprechen kann.
          </p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pilotStats.map(([label, value]) => (
            <div key={label} className="rounded-md border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-2 text-xl font-bold text-navy-950">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
