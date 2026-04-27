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
        <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-swiss-line bg-white p-6 shadow-soft">
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
      <section className="border-b border-swiss-line bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">LeadLeak AI Pilot</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">
            {client.name} – Rückruf / Anfrage erfassen
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            Füllen Sie das Formular aus. Der Betrieb erhält Ihre Anfrage strukturiert und meldet sich zeitnah.
          </p>
          <PublicClientLeadForm
            clientName={client.name}
            slug={client.slug}
            recoveryMessage={client.recovery_message}
          />
        </div>
      </section>
    </main>
  );
}
