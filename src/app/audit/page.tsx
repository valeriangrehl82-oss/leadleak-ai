import { AuditForm } from "@/components/AuditForm";

const trustPoints = [
  {
    title: "Schnelle Einschätzung",
    text: "Mit wenigen Angaben wird sichtbar, ob verpasste Anfragen im Betrieb relevant sein könnten.",
  },
  {
    title: "Pilot-sicher",
    text: "Die Auswertung bleibt bewusst schlank und dient als Grundlage für ein erstes Gespräch.",
  },
  {
    title: "Keine Umstellung nötig",
    text: "Der Audit prüft das Anfragepotenzial, ohne bestehende Telefonnummern oder Abläufe direkt zu verändern.",
  },
];

export default function AuditPage() {
  return (
    <main className="premium-page">
      <section className="premium-surface text-white">
        <div className="animate-fade-slide mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="premium-eyebrow-dark">Lead-Audit</p>
          <h1 className="premium-title-dark mt-4 max-w-4xl text-4xl sm:text-5xl">
            Finden Sie heraus, wie viel Anfragepotenzial aktuell unsichtbar bleibt.
          </h1>
          <p className="premium-muted-dark mt-5 max-w-3xl text-lg">
            Der Lead-Audit macht verpasste Anfragen greifbar und zeigt, ob eine strukturierte Anfrage-Erfassung für
            Ihre Pilotphase sinnvoll ist.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-fade-slide animate-delay-1 mb-6 grid gap-4 md:grid-cols-3">
          {trustPoints.map((item) => (
            <article
              key={item.title}
              className="premium-card card-hover p-5"
            >
              <h2 className="text-base font-semibold text-navy-950">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>

        <div className="animate-fade-slide animate-delay-2">
          <AuditForm />
        </div>
      </section>
    </main>
  );
}
