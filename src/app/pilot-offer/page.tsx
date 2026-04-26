import Link from "next/link";
import { PrintButton } from "@/components/PrintButton";

const includedItems = [
  "Missed-Call-Recovery Flow simuliert/konfiguriert",
  "Branchenlogik für Garage",
  "Lead-Erfassung und Qualifizierung",
  "Tages- oder Wochenübersicht",
  "Handlungsempfehlung pro Lead",
  "14 Tage Auswertung",
];

const requiredItems = [
  "Firmenname",
  "Hauptnummer",
  "typische Anfragearten",
  "gewünschte Kontaktmethode",
  "Ansprechpartner",
];

export default function PilotOfferPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0">
      <section className="print-page mx-auto max-w-5xl rounded-lg border border-swiss-line bg-white p-6 shadow-soft sm:p-8 print:border-0 print:shadow-none">
        <div className="flex flex-col justify-between gap-5 border-b border-swiss-line pb-6 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Pilot-Angebot</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
              LeadLeak AI – 14-Tage Pilot für Garagen
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-600">
              Eine klare Testphase, um verpasste Anfragen sichtbar zu machen und strukturiert zurückzuholen.
            </p>
          </div>
          <PrintButton />
        </div>

        <div className="grid gap-6 py-6 lg:grid-cols-2">
          <article className="rounded-lg border border-swiss-line bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-navy-950">A) Ziel</h2>
            <p className="mt-3 leading-7 text-slate-700">
              Verpasste Anrufe und liegengebliebene Anfragen strukturiert zurückholen.
            </p>
          </article>

          <article className="rounded-lg border border-swiss-line bg-navy-950 p-5 text-white">
            <h2 className="text-lg font-semibold">C) Pilot-Preis</h2>
            <p className="mt-4 text-3xl font-bold">CHF 490 Setup einmalig</p>
            <p className="mt-3 leading-7 text-slate-300">Danach optional CHF 690/Monat bei Weiterführung</p>
          </article>

          <article className="rounded-lg border border-swiss-line bg-white p-5">
            <h2 className="text-lg font-semibold text-navy-950">B) Enthalten</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              {includedItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-swiss-green" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-lg border border-swiss-line bg-white p-5">
            <h2 className="text-lg font-semibold text-navy-950">E) Was wir brauchen</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              {requiredItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-swiss-green" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="grid gap-6 border-t border-swiss-line pt-6 lg:grid-cols-2">
          <article className="rounded-lg border border-swiss-line bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-navy-950">D) Keine langfristige Bindung</h2>
            <p className="mt-3 leading-7 text-slate-700">
              Nach 14 Tagen entscheidet der Betrieb, ob das System weitergeführt wird.
            </p>
          </article>

          <article className="rounded-lg border border-emerald-200 bg-swiss-mint p-5">
            <h2 className="text-lg font-semibold text-navy-950">F) Erwartetes Ergebnis</h2>
            <p className="mt-3 leading-7 text-slate-700">
              Mehr Struktur, schnellere Rückmeldung und bessere Chance, verpasste Anfragen zurückzugewinnen.
            </p>
          </article>
        </div>

        <div className="no-print mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/audit"
            className="rounded-md bg-swiss-green px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            Lead-Audit starten
          </Link>
          <Link
            href="/sales-script"
            className="rounded-md border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-navy-950 transition hover:bg-slate-50"
          >
            Zurück zum Leitfaden
          </Link>
        </div>
      </section>
    </main>
  );
}
