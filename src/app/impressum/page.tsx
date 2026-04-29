export const metadata = {
  title: "Impressum | LeadLeak AI",
  description: "Impressum für LeadLeak AI.",
};

export default function ImpressumPage() {
  return (
    <main className="premium-page">
      <section className="premium-surface text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="premium-eyebrow-dark">Angaben zum Anbieter</p>
          <h1 className="premium-title-dark mt-3 text-4xl sm:text-5xl">Impressum</h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-4 py-10 sm:px-6 lg:px-8">
        <article className="premium-card p-6">
          <h2 className="text-xl font-semibold text-navy-950">Anbieter</h2>
          <div className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
            <p>[Name / Firma]</p>
            <p>[Adresse]</p>
            <p>[PLZ Ort]</p>
            <p>[E-Mail]</p>
            <p>[Telefon optional]</p>
          </div>
        </article>

        <article className="premium-card p-6">
          <h2 className="text-xl font-semibold text-navy-950">Verantwortlich für den Inhalt</h2>
          <p className="mt-4 text-sm leading-7 text-slate-700">[Name / Firma]</p>
        </article>

        <article className="premium-card p-6">
          <h2 className="text-xl font-semibold text-navy-950">Hinweis</h2>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            Diese Angaben sind vor produktivem Kundeneinsatz vollständig zu ergänzen.
          </p>
        </article>

        <article className="premium-card p-6">
          <h2 className="text-xl font-semibold text-navy-950">Produktbeschreibung</h2>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            LeadLeak AI ist ein Pilot-System zur strukturierten Erfassung, Priorisierung und Auswertung von Anfragen
            für Servicebetriebe.
          </p>
        </article>
      </section>
    </main>
  );
}
