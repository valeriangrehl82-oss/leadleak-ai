import { DemoDashboard } from "@/components/DemoDashboard";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-swiss-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Demo Dashboard</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
            Vom verpassten Anruf zum qualifizierten Lead.
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Für das Verkaufsgespräch zeigt diese Ansicht, was sonst nur als Telefonnummer liegen bleibt: Anliegen,
            Dringlichkeit, Antwortvorschlag und nächste Aktion.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DemoDashboard />
      </section>
    </main>
  );
}
