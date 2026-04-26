import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SupabaseHealthPage() {
  let isConnected = false;
  let message = "Supabase ist noch nicht konfiguriert.";

  try {
    await createClient();
    isConnected = true;
    message = "Supabase connected";
  } catch {
    isConnected = false;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Systemstatus</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">Supabase Health Check</h1>
        <div
          className={`mt-8 rounded-lg border p-6 shadow-soft ${
            isConnected ? "border-emerald-200 bg-swiss-mint" : "border-amber-200 bg-amber-50"
          }`}
        >
          <p className="text-lg font-semibold text-navy-950">{message}</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Diese Seite prüft nur, ob die Supabase-Umgebungsvariablen vorhanden sind und der Server-Client initialisiert
            werden kann. Es wird keine Demo-Tabelle wie Todos abgefragt.
          </p>
        </div>
      </section>
    </main>
  );
}
