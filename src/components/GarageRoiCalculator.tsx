"use client";

import { useMemo, useState } from "react";

function formatNumber(value: number, digits = 0) {
  return value.toLocaleString("de-CH", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function formatChf(value: number) {
  return `CHF ${Math.round(value).toLocaleString("de-CH")}`;
}

export function GarageRoiCalculator() {
  const [missedCalls, setMissedCalls] = useState(15);
  const [relevantShare, setRelevantShare] = useState(60);
  const [averageOrderValue, setAverageOrderValue] = useState(250);
  const [recoveryRate, setRecoveryRate] = useState(40);

  const result = useMemo(() => {
    const rescuedLeadsPerMonth = missedCalls * 4.33 * (relevantShare / 100) * (recoveryRate / 100);
    const monthlyRevenue = rescuedLeadsPerMonth * averageOrderValue;

    return {
      rescuedLeadsPerMonth,
      monthlyRevenue,
      yearlyRevenue: monthlyRevenue * 12,
    };
  }, [averageOrderValue, missedCalls, recoveryRate, relevantShare]);

  return (
    <div className="rounded-lg border border-swiss-line bg-white p-6 shadow-soft">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Garage ROI Rechner</p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-navy-950">
          Was verpasste Werkstatt-Anfragen pro Monat bedeuten können.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Die Berechnung ist keine Garantie, sondern eine Verkaufshilfe zur Einschätzung des Potenzials.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">Verpasste Anrufe pro Woche</span>
            <input
              type="number"
              min="0"
              value={missedCalls}
              onChange={(event) => setMissedCalls(Number(event.target.value))}
              className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">Anteil relevanter Anfragen in %</span>
            <input
              type="number"
              min="0"
              max="100"
              value={relevantShare}
              onChange={(event) => setRelevantShare(Number(event.target.value))}
              className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">Durchschnittlicher Auftragswert in CHF</span>
            <input
              type="number"
              min="0"
              value={averageOrderValue}
              onChange={(event) => setAverageOrderValue(Number(event.target.value))}
              className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">Rückgewinnungsquote in %</span>
            <input
              type="number"
              min="0"
              max="100"
              value={recoveryRate}
              onChange={(event) => setRecoveryRate(Number(event.target.value))}
              className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
            />
          </label>
        </div>

        <div className="rounded-lg bg-navy-950 p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Potenzial</p>
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-sm text-slate-300">Potenziell gerettete Leads pro Monat</p>
              <p className="mt-1 text-3xl font-bold">{formatNumber(result.rescuedLeadsPerMonth, 1)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-300">Potenzieller Zusatzumsatz pro Monat</p>
              <p className="mt-1 text-3xl font-bold">{formatChf(result.monthlyRevenue)}</p>
            </div>
            <div className="border-t border-white/10 pt-5">
              <p className="text-sm text-slate-300">Potenzieller Zusatzumsatz pro Jahr</p>
              <p className="mt-1 text-3xl font-bold text-emerald-300">{formatChf(result.yearlyRevenue)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
