import { CopyButton } from "@/components/CopyButton";
import { SalesShell } from "../components";

const templates = [
  {
    title: "Nach Cold Call",
    subject: "Kurze Demo zu verpassten Anfragen",
    body: `Grüezi Herr/Frau [Name]

Danke für das kurze Gespräch. Wie besprochen: LeadLeak AI hilft Servicebetrieben, verpasste oder unstrukturierte Anfragen sichtbar zu machen, zu priorisieren und schneller nachzufassen.

Hier der Demo-Link:
[Link]

Freundliche Grüsse
[Name]`,
  },
  {
    title: "Demo-Einladung",
    subject: "LeadLeak AI – 10-Minuten Demo",
    body: `Grüezi Herr/Frau [Name]

Gerne zeige ich Ihnen in 10 Minuten, wie LeadLeak AI verpasste oder unstrukturierte Anfragen sichtbar macht und als Cockpit für Rückmeldungen aufbereitet.

Vorschlag für den Termin:
[Datum / Uhrzeit]

Freundliche Grüsse
[Name]`,
  },
  {
    title: "Follow-up nach Demo",
    subject: "Ihr möglicher LeadLeak Pilot",
    body: `Grüezi Herr/Frau [Name]

Danke für die kurze Demo. Der nächste sinnvolle Schritt wäre eine fokussierte Pilotphase, damit wir mit echten Anfragen sehen, ob LeadLeak AI für Ihren Betrieb Nutzen schafft.

Ich würde den Pilot schlank aufsetzen: Erfassungslink, Lead-Übersicht, Priorisierung und Auswertung für das Abschlussgespräch.

Freundliche Grüsse
[Name]`,
  },
  {
    title: "Pilot-Angebot",
    subject: "Vorschlag für einen LeadLeak Pilot",
    body: `Grüezi Herr/Frau [Name]

Mein Vorschlag: Wir starten mit einer klar begrenzten Pilotphase. Ziel ist, Anfragen sichtbar zu machen, Rückmeldungen sauberer zu organisieren und nach kurzer Zeit eine nachvollziehbare Auswertung zu haben.

Pilot-Setup ab CHF 490. Eine Weiterführung erfolgt nur, wenn der Nutzen für den Betrieb sichtbar ist.

Freundliche Grüsse
[Name]`,
  },
  {
    title: "Keine Antwort",
    subject: "Kurze Nachfrage zu LeadLeak AI",
    body: `Grüezi Herr/Frau [Name]

Ich wollte kurz nachfragen, ob eine 10-Minuten Demo zu LeadLeak AI für Sie noch interessant ist.

Es geht nicht um ein grosses IT-Projekt, sondern um eine schlanke Pilotphase für sichtbarere Anfragen und klarere Rückmeldungen.

Freundliche Grüsse
[Name]`,
  },
];

export default function EmailTemplatesPage() {
  return (
    <SalesShell title="E-Mail-Vorlagen" subtitle="Kurze, professionelle Vorlagen für Nachfassen und Pilotgespräche.">
      <div className="grid gap-5 lg:grid-cols-2">
        {templates.map((template) => {
          const fullText = `Betreff: ${template.subject}\n\n${template.body}`;

          return (
            <section key={template.title} className="premium-card p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">{template.title}</p>
                  <h2 className="mt-2 text-xl font-semibold text-navy-950">{template.subject}</h2>
                </div>
                <CopyButton
                  text={fullText}
                  label="Vorlage kopieren"
                  copiedLabel="Kopiert"
                  className="rounded-md bg-swiss-green px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
                />
              </div>
              <pre className="mt-5 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 font-sans text-sm leading-7 text-slate-700">
                {template.body}
              </pre>
            </section>
          );
        })}
      </div>
    </SalesShell>
  );
}
