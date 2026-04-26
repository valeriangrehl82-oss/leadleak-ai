import Link from "next/link";
import { GarageRoiCalculator } from "@/components/GarageRoiCalculator";
import { garageLeads } from "@/lib/mockData";

const processSteps = [
  "Verpasster Anruf wird erkannt",
  "Automatische Rückmeldung fragt das Anliegen ab",
  "Kunde bestätigt Bedarf und Dringlichkeit",
  "Werkstatt erhält einen qualifizierten Lead",
];

export default function GaragePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-navy-950 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Garage Demo</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
              Wie viele Werkstatt-Aufträge verlieren Sie durch verpasste Anrufe?
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              LeadLeak AI reagiert automatisch, wenn niemand ans Telefon geht, qualifiziert den Kunden und macht aus
              verpassten Anrufen buchbare Werkstatt-Termine.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/audit"
                className="rounded-md bg-swiss-green px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
              >
                Lead-Audit buchen
              </Link>
              <Link
                href="/demo"
                className="rounded-md border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Dashboard ansehen
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white p-4 text-navy-950 shadow-soft">
            <div className="rounded-md bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Vom Anruf zum Termin</p>
              <div className="mt-5 space-y-3">
                {processSteps.map((step, index) => (
                  <div key={step} className="flex gap-3 rounded-md border border-slate-200 bg-white p-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-swiss-green text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium leading-6 text-slate-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <GarageRoiCalculator />
      </section>

      <section className="border-y border-swiss-line bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Garage Lead-Beispiele</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">
              Typische Anfragen, die sonst in der Anrufliste liegen bleiben.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Für die Demo sind alle Fälle lokal simuliert: keine SMS, keine E-Mail und keine externe Schnittstelle.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {garageLeads.map((lead) => (
              <article key={lead.id} className="rounded-lg border border-swiss-line bg-slate-50 p-5 shadow-soft">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-navy-950">{lead.anfrage}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {lead.name} · {lead.phone}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-navy-950 ring-1 ring-slate-200">
                    {lead.value}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-700">{lead.summary}</p>
                <div className="mt-4 rounded-md bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nächste Aktion</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{lead.recommendedAction}</p>
                </div>
                <div className="mt-3 rounded-md border border-emerald-200 bg-swiss-mint p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Antwortvorschlag</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{lead.suggestedMessage}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
