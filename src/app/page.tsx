import Link from "next/link";
import { LeadDnaBars, LeadDnaCore, LeadDnaPrivacyNote } from "@/components/LeadDnaVisual";
import { PricingCards } from "@/components/PricingCards";
import { getLeadDnaProfile } from "@/lib/leadDna";

const audiences = ["Garagen", "Reinigungsfirmen", "Umzugsfirmen", "Handwerker"];

const missedCallItems = [
  ["08:42", "Verpasster Anruf", "Garage Keller, Reifenwechsel"],
  ["09:15", "Rückfrage gesendet", "Anliegen und Dringlichkeit geklärt"],
  ["10:03", "Anfrage erfasst", "MFK-Vorbereitung, CHF 680"],
  ["10:21", "Lead priorisiert", "Bremsen quietschen, hohe Dringlichkeit"],
];

const leadDnaDemoProfile = getLeadDnaProfile({
  customer_name: "Nina Baumann",
  request_type: "Bremsen quietschen",
  message: "Es quietscht beim Bremsen, vor allem innerorts. Ich möchte es rasch anschauen lassen.",
  status: "qualified",
  estimated_value_chf: 720,
  created_at: new Date().toISOString(),
});

export default function HomePage() {
  return (
    <main>
      <section className="bg-navy-950 text-white">
        <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <div className="animate-fade-slide">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Pilot-System für Schweizer Servicebetriebe
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Verpasste Anrufe kosten Schweizer Betriebe jeden Monat bares Geld.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              LeadLeak AI hilft Garagen, Reinigungsfirmen, Umzugsfirmen und Handwerksbetrieben dabei, verpasste
              Anfragen sichtbar zu machen, strukturiert zu erfassen und schneller zurückzumelden – ohne Wechsel der
              bestehenden Telefonnummer.
            </p>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-emerald-200">
              Für eine fokussierte Pilotphase mit klarer Lead-Auswertung und strukturierten Rückmeldeprozessen.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="ui-lift rounded-md bg-swiss-green px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
              >
                Demo ansehen
              </Link>
              <Link
                href="/audit"
                className="ui-lift rounded-md border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Kostenlosen Lead-Audit buchen
              </Link>
            </div>
          </div>

          <div className="animate-fade-slide animate-delay-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="rounded-lg border border-white/10 bg-navy-900 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Pilot-Übersicht</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Verpasste Anfragen</h2>
                </div>
                <span className="metric-glow rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-200">
                  Pilotphase
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  "+10 Leads sichtbar gemacht",
                  "CHF 2’500 Potenzial",
                ].map((item) => (
                  <div key={item} className="metric-glow rounded-md border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                {missedCallItems.map(([time, title, text], index) => (
                  <div
                    key={`${time}-${title}`}
                    className={`animate-fade-slide animate-delay-${Math.min(index, 3)} flex gap-3 rounded-md border border-white/10 bg-white p-4 text-navy-950`}
                  >
                    <span className="shrink-0 text-xs font-semibold text-slate-500">{time}</span>
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="mt-1 text-sm leading-5 text-slate-600">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="card-hover rounded-lg border border-slate-200 p-7">
            <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Problem</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">
              Kunden rufen einfach den nächsten Anbieter an.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              Wenn niemand abnimmt, bleibt oft nur eine Nummer in der Anrufliste. Das Anliegen, die Dringlichkeit und
              der potenzielle Zusatzumsatz sind für den Betrieb nicht sichtbar.
            </p>
          </div>
          <div className="card-hover rounded-lg border border-slate-200 p-7">
            <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Lösung</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">
              Strukturierte Rückmeldung und klare Lead-Auswertung.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              LeadLeak AI sammelt die wichtigsten Details, macht verpasste Anfragen nachvollziehbar und zeigt dem Team
              den nächsten sinnvollen Schritt für den Pilotbetrieb.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-navy-950 py-16 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div className="animate-fade-slide">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Business Plus</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Lead DNA erkennt, welche Anfrage wirklich Priorität hat.
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-slate-300">
              Nicht jede Anfrage ist gleich. Lead DNA übersetzt Wert, Dringlichkeit, Rückmelde-Risiko und
              Rückmelde-Druck in ein visuelles Profil.
            </p>
            <div className="mt-6 inline-flex rounded-full border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
              Exklusiv in Business Plus
            </div>
            <div className="mt-5 max-w-2xl">
              <LeadDnaPrivacyNote publicShort />
            </div>
          </div>

          <div className="animate-fade-slide animate-delay-1 rounded-xl border border-white/10 bg-white/[0.03] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="rounded-lg border border-white/10 bg-navy-900 p-5">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Beispielprofil</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Nina Baumann</h3>
                  <p className="mt-1 text-sm text-slate-400">Bremsen quietschen, geschätzter Wert CHF 720</p>
                </div>
                <span className="metric-glow rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-200">
                  {leadDnaDemoProfile.highlightBadge}
                </span>
              </div>
              <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
                <LeadDnaCore profile={leadDnaDemoProfile} compact />
                <LeadDnaBars profile={leadDnaDemoProfile} />
              </div>
            </div>
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
              <div key={audience} className="card-hover rounded-lg border border-slate-200 bg-white p-5 font-semibold shadow-[0_12px_32px_rgba(7,17,31,0.06)]">
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
              10 sichtbare Leads × CHF 250 = CHF 2’500 potenzielles Anfragevolumen.
            </h2>
          </div>
          <div className="rounded-lg bg-navy-950 p-8 text-white shadow-[0_18px_55px_rgba(7,17,31,0.16)]">
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
              <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Preise</p>
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
