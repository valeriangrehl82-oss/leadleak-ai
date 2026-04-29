import { LeadSimulator } from "@/components/LeadSimulator";

export default function SimulatePage() {
  return (
    <main className="premium-page">
      <section className="premium-surface text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="premium-eyebrow-dark">Lead Simulation</p>
          <h1 className="premium-title-dark mt-3 text-3xl sm:text-5xl">
            Verpassten Anruf simulieren.
          </h1>
          <p className="premium-muted-dark mt-4 max-w-3xl">
            Erzeuge einen Beispiel-Lead und sieh, welche automatische Antwort und interne Benachrichtigung entstehen.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <LeadSimulator />
      </section>
    </main>
  );
}
