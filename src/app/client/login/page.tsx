import { ClientLoginForm } from "@/components/ClientLoginForm";

export default function ClientLoginPage() {
  return (
    <main className="premium-page">
      <section className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="premium-eyebrow">LeadLeak AI</p>
        <h1 className="premium-title mt-3 text-3xl">Kundenportal Login</h1>
        <p className="premium-muted mt-4">Für Pilotkunden von LeadLeak AI.</p>
        <ClientLoginForm />
      </section>
    </main>
  );
}
