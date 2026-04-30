import Link from "next/link";
import { LeadDnaBars, LeadDnaCore, LeadDnaPrivacyNote } from "@/components/LeadDnaVisual";
import { PricingCards } from "@/components/PricingCards";
import { getLeadDnaProfile } from "@/lib/leadDna";

const audiences = ["Garagen", "Reinigungsfirmen", "Umzugsfirmen", "Handwerker"];

const trustStrip = [
  "Anfragen strukturiert erfassen",
  "Antwortvorschläge vorbereiten",
  "Prioritäten sichtbar machen",
  "Pilot-Auswertung bereitstellen",
];

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
      <section className="premium-surface text-white">
        <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <div className="animate-fade-slide">
            <p className="premium-eyebrow-dark">
              LEAD-RECOVERY FÜR SCHWEIZER SERVICEBETRIEBE
            </p>
            <h1 className="premium-title-dark mt-5 max-w-4xl text-4xl sm:text-5xl lg:text-6xl">
              Verpasste Anfragen sichtbar machen, bevor Umsatz verloren geht.
            </h1>
            <p className="premium-muted-dark mt-6 max-w-2xl text-lg">
              LeadLeak AI hilft Servicebetrieben, verlorene oder chaotische Anfragen strukturiert zu erfassen, zu
              priorisieren und schneller nachzufassen – ohne neues Personal und ohne Wechsel der bestehenden
              Telefonnummer.
            </p>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-emerald-200">
              Für eine fokussierte Pilotphase mit klarer Lead-Auswertung und strukturierten Rückmeldeprozessen.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/audit"
                className="premium-button-primary px-5 py-3 text-center text-sm"
              >
                Kostenlosen Lead-Audit buchen
              </Link>
              <Link
                href="/demo"
                className="premium-button-secondary px-5 py-3 text-center text-sm text-white"
              >
                Demo ansehen
              </Link>
            </div>
            <div className="mt-7 grid gap-2 sm:grid-cols-2">
              {trustStrip.map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-emerald-50"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="animate-fade-slide animate-delay-2">
            <div className="rounded-2xl border border-white/15 bg-white p-6 text-navy-950 shadow-[0_28px_90px_rgba(0,0,0,0.32)]">
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

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Priorität", "Hoch"],
                  ["Nächste Aktion", "Rückruf"],
                  ["Status", "Qualifiziert"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-bold text-navy-950">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-lg border border-emerald-200 bg-swiss-mint p-4 text-sm leading-6 text-emerald-950">
                Aus einer verpassten Anfrage wird ein nachvollziehbarer Vorgang mit Kontext, Status und nächster Aktion.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="premium-eyebrow">Warum LeadLeak AI?</p>
            <h2 className="premium-title mt-3 text-3xl sm:text-4xl">
              Verpasste Rückmeldungen sind oft kein Vertriebsproblem, sondern ein Strukturproblem.
            </h2>
            <p className="premium-muted mt-5">
              Viele Schweizer Servicebetriebe verlieren keine Anfragen wegen schlechter Arbeit, sondern weil im Alltag
              Rückrufe untergehen: Telefon besetzt, niemand dokumentiert den Kontakt, oder die nächste Aktion ist unklar.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {whyCards.map((card) => (
              <article
                key={card.title}
                className="premium-card card-hover p-6"
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
            <p className="premium-eyebrow">Betriebsalltag</p>
            <h2 className="premium-title mt-3 text-3xl sm:text-4xl">
              Typische Situationen aus dem Betriebsalltag
            </h2>
            <p className="premium-muted mt-5">
              LeadLeak AI macht nicht aus jedem Kontakt automatisch einen Auftrag. Es hilft dabei, Anfragepotenzial
              sichtbar und bearbeitbar zu machen.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {operatingSituations.map((situation) => (
              <article
                key={situation.title}
                className="premium-card card-hover p-5"
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
            <p className="premium-eyebrow">Business Plus</p>
            <h2 className="premium-title mt-3 text-3xl sm:text-4xl">
              Lead DNA erkennt, welche Anfrage wirklich Priorität hat.
            </h2>
            <p className="premium-muted mt-5 max-w-2xl">
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

          <div className="premium-card-dark animate-fade-slide animate-delay-1 p-3">
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
          <p className="premium-eyebrow">Für wen</p>
          <h2 className="premium-title mt-3 text-3xl">
            Für lokale Betriebe, die Anfragen nicht dem Zufall überlassen wollen.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((audience) => (
              <div
                key={audience}
                className="premium-card card-hover p-5 font-semibold"
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
            <p className="premium-eyebrow">ROI Beispiel</p>
            <h2 className="premium-title mt-3 text-3xl">
              10 sichtbare Leads × CHF 250 = CHF 2’500 potenzielles Anfragevolumen.
            </h2>
          </div>
          <div className="premium-card-dark p-8 text-white">
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
              <p className="premium-eyebrow">Preise</p>
              <h2 className="premium-title mt-3 text-3xl">
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
