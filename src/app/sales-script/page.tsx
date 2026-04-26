import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";

const introScript =
  "Guten Tag Herr/Frau [Name], ich mache es kurz: Ich helfe Garagen dabei, verpasste Anrufe automatisch zurückzuholen, bevor der Kunde zur nächsten Werkstatt geht. Ich zeige Ihnen in 5 Minuten, wie das aussehen würde.";

const pilotScript =
  "Mein Vorschlag: Wir testen das 14 Tage mit einem klaren Pilot-Setup. Sie sehen danach, wie viele Anfragen strukturiert zurückkommen. Wenn kein einziger relevanter Lead entsteht, stoppen wir sauber.";

const closingQuestion = "Wollen wir das für Ihre Garage als 14-Tage-Pilot aufsetzen?";

const sections = [
  {
    title: "A) Einstieg – 30 Sekunden",
    content: introScript,
    copy: introScript,
  },
  {
    title: "B) Problem sichtbar machen – 60 Sekunden",
    bullets: [
      "Wie viele Anrufe verpassen Sie ungefähr pro Woche?",
      "Was passiert heute mit diesen verpassten Anrufen?",
      "Wie schnell ruft ein Kunde Ihrer Meinung nach die nächste Garage an?",
    ],
  },
  {
    title: "C) ROI-Rechner zeigen – 90 Sekunden",
    bullets: [
      "Öffne /garage.",
      "Trage die verpassten Anrufe pro Woche ein.",
      "Nutze als durchschnittlichen Auftragswert CHF 250.",
      "Zeige das monatliche und jährliche Potenzial.",
    ],
  },
  {
    title: "D) Dashboard zeigen – 90 Sekunden",
    bullets: [
      "Öffne /demo.",
      "Zeige Vorher / Nachher.",
      "Zeige AI-Zusammenfassung und Antwortvorschlag.",
      "Betone: kein zusätzlicher Mitarbeiter nötig.",
    ],
  },
  {
    title: "E) Pilot-Angebot machen – 60 Sekunden",
    content: pilotScript,
    copy: pilotScript,
  },
  {
    title: "F) Abschlussfrage",
    content: closingQuestion,
    copy: closingQuestion,
  },
];

export default function SalesScriptPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-swiss-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Live Sales Call</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
            5-Minuten Demo-Leitfaden
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Für Live-Gespräche mit Schweizer Garagen
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/garage"
              className="rounded-md bg-swiss-green px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              Garage Demo öffnen
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

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-lg border border-swiss-line bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold text-navy-950">{section.title}</h2>
                {section.copy ? <CopyButton text={section.copy} /> : null}
              </div>
              {section.content ? (
                <p className="mt-4 rounded-md bg-slate-50 p-4 text-lg leading-8 text-navy-950">{section.content}</p>
              ) : null}
              {section.bullets ? (
                <ul className="mt-4 space-y-3 text-base leading-7 text-slate-700">
                  {section.bullets.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-swiss-green" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
