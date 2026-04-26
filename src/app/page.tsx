import Link from "next/link";
import { PricingCards } from "@/components/PricingCards";

const audiences = ["Garagen", "Reinigungsfirmen", "Umzugsfirmen", "Handwerker"];

export default function HomePage() {
  return (
    <main>
      <section className="bg-navy-950 text-white">
        <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Lead-Recovery für Schweizer KMU
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Verpasste Anrufe kosten Schweizer Betriebe jeden Monat bares Geld.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              LeadLeak AI reagiert automatisch auf verpasste Anrufe und verwandelt verlorene Anfragen in qualifizierte
              Leads, ohne neues Personal.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="rounded-md bg-swiss-green px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
              >
                Demo ansehen
              </Link>
              <Link
                href="/audit"
                className="rounded-md border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Kostenlosen Lead-Audit buchen
              </Link>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white p-4 text-navy-950 shadow-soft">
            <div className="rounded-md bg-slate-50 p-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Potenziell gerettet</p>
                  <p className="mt-1 text-3xl font-bold">CHF 2’500</p>
                </div>
                <span className="rounded-full bg-swiss-mint px-3 py-1 text-sm font-semibold text-emerald-800">
                  +10 Leads
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  "09:12 Verpasster Anruf erkannt",
                  "09:13 Strukturierte Rückmeldung gesendet",
                  "09:16 Anfrage qualifiziert",
                  "09:28 Werkstatt-Termin gebucht",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-swiss-green" />
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Problem</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">
              Kunden rufen einfach den nächsten Anbieter an.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              Wenn niemand abnimmt, bleibt oft nur eine Nummer in der Anrufliste. Das Anliegen, die Dringlichkeit und
              der potenzielle Zusatzumsatz sind für den Betrieb nicht sichtbar.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Lösung</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">
              Automatische Rückmeldung per SMS, WhatsApp oder E-Mail.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              LeadLeak AI fragt die wichtigsten Details ab, priorisiert verpasste Anfragen und zeigt dem Team den
              nächsten sinnvollen Schritt.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-swiss-line bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Für wen</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">
            Für lokale Betriebe, die Anfragen nicht dem Zufall überlassen wollen.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((audience) => (
              <div key={audience} className="rounded-lg border border-swiss-line bg-white p-5 font-semibold shadow-soft">
                {audience}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">ROI Beispiel</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">
              10 gerettete Leads × CHF 250 = CHF 2’500 potenzieller Zusatzumsatz.
            </h2>
          </div>
          <div className="rounded-lg bg-navy-950 p-8 text-white">
            <p className="text-lg leading-8 text-slate-200">
              Für viele KMU reicht schon ein kleiner Rückgewinnungsanteil, damit sich strukturierte Rückmeldung rechnet.
              Der Demo-Fokus liegt deshalb auf messbaren verpassten Anfragen und klaren nächsten Aktionen.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Pricing Teaser</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">
                Einfache Pakete für die Pilotphase.
              </h2>
            </div>
            <Link href="/pricing" className="text-sm font-semibold text-swiss-green hover:text-emerald-700">
              Preise ansehen
            </Link>
          </div>
          <PricingCards />
        </div>
      </section>
    </main>
  );
}
