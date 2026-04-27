import { DemoDashboard } from "@/components/DemoDashboard";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-swiss-line bg-white">
        <div className="animate-fade-slide mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Demo Dashboard</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
            Sehen Sie, was sonst unbemerkt verloren geht.
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
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
