import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, hasValidAdminSession } from "@/lib/adminAuth";
import { createServiceRoleClient, isSupabaseConfigError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AdminClientsPageProps = {
  searchParams: Promise<{ created?: string; error?: string }>;
};

type ClientRow = {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  industry: string;
  notification_email: string;
  is_active: boolean | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

async function requireAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!hasValidAdminSession(session)) {
    redirect("/admin/login");
  }
}

async function createClientAction(formData: FormData) {
  "use server";

  await requireAdminSession();

  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase();
  const industry = String(formData.get("industry") || "").trim();
  const contactPerson = String(formData.get("contact_person") || "").trim();
  const notificationEmail = String(formData.get("notification_email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const averageOrderValueChf = Number(formData.get("average_order_value_chf") || 250);
  const recoveryMessage = String(formData.get("recovery_message") || "").trim();

  if (!name || !slug || !industry || !notificationEmail) {
    redirect("/admin/clients?error=missing");
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("clients").insert({
    name,
    slug,
    industry,
    contact_person: contactPerson || null,
    notification_email: notificationEmail,
    phone: phone || null,
    average_order_value_chf: Number.isFinite(averageOrderValueChf) ? averageOrderValueChf : 250,
    recovery_message: recoveryMessage || null,
    is_active: true,
  });

  if (error) {
    console.error("Client insert failed:", error);
    redirect("/admin/clients?error=insert");
  }

  redirect("/admin/clients?created=1");
}

async function loadClients() {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("clients")
      .select("id, created_at, name, slug, industry, notification_email, is_active")
      .order("created_at", { ascending: false });

    if (error) {
      return { clients: [], error: "Kunden konnten nicht geladen werden." };
    }

    return { clients: (data || []) as ClientRow[], error: "" };
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return { clients: [], error: error.message };
    }

    return { clients: [], error: "Supabase ist noch nicht konfiguriert." };
  }
}

export default async function AdminClientsPage({ searchParams }: AdminClientsPageProps) {
  await requireAdminSession();
  const params = await searchParams;
  const { clients, error } = await loadClients();

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-swiss-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">Admin</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">Kunden</h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Pilot-Kunden verwalten und öffentliche Lead-Links erstellen.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <form action={createClientAction} className="rounded-lg border border-swiss-line bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-navy-950">Neuen Kunden anlegen</h2>
          {params.created ? (
            <div className="mt-4 rounded-md bg-swiss-mint p-3 text-sm font-semibold text-emerald-900">
              Kunde wurde angelegt.
            </div>
          ) : null}
          {params.error ? (
            <div className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-800">
              Kunde konnte nicht angelegt werden. Bitte Pflichtfelder und Slug prüfen.
            </div>
          ) : null}
          <div className="mt-5 grid gap-4">
            {[
              ["name", "Name"],
              ["slug", "Slug"],
              ["industry", "Branche"],
              ["contact_person", "Kontaktperson"],
              ["notification_email", "Notification E-Mail"],
              ["phone", "Telefon"],
              ["average_order_value_chf", "Durchschnittlicher Auftragswert CHF"],
            ].map(([name, label]) => (
              <label key={name} className="space-y-2">
                <span className="text-sm font-semibold text-navy-950">{label}</span>
                <input
                  name={name}
                  type={name === "average_order_value_chf" ? "number" : name === "notification_email" ? "email" : "text"}
                  defaultValue={name === "average_order_value_chf" ? "250" : ""}
                  className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
                  required={["name", "slug", "industry", "notification_email"].includes(name)}
                />
              </label>
            ))}
            <label className="space-y-2">
              <span className="text-sm font-semibold text-navy-950">Recovery Message</span>
              <textarea
                name="recovery_message"
                rows={4}
                className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-5 rounded-md bg-swiss-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            Kunden anlegen
          </button>
        </form>

        <div className="overflow-hidden rounded-lg border border-swiss-line bg-white shadow-soft">
          <div className="border-b border-swiss-line px-5 py-4">
            <h2 className="text-xl font-semibold text-navy-950">Bestehende Kunden</h2>
          </div>
          {error ? <div className="m-5 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</div> : null}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Industry</th>
                  <th className="px-5 py-3">Notification Email</th>
                  <th className="px-5 py-3">Active</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.length ? (
                  clients.map((client) => (
                    <tr key={client.id}>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-navy-950">{client.name}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">{client.slug}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">{client.industry}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">{client.notification_email}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">{client.is_active ? "Ja" : "Nein"}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(client.created_at)}</td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <Link className="font-semibold text-swiss-green" href={`/admin/clients/${client.id}`}>
                          Öffnen
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-600" colSpan={7}>
                      Noch keine Kunden vorhanden.
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
