import { ClientLoginForm } from "@/components/ClientLoginForm";

export default function ClientLoginPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">LeadLeak AI</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">Kundenportal Login</h1>
        <p className="mt-4 leading-7 text-slate-600">Für Pilotkunden von LeadLeak AI.</p>
        <ClientLoginForm />
      </section>
    </main>
  );
}
