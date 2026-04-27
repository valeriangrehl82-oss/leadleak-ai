import { PublicClientLeadForm } from "@/components/PublicClientLeadForm";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ClientPageProps = {
  params: Promise<{ slug: string }>;
};

type ClientRow = {
  name: string;
  slug: string;
  recovery_message: string | null;
  is_active: boolean | null;
};

async function loadClient(slug: string) {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("clients")
      .select("name, slug, recovery_message, is_active")
      .eq("slug", slug)
      .maybeSingle<ClientRow>();

    if (error || !data || !data.is_active) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export default async function PublicClientPilotPage({ params }: ClientPageProps) {
  const { slug } = await params;
  const client = await loadClient(slug);

  if (!client) {
    return (
      <main className="min-h-screen bg-slate-50">
        <header className="border-b border-swiss-line bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-semibold text-navy-950">Rückruf / Anfrage</p>
              <p className="text-xs text-slate-500">Powered by LeadLeak AI</p>
            </div>
          </div>
        </header>
        <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-swiss-line bg-white p-6 shadow-[0_18px_55px_rgba(7,17,31,0.08)]">
            <h1 className="text-2xl font-bold text-navy-950">Pilot-Link nicht verfügbar</h1>
            <p className="mt-4 leading-7 text-slate-600">
              Dieser Link ist nicht aktiv oder der Betrieb wurde nicht gefunden.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-swiss-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-lg font-bold tracking-tight text-navy-950">{client.name}</p>
            <p className="text-sm text-slate-600">Rückruf / Anfrage</p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Powered by LeadLeak AI</p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="animate-fade-slide">
            <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Direkte Anfrage</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
              {client.name} – Rückruf oder Anfrage erfassen
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600">
              Ihre Anfrage wird direkt an den Betrieb übermittelt und strukturiert erfasst.
            </p>
            <div className="mt-8">
              <PublicClientLeadForm
                clientName={client.name}
                slug={client.slug}
                recoveryMessage={client.recovery_message}
              />
            </div>
          </div>

          <aside className="animate-fade-slide animate-delay-1 space-y-5">
            <div className="rounded-xl border border-navy-900 bg-navy-950 p-6 text-white shadow-[0_24px_80px_rgba(7,17,31,0.18)]">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Was passiert danach?</p>
              <ol className="mt-5 space-y-4">
                {[
                  "Ihre Anfrage wird erfasst.",
                  "Der Betrieb erhält die wichtigsten Angaben.",
                  "Sie werden für die Rückmeldung kontaktiert.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/10 text-sm font-bold text-emerald-200">
                      {index + 1}
                    </span>
                    <span className="pt-1 text-sm leading-6 text-slate-200">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">
                Die Bearbeitung erfolgt durch den jeweiligen Betrieb.
              </p>
              <div className="mt-5 grid gap-2 text-xs font-semibold text-emerald-100 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {["Direkt an den Betrieb übermittelt", "Keine Werbeanfrage", "Nur zur Bearbeitung Ihrer Anfrage"].map(
                  (item) => (
                    <div key={item} className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-center">
                      {item}
                    </div>
                  ),
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
