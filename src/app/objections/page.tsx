import { CopyButton } from "@/components/CopyButton";

const objections = [
  {
    objection: "Wir verpassen kaum Anrufe.",
    response:
      "Perfekt, dann ist der Pilot schnell validiert. Wenn tatsächlich kaum etwas verloren geht, sehen wir das nach 14 Tagen schwarz auf weiss.",
  },
  {
    objection: "Wir haben schon genug Kunden.",
    response:
      "Dann geht es weniger um mehr Kunden, sondern um bessere Struktur und weniger Stress im Tagesgeschäft. Nicht jeder Lead muss angenommen werden, aber jeder relevante Lead sollte sichtbar sein.",
  },
  {
    objection: "Das klingt nach zu viel Technik.",
    response:
      "Für Sie soll es genau das Gegenteil sein: weniger Technik. Sie erhalten strukturierte Anfragen statt chaotische Rückrufe.",
  },
  {
    objection: "Zu teuer.",
    response:
      "Ein einziger Werkstattauftrag kann bereits einen relevanten Teil des Piloten decken. Genau deshalb rechnen wir es nicht abstrakt, sondern mit Ihren verpassten Anrufen.",
  },
  {
    objection: "Wir wollen keine KI am Telefon.",
    response:
      "Verständlich. Der Pilot muss nicht mit KI-Telefonie starten. Es reicht ein einfacher Rückmelde- und Qualifizierungsprozess per Nachricht.",
  },
  {
    objection: "Datenschutz?",
    response:
      "Wir starten bewusst schlank: keine medizinischen Daten, keine unnötige Speicherung, keine Aufzeichnung ohne Zustimmung und nur die Informationen, die für eine Rückmeldung nötig sind.",
  },
];

export default function ObjectionsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-swiss-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Sales Antworten</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
            Einwände im Gespräch ruhig beantworten.
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Kurze, sachliche Antworten für Live-Gespräche mit Garageninhabern. Ziel ist nicht Druck, sondern eine
            klare 14-Tage-Validierung.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-2">
          {objections.map((item, index) => (
            <article key={item.objection} className="rounded-lg border border-swiss-line bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Einwand {index + 1}</p>
                  <h2 className="mt-2 text-xl font-semibold text-navy-950">“{item.objection}”</h2>
                </div>
                <CopyButton text={item.response} />
              </div>
              <p className="mt-5 rounded-md bg-slate-50 p-4 leading-7 text-slate-700">{item.response}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
