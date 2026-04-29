import Link from "next/link";
import { GarageRoiCalculator } from "@/components/GarageRoiCalculator";
import { garageLeads } from "@/lib/mockData";

const processSteps = [
  "Verpasster Anruf wird erkannt",
  "Strukturierte Rückmeldung fragt das Anliegen ab",
  "Kunde bestätigt Bedarf und Dringlichkeit",
  "Werkstatt erhält einen qualifizierten Lead",
];

export default function GaragePage() {
  return (
    <main className="premium-page">
      <section className="premium-surface text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="animate-fade-slide">
            <p className="premium-eyebrow-dark">Garage Demo</p>
            <h1 className="premium-title-dark mt-5 max-w-4xl text-4xl sm:text-5xl">
              Wie viele Werkstatt-Aufträge verlieren Sie durch verpasste Anrufe?
            </h1>
            <p className="premium-muted-dark mt-6 max-w-2xl text-lg">
              LeadLeak AI macht verpasste Werkstatt-Anfragen im Pilot sichtbar, strukturiert die Rückmeldung und zeigt,
              welche Kontakte eine klare nächste Aktion brauchen.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/audit"
                className="premium-button-primary px-5 py-3 text-center text-sm"
              >
                Lead-Audit buchen
              </Link>
              <Link
                href="/demo"
                className="premium-button-secondary px-5 py-3 text-center text-sm text-white"
              >
                Dashboard ansehen
              </Link>
            </div>
          </div>

          <div className="premium-card animate-fade-slide animate-delay-2 p-4 text-navy-950">
            <div className="rounded-md bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Vom Anruf zum Termin</p>
              <div className="mt-5 space-y-3">
                {processSteps.map((step, index) => (
                  <div key={step} className="card-hover flex gap-3 rounded-md border border-slate-200 bg-white p-4">
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

      <section className="animate-fade-slide mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <GarageRoiCalculator />
      </section>

      <section className="border-y border-swiss-line bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="premium-eyebrow">Garage Lead-Beispiele</p>
            <h2 className="premium-title mt-3 text-3xl">
              Typische Anfragen, die sonst in der Anrufliste liegen bleiben.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Für die Demo sind alle Fälle lokal simuliert: keine SMS, keine E-Mail und keine externe Schnittstelle.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {garageLeads.map((lead) => (
              <article key={lead.id} className="premium-card card-hover p-5">
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
