import Link from "next/link";
import { requireAdminPage } from "@/lib/adminGuard";

const beforeCall = [
  "Garage-Name notiert",
  "Website geöffnet",
  "Telefonnummer bereit",
  "Ansprechpartner falls vorhanden",
  "/garage geöffnet",
  "/sales-script geöffnet",
  "/pilot-offer geöffnet",
  "Ziel des Calls: 10-Minuten-Demo oder 14-Tage-Pilot",
];

const coreQuestions = [
  "Wie viele Anrufe verpassen Sie ungefähr pro Woche?",
  "Was passiert aktuell mit diesen verpassten Anrufen?",
  "Welche Anfragen sind für Sie am wertvollsten?",
  "Wie schnell reagieren Sie normalerweise auf Rückrufe?",
  "Wäre ein 14-Tage-Test interessant, wenn der Aufwand für Sie minimal bleibt?",
];

const closingOptions = [
  {
    title: "A) Starkes Interesse",
    action: "Direkt /audit ausfüllen und Pilot anbieten.",
  },
  {
    title: "B) Unsicher",
    action: "Kurze Demo zeigen und danach /pilot-offer öffnen.",
  },
  {
    title: "C) Kein Interesse",
    action: "Sauber bedanken und fragen, ob man in 3 Monaten nochmals nachfragen darf.",
  },
];

const afterCall = [
  "Ergebnis notieren",
  "Interesse-Level festhalten: Hoch / Mittel / Niedrig",
  "Nächste Aktion definieren",
  "Follow-up Datum setzen",
  "Falls interessiert: Pilot-Angebot senden",
];

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
          <span className="mt-1.5 h-4 w-4 shrink-0 rounded border border-slate-300 bg-white" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function CallChecklistPage() {
  await requireAdminPage();

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-swiss-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Sales Vorbereitung</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
            Sales-Call Checkliste für Garagen
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Eine einfache Seite für Vorbereitung, Gesprächsführung und sauberes Follow-up beim Telefonat mit einem
            Schweizer Garagebetrieb.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/garage"
              className="rounded-md bg-swiss-green px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              Garage Demo öffnen
            </Link>
            <Link
              href="/sales-script"
              className="rounded-md border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-navy-950 transition hover:bg-slate-50"
            >
              Leitfaden öffnen
            </Link>
            <Link
              href="/pilot-offer"
              className="rounded-md border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-navy-950 transition hover:bg-slate-50"
            >
              Pilot-Angebot öffnen
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-lg border border-swiss-line bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-navy-950">1. Vor dem Anruf</h2>
            <Checklist items={beforeCall} />
          </article>

          <article className="rounded-lg border border-swiss-line bg-navy-950 p-6 text-white shadow-soft">
            <h2 className="text-xl font-semibold">2. Gesprächsziel</h2>
            <p className="mt-5 text-lg leading-8 text-slate-200">
              Das Ziel ist nicht, die ganze App zu erklären. Das Ziel ist, herauszufinden, ob verpasste Anrufe ein
              echtes Problem sind und ob ein 14-Tage-Pilot sinnvoll ist.
            </p>
          </article>

          <article className="rounded-lg border border-swiss-line bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-navy-950">3. 5 Kernfragen</h2>
            <ol className="mt-5 space-y-3">
              {coreQuestions.map((question, index) => (
                <li key={question} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-swiss-green text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span>{question}</span>
                </li>
              ))}
            </ol>
          </article>
        </div>

        <article className="mt-6 rounded-lg border border-swiss-line bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-navy-950">4. Abschlussoptionen</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {closingOptions.map((option) => (
              <div key={option.title} className="rounded-md border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-semibold text-navy-950">{option.title}</h3>
                <p className="mt-3 text-sm font-semibold text-slate-500">Nächste Aktion</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{option.action}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="mt-6 rounded-lg border border-swiss-line bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-navy-950">5. Nach dem Anruf</h2>
          <Checklist items={afterCall} />
        </article>
      </section>
    </main>
  );
}
