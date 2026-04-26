"use client";

import { FormEvent, useState } from "react";
import { auditIndustries, type AuditIndustry, formatChf, getEstimatedOrderValue } from "@/lib/audit";

type SubmitResult = {
  message: string;
  summary: string;
  estimatedOrderValueChf: number;
  estimatedMonthlyPotentialChf: number;
};

export function AuditForm() {
  const [company, setCompany] = useState("Garage Muster AG");
  const [industry, setIndustry] = useState<AuditIndustry>("Garage");
  const [contact, setContact] = useState("Thomas Berger");
  const [phone, setPhone] = useState("+41 79 555 21 10");
  const [email, setEmail] = useState("thomas.berger@example.ch");
  const [missedCalls, setMissedCalls] = useState(12);
  const [problem, setProblem] = useState(
    "Wir verpassen Anrufe während Probefahrten und wenn alle am Empfang besetzt sind.",
  );
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const averageValue = getEstimatedOrderValue(industry);

  function resetFeedback() {
    setResult(null);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/audit-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: company,
          industry,
          contactPerson: contact,
          phone,
          email,
          missedCallsPerWeek: missedCalls,
          currentProblem: problem,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Audit-Anfrage konnte nicht gespeichert werden.");
        return;
      }

      setResult(data);
    } catch {
      setError("Verbindung fehlgeschlagen. Bitte später erneut versuchen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <form onSubmit={handleSubmit} className="rounded-lg border border-swiss-line bg-white p-6 shadow-soft">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">Firmenname</span>
            <input
              value={company}
              onChange={(event) => {
                setCompany(event.target.value);
                resetFeedback();
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">Branche</span>
            <select
              value={industry}
              onChange={(event) => {
                setIndustry(event.target.value as AuditIndustry);
                resetFeedback();
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
            >
              {auditIndustries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">Kontaktperson</span>
            <input
              value={contact}
              onChange={(event) => {
                setContact(event.target.value);
                resetFeedback();
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">Telefonnummer</span>
            <input
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                resetFeedback();
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">E-Mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                resetFeedback();
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
              required
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">Geschätzte verpasste Anrufe pro Woche</span>
            <input
              type="number"
              min="0"
              value={missedCalls}
              onChange={(event) => {
                setMissedCalls(Number(event.target.value));
                resetFeedback();
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
              required
            />
          </label>
        </div>
        <label className="mt-5 block space-y-2">
          <span className="text-sm font-semibold text-navy-950">Aktuelles Problem</span>
          <textarea
            value={problem}
            onChange={(event) => {
              setProblem(event.target.value);
              resetFeedback();
            }}
            rows={5}
            className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 rounded-md bg-swiss-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Wird gespeichert..." : "Lead-Audit buchen"}
        </button>
      </form>

      <aside className="rounded-lg border border-swiss-line bg-navy-950 p-6 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Audit-Anfrage</p>
        {result ? (
          <div className="mt-6 space-y-5">
            <div className="rounded-md bg-swiss-mint p-4 text-navy-950">
              <p className="font-semibold">{result.message}</p>
              <p className="mt-2 text-sm leading-6">{result.summary}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Gespeicherte Schätzung</p>
              <p className="mt-2 leading-6">Ø Auftragswert: {formatChf(result.estimatedOrderValueChf)}</p>
              <p className="mt-1 leading-6">
                Monatliches Potenzial: {formatChf(result.estimatedMonthlyPotentialChf)}
              </p>
              <p className="mt-3 text-sm text-slate-300">
                Kontakt: {contact}, {company}, {phone}, {email}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 border-t border-white/10 pt-6 text-sm leading-6 text-slate-300">
            <p>
              Standardwert für {industry}: {formatChf(averageValue)} durchschnittlicher Auftragswert.
            </p>
            <p className="mt-3">
              Nach dem Absenden wird die Anfrage serverseitig validiert und in Supabase gespeichert.
            </p>
          </div>
        )}
        {error ? (
          <div className="mt-5 rounded-md border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {error}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
