"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { auditIndustries, type AuditIndustry, formatChf, getEstimatedOrderValue } from "@/lib/audit";

type SubmitResult = {
  message: string;
  summary: string;
  estimatedOrderValueChf: number;
  estimatedMonthlyPotentialChf: number;
};

export function AuditForm() {
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState<AuditIndustry>("Garage");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [missedCalls, setMissedCalls] = useState(0);
  const [problem, setProblem] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const averageValue = getEstimatedOrderValue(industry);

  function resetFeedback() {
    setResult(null);
    setError("");
  }

  function resetForNewRequest() {
    setCompany("");
    setIndustry("Garage");
    setContact("");
    setPhone("");
    setEmail("");
    setMissedCalls(0);
    setProblem("");
    setResult(null);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setResult(null);

    if (!phone.trim() && !email.trim()) {
      setError("Bitte Telefonnummer oder E-Mail angeben.");
      setIsSubmitting(false);
      return;
    }

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

  if (result) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <section className="premium-card border-emerald-200 p-6">
          <div className="flex items-start gap-4">
            <span className="metric-glow flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-swiss-green text-lg font-bold text-white">
              ✓
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Gespeichert</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy-950">
                Audit-Anfrage erfolgreich gesendet
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Wir prüfen Ihre Angaben und melden uns für die nächste Einschätzung.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Firma", company],
              ["Branche", industry],
              ["Kontakt", contact || "-"],
              ["Telefon", phone || "-"],
              ["E-Mail", email || "-"],
              ["Verpasste Anrufe/Woche", String(missedCalls)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-2 font-semibold text-navy-950">{value || "-"}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-md border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Audit-Zusammenfassung</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{result.summary}</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={resetForNewRequest}
              className="ui-lift rounded-md bg-swiss-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              Neue Anfrage erfassen
            </button>
            <Link
              href="/"
              className="ui-lift rounded-md border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-navy-950 transition hover:bg-slate-50"
            >
              Zur Startseite
            </Link>
          </div>
        </section>

        <aside className="premium-card-dark p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Nächster Schritt</p>
          <h3 className="mt-3 text-2xl font-semibold">10-Minuten Einschätzung vorbereiten</h3>
          <div className="mt-6 space-y-4 text-sm leading-6 text-slate-200">
            <p>Ø Auftragswert: {formatChf(result.estimatedOrderValueChf)}</p>
            <p>Geschätztes monatliches Potenzial: {formatChf(result.estimatedMonthlyPotentialChf)}</p>
            <p className="rounded-md border border-white/10 bg-white/5 p-4">
              Alle Beträge sind Schätzwerte auf Basis eingegebener oder beispielhafter Annahmen. Sie stellen keine
              Umsatzgarantie dar.
            </p>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.78fr]">
      <form
        onSubmit={handleSubmit}
        className="premium-card p-6"
      >
        <div className="border-b border-slate-100 pb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Audit-Daten</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy-950">Betrieb und Anfragepotenzial erfassen</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Je grober die Schätzung, desto besser. Ziel ist eine erste Potenzialanalyse, keine perfekte Datenerhebung.
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">Unternehmen</span>
            <input
              value={company}
              onChange={(event) => {
                setCompany(event.target.value);
                resetFeedback();
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition focus:border-swiss-green focus:ring-2"
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
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition focus:border-swiss-green focus:ring-2"
            >
              {auditIndustries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">Kontaktperson <span className="font-normal text-slate-500">(optional)</span></span>
            <input
              value={contact}
              onChange={(event) => {
                setContact(event.target.value);
                resetFeedback();
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition focus:border-swiss-green focus:ring-2"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">Telefon <span className="font-normal text-slate-500">(Telefon oder E-Mail)</span></span>
            <input
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                resetFeedback();
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition focus:border-swiss-green focus:ring-2"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">E-Mail <span className="font-normal text-slate-500">(Telefon oder E-Mail)</span></span>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                resetFeedback();
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition focus:border-swiss-green focus:ring-2"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-navy-950">Geschätzte verpasste Anfragen pro Woche</span>
            <input
              type="number"
              min="0"
              value={missedCalls}
              onChange={(event) => {
                setMissedCalls(Number(event.target.value));
                resetFeedback();
              }}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition focus:border-swiss-green focus:ring-2"
              required
            />
          </label>
        </div>
        <label className="mt-5 block space-y-2">
          <span className="text-sm font-semibold text-navy-950">Aktuelles Problem <span className="font-normal text-slate-500">(optional)</span></span>
          <textarea
            value={problem}
            onChange={(event) => {
              setProblem(event.target.value);
              resetFeedback();
            }}
            rows={5}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none ring-swiss-green transition focus:border-swiss-green focus:ring-2"
          />
        </label>
        <p className="mt-4 text-xs leading-5 text-slate-500">
          Mit Klick auf «Audit anfragen» akzeptieren Sie die Bearbeitung Ihrer Angaben gemäss{" "}
          <Link href="/datenschutz" className="font-semibold text-swiss-green hover:text-emerald-700">
            Datenschutzerklärung
          </Link>
          .
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="ui-lift mt-6 rounded-md bg-swiss-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? "Wird gespeichert..." : "Audit anfragen"}
        </button>
        {error ? (
          <div className="mt-5 rounded-md border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {error}
          </div>
        ) : null}
      </form>

      <aside className="premium-card-dark p-6 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Live-Einschätzung</p>
        <h2 className="mt-3 text-2xl font-semibold">Was der Audit vorbereitet</h2>
        <div className="mt-6 space-y-4">
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Branchenwert</p>
            <p className="mt-2 text-lg font-semibold">Ø {formatChf(averageValue)} pro Anfrage</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Standardwert für {industry}.</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Auswertung</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Nach dem Absenden wird die Anfrage serverseitig validiert und als Audit-Anfrage gespeichert.
            </p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Nächster Schritt</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Wir bereiten daraus eine kurze Einschätzung für ein Pilotgespräch vor.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
