import { SalesShell } from "../components";

const objections = [
  {
    objection: "Wir rufen sowieso zurück.",
    short: "Gut. Dann geht es darum, ob jede Anfrage dokumentiert, priorisiert und auswertbar ist.",
    strong:
      "Das ist gut. Die Frage ist nicht nur, ob zurückgerufen wird, sondern ob jede Anfrage dokumentiert, priorisiert und später auswertbar ist.",
    next: "Wie sehen Sie heute, welche Rückrufe noch offen sind?",
  },
  {
    objection: "Wir haben schon ein CRM.",
    short: "Perfekt. LeadLeak ersetzt kein CRM, sondern macht vorher verlorene Anfragen sichtbar.",
    strong:
      "Perfekt. LeadLeak ersetzt kein vollständiges CRM, sondern macht genau die Anfragen sichtbar, die vorher oft gar nicht sauber im CRM landen.",
    next: "Welche Anfragen schaffen es heute überhaupt zuverlässig ins CRM?",
  },
  {
    objection: "Das klingt nach zusätzlicher Arbeit.",
    short: "Der Pilot ist bewusst schlank und soll Prioritäten klären, nicht neue Administration schaffen.",
    strong:
      "Der Pilot ist bewusst schlank. Ziel ist nicht mehr Administration, sondern weniger verlorene Rückmeldungen und klarere Prioritäten.",
    next: "Wo entsteht heute am meisten Aufwand bei Rückrufen?",
  },
  {
    objection: "Wir brauchen keine KI.",
    short: "Verständlich. Der Nutzen liegt in Struktur, Antwortvorschlägen und Priorisierung.",
    strong:
      "Verständlich. Der Nutzen liegt nicht in KI als Schlagwort, sondern in strukturierter Anfrage-Erfassung, Antwortvorschlägen und Priorisierung.",
    next: "Wäre eine bessere Übersicht über offene Anfragen trotzdem hilfreich?",
  },
  {
    objection: "Was kostet das?",
    short: "Ich empfehle den Einstieg über eine fokussierte Pilotphase.",
    strong:
      "Für den Einstieg empfehle ich eine fokussierte Pilotphase. Danach sieht man anhand echter Anfragen, ob eine Weiterführung sinnvoll ist.",
    next: "Wäre ein kleiner Test mit klarer Auswertung grundsätzlich interessant?",
  },
  {
    objection: "Datenschutz?",
    short: "Es gibt transparente Hinweise und vor dem Einsatz werden Unternehmensangaben geprüft.",
    strong:
      "Es gibt eine transparente Datenschutzerklärung und eine klare Trennung der Kundendaten. Vor produktivem Einsatz werden die Unternehmensangaben ergänzt und geprüft.",
    next: "Welche Datenschutzanforderungen sind Ihnen im Pilot besonders wichtig?",
  },
  {
    objection: "Wir wollen keine neue Telefonnummer.",
    short: "Das muss im ersten Schritt nicht sein. Der Pilot kann über Link und manuelle Erfassung starten.",
    strong:
      "Das ist nachvollziehbar. LeadLeak kann zunächst über Erfassungslink und manuelle Lead-Erfassung getestet werden. Telefonintegration ist ein späterer Ausbauschritt.",
    next: "Wäre ein Test ohne Telefonnummer-Wechsel für Sie einfacher?",
  },
];

export default function SalesObjectionsPage() {
  return (
    <SalesShell
      title="Einwandbehandlung"
      subtitle="Sachliche Antworten für typische Rückfragen im Gespräch mit Schweizer Servicebetrieben."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {objections.map((item) => (
          <section key={item.objection} className="premium-card p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Einwand</p>
            <h2 className="mt-2 text-xl font-semibold text-navy-950">{item.objection}</h2>
            <div className="mt-5 grid gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kurzversion</p>
                <p className="mt-2 text-sm leading-7 text-slate-700">{item.short}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-swiss-mint p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Stärkere Version</p>
                <p className="mt-2 text-sm leading-7 text-emerald-950">{item.strong}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nächste Frage</p>
                <p className="mt-2 text-sm font-semibold leading-7 text-navy-950">{item.next}</p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </SalesShell>
  );
}
