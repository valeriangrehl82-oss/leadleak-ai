import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { formatChf } from "@/lib/audit";
import { ADMIN_COOKIE_NAME, hasValidAdminSession } from "@/lib/adminAuth";
import { createServiceRoleClient, isSupabaseConfigError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AuditRequestRow = {
  id: string;
  created_at: string;
  company_name: string;
  industry: string;
  contact_person: string;
  phone: string;
  email: string;
  missed_calls_per_week: number | null;
  estimated_monthly_potential_chf: number | null;
  status: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

async function loadAuditRequests() {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("audit_requests")
      .select(
        "id, created_at, company_name, industry, contact_person, phone, email, missed_calls_per_week, estimated_monthly_potential_chf, status",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return { audits: [], error: "Audit-Anfragen konnten nicht geladen werden." };
    }

    return { audits: (data || []) as AuditRequestRow[], error: "" };
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return {
        audits: [],
        error: error.message,
      };
    }

    return {
      audits: [],
      error: "Supabase ist noch nicht konfiguriert. Bitte Umgebungsvariablen prüfen.",
    };
  }
}

export default async function AdminAuditsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!hasValidAdminSession(session)) {
    redirect("/admin/login");
  }

  const { audits, error } = await loadAuditRequests();

  return (
    <main className="premium-page">
      <section className="premium-surface text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="premium-eyebrow-dark">Admin</p>
              <h1 className="premium-title-dark mt-3 text-3xl sm:text-4xl">Audit-Anfragen</h1>
            </div>
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="premium-button-secondary px-4 py-2 text-sm text-white"
              >
                Logout
              </button>
            </form>
          </div>
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            Interne Ansicht - vor echtem Kundeneinsatz mit Login schützen.
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">
            {error}
          </div>
        ) : null}

        <div className="premium-table mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Firma</th>
                  <th className="px-5 py-3">Branche</th>
                  <th className="px-5 py-3">Kontaktperson</th>
                  <th className="px-5 py-3">Telefon</th>
                  <th className="px-5 py-3">E-Mail</th>
                  <th className="px-5 py-3">Verpasste Anrufe/Woche</th>
                  <th className="px-5 py-3">Monatliches Potenzial</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Erstellt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {audits.length ? (
                  audits.map((audit) => (
                    <tr key={audit.id}>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-navy-950">{audit.company_name}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">{audit.industry}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">{audit.contact_person}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">{audit.phone}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">{audit.email}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                        {audit.missed_calls_per_week ?? "-"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-navy-950">
                        {audit.estimated_monthly_potential_chf
                          ? formatChf(audit.estimated_monthly_potential_chf)
                          : "-"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-full bg-swiss-mint px-3 py-1 text-xs font-semibold text-emerald-800">
                          {audit.status || "new"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(audit.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-600" colSpan={9}>
                      Noch keine Audit-Anfragen vorhanden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
