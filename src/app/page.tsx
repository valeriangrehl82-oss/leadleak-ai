import Link from "next/link";
import { LeadDnaBars, LeadDnaCore, LeadDnaPrivacyNote } from "@/components/LeadDnaVisual";
import { PricingCards } from "@/components/PricingCards";
import { getLeadDnaProfile } from "@/lib/leadDna";

const audiences = ["Garagen", "Reinigungsfirmen", "Umzugsfirmen", "Handwerker"];

const recoveryTimeline = [
  "09:12 Verpasster Anruf erkannt",
  "09:13 Strukturierte Rückmeldung gesendet",
  "09:16 Anfrage qualifiziert",
  "09:28 Werkstatt-Termin vorbereitet",
];

const whyCards = [
  {
    title: "Anfragen sichtbar machen",
    text: "Verpasste oder manuell erfasste Anfragen werden strukturiert abgelegt.",
  },
  {
    title: "Prioritäten erkennen",
    text: "Lead DNA hilft, wichtige Anfragen nach Auftragswert, Dringlichkeit und Nachfassbedarf einzuordnen.",
  },
  {
    title: "Pilot auswerten",
    text: "Betriebe sehen, welche Anfragen eingegangen sind und welches Potenzial sichtbar wurde.",
  },
];

const operatingSituations = [
  {
    title: "Telefon klingelt während Probefahrt",
    text: "Der Kontakt geht nicht im Alltag unter, sondern wird als Anfrage mit Rückmeldebedarf sichtbar.",
  },
  {
    title: "Anruf ausserhalb der Öffnungszeiten",
    text: "Aus einem verpassten Kontaktpunkt entsteht eine strukturierte Grundlage für den nächsten Arbeitstag.",
  },
  {
    title: "Rückruf wird im Tagesgeschäft vergessen",
    text: "Status, Anfrageart und nächste Aktion helfen dem Team, offene Rückmeldungen nachzuvollziehen.",
  },
  {
    title: "Anfrage landet auf einem Notizzettel",
    text: "Wichtige Informationen werden zentral erfasst und können später ausgewertet werden.",
  },
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
        <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <div className="animate-fade-slide">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              LEAD-RECOVERY FÜR SCHWEIZER KMU
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Verpasste Anrufe kosten Schweizer Betriebe jeden Monat bares Geld.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              LeadLeak AI hilft Servicebetrieben, verpasste Anfragen sichtbar zu machen, zu strukturieren und schneller
              nachzufassen – ohne neues Personal und ohne Wechsel der bestehenden Telefonnummer.
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

          <div className="animate-fade-slide animate-delay-2">
            <div className="rounded-2xl border border-white/10 bg-white p-6 text-navy-950 shadow-[0_28px_90px_rgba(0,0,0,0.32)]">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Potentiell gerettet</p>
                  <p className="mt-2 text-4xl font-bold tracking-tight">CHF 2’500</p>
                </div>
                <span className="metric-glow rounded-full border border-emerald-200 bg-swiss-mint px-3 py-1 text-sm font-semibold text-emerald-800">
                  +10 Leads
                </span>
              </div>

              <div className="mt-7 space-y-4">
                {recoveryTimeline.map((item, index) => {
                  const [time, ...textParts] = item.split(" ");
                  const text = textParts.join(" ");

                  return (
                    <div key={item} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-swiss-mint text-xs font-bold text-emerald-800">
                          {index + 1}
                        </span>
                        {index < recoveryTimeline.length - 1 ? <span className="h-7 w-px bg-emerald-100" /> : null}
                      </div>
                      <div className="pb-3">
                        <p className="text-xs font-semibold text-slate-500">{time}</p>
                        <p className="mt-1 text-sm font-semibold text-navy-950">{text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Aus einer verpassten Anfrage wird ein nachvollziehbarer Vorgang mit Kontext, Status und nächster Aktion.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Warum LeadLeak AI?</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
              Verpasste Rückmeldungen sind oft kein Vertriebsproblem, sondern ein Strukturproblem.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              Viele Schweizer Servicebetriebe verlieren keine Anfragen wegen schlechter Arbeit, sondern weil im Alltag
              Rückrufe untergehen: Telefon besetzt, niemand dokumentiert den Kontakt, oder die nächste Aktion ist unklar.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {whyCards.map((card) => (
              <article
                key={card.title}
                className="card-hover rounded-xl border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(7,17,31,0.07)]"
              >
                <h3 className="text-lg font-semibold text-navy-950">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-swiss-line bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Betriebsalltag</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
              Typische Situationen aus dem Betriebsalltag
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              LeadLeak AI macht nicht aus jedem Kontakt automatisch einen Auftrag. Es hilft dabei, Anfragepotenzial
              sichtbar und bearbeitbar zu machen.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {operatingSituations.map((situation) => (
              <article
                key={situation.title}
                className="card-hover rounded-xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_rgba(7,17,31,0.06)]"
              >
                <h3 className="font-semibold text-navy-950">{situation.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{situation.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-swiss-line bg-white py-16 text-navy-950">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div className="animate-fade-slide">
            <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Business Plus</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Lead DNA erkennt, welche Anfrage wirklich Priorität hat.
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-slate-600">
              Lead DNA macht aus jeder Anfrage ein visuelles Prioritätsprofil – mit Auftragswert, Dringlichkeit,
              Konkurrenzdruck, Nachfassbedarf und Anfragequalität.
            </p>
            <div className="mt-6 inline-flex rounded-full border border-emerald-200 bg-swiss-mint px-4 py-2 text-sm font-semibold text-emerald-800">
              Exklusiv in Business Plus
            </div>
            <div className="mt-5 max-w-2xl">
              <LeadDnaPrivacyNote tone="light" />
            </div>
          </div>

          <div className="animate-fade-slide animate-delay-1 rounded-xl border border-slate-200 bg-navy-950 p-3 shadow-[0_24px_80px_rgba(7,17,31,0.18)]">
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

      <section className="border-b border-swiss-line bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Für wen</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">
            Für lokale Betriebe, die Anfragen nicht dem Zufall überlassen wollen.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((audience) => (
              <div
                key={audience}
                className="card-hover rounded-lg border border-slate-200 bg-white p-5 font-semibold shadow-[0_12px_32px_rgba(7,17,31,0.06)]"
              >
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
