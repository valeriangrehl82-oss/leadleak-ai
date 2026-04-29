import { DemoDashboard } from "@/components/DemoDashboard";

export default function DemoPage() {
  return (
    <main className="premium-page">
      <section className="premium-surface text-white">
        <div className="animate-fade-slide mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="premium-eyebrow-dark">Demo Dashboard</p>
          <h1 className="premium-title-dark mt-3 text-3xl sm:text-5xl">
            Sehen Sie, was sonst unbemerkt verloren geht.
          </h1>
          <p className="premium-muted-dark mt-4 max-w-3xl text-lg">
            Dieses Demo-Dashboard zeigt, wie LeadLeak AI verpasste Anfragen strukturiert, priorisiert und als
            geschätztes Potenzial sichtbar macht.
          </p>
        </div>
      </section>
      <section className="animate-fade-slide animate-delay-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DemoDashboard />
      </section>
    </main>
  );
}
