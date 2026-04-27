import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RecoveryReviewQueue, type RecoveryQueueItem } from "@/components/RecoveryReviewQueue";
import { ADMIN_COOKIE_NAME, hasValidAdminSession } from "@/lib/adminAuth";
import { analyzeRecoveryBrain, type RecoveryBrainClient } from "@/lib/recoveryBrain";
import { createServiceRoleClient, isSupabaseConfigError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type LeadRow = {
  id: string;
  created_at: string;
  client_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  request_type: string | null;
  message: string | null;
  status: string | null;
  estimated_value_chf: number | null;
};

type ClientRow = RecoveryBrainClient & {
  id: string;
  name: string;
  slug: string;
};

async function requireAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!hasValidAdminSession(session)) {
    redirect("/admin/login");
  }
}

function getUrgencyRank(urgency: string) {
  const ranks: Record<string, number> = {
    Hoch: 4,
    "Mittel/Hoch": 3,
    Mittel: 2,
    Basis: 1,
  };

  return ranks[urgency] || 0;
}

async function loadRecoveryQueue() {
  try {
    const supabase = createServiceRoleClient();
    const { data: leads, error: leadsError } = await supabase
      .from("client_leads")
      .select("id, created_at, client_id, customer_name, customer_phone, request_type, message, status, estimated_value_chf")
      .in("status", ["new", "contacted", "qualified"])
      .order("created_at", { ascending: false });

    if (leadsError) {
      return { items: [] as RecoveryQueueItem[], error: "Recovery-Vorschläge konnten nicht geladen werden." };
    }

    const leadRows = (leads || []) as LeadRow[];
    const clientIds = Array.from(new Set(leadRows.map((lead) => lead.client_id).filter(Boolean))) as string[];

    if (!clientIds.length) {
      return { items: [] as RecoveryQueueItem[], error: "" };
    }

    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id, name, slug, recovery_message, booking_url, booking_enabled")
      .in("id", clientIds);

    if (clientsError) {
      return { items: [] as RecoveryQueueItem[], error: "Kundendaten konnten nicht geladen werden." };
    }

    const clientsById = new Map((clients || []).map((client) => [client.id, client as ClientRow]));
    const items = leadRows
      .map((lead) => {
        const client = clientsById.get(lead.client_id || "");

        if (!client) {
          return null;
        }

        const recovery = analyzeRecoveryBrain(lead, client);

        return {
          id: lead.id,
          createdAt: lead.created_at,
          customerName: lead.customer_name,
          clientName: client.name,
          requestType: lead.request_type,
          status: lead.status,
          estimatedValueChf: lead.estimated_value_chf,
          recovery,
        };
      })
      .filter(Boolean) as RecoveryQueueItem[];

    items.sort((left, right) => {
      const urgencyDiff = getUrgencyRank(right.recovery.urgencyLabel) - getUrgencyRank(left.recovery.urgencyLabel);

      if (urgencyDiff !== 0) {
        return urgencyDiff;
      }

      const valueDiff = (right.estimatedValueChf || 0) - (left.estimatedValueChf || 0);

      if (valueDiff !== 0) {
        return valueDiff;
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });

    return { items, error: "" };
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return { items: [] as RecoveryQueueItem[], error: error.message };
    }

    return { items: [] as RecoveryQueueItem[], error: "Supabase ist noch nicht konfiguriert." };
  }
}

export default async function AdminRecoveryPage() {
  await requireAdminSession();
  const { items, error } = await loadRecoveryQueue();

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-swiss-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Admin Cockpit</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
            Recovery Review Queue
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Antwortvorschläge für offene Anfragen prüfen, kopieren und priorisieren.
          </p>
          <div className="mt-6 rounded-xl border border-emerald-200 bg-swiss-mint p-4 text-sm leading-6 text-emerald-950">
            Recovery Brain erstellt Vorschläge zur Unterstützung der Rückmeldung. Es werden keine Nachrichten
            automatisch versendet.
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {error}
          </div>
        ) : null}
        <RecoveryReviewQueue items={items} />
      </section>
    </main>
  );
}
