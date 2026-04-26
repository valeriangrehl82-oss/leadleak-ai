import { AuditForm } from "@/components/AuditForm";

export default function AuditPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-swiss-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Lead-Audit</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
            Verpasste Anfragen sichtbar machen.
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Dieser Demo-Audit zeigt, wie schnell aus groben Zahlen ein Gespräch über potenziellen Zusatzumsatz wird.
            Alles bleibt lokal simuliert.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AuditForm />
      </section>
    </main>
  );
}
