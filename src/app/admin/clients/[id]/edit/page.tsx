import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, hasValidAdminSession } from "@/lib/adminAuth";
import { createServiceRoleClient, isSupabaseConfigError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ClientEditPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

type ClientRow = {
  id: string;
  name: string;
  slug: string;
  industry: string;
  contact_person: string | null;
  notification_email: string;
  phone: string | null;
  average_order_value_chf: number | null;
  recovery_message: string | null;
  is_active: boolean | null;
};

async function requireAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!hasValidAdminSession(session)) {
    redirect("/admin/login");
  }
}

async function updateClientAction(formData: FormData) {
  "use server";

  await requireAdminSession();

  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "").trim().toLowerCase();
  const industry = String(formData.get("industry") || "").trim();
  const contactPerson = String(formData.get("contact_person") || "").trim();
  const notificationEmail = String(formData.get("notification_email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const averageOrderValueChf = Number(formData.get("average_order_value_chf") || 250);
  const recoveryMessage = String(formData.get("recovery_message") || "").trim();
  const isActive = formData.get("is_active") === "on";

  if (!id || !name || !slug || !industry || !notificationEmail) {
    redirect(`/admin/clients/${id}/edit?error=missing`);
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("clients")
    .update({
      name,
      slug,
      industry,
      contact_person: contactPerson || null,
      notification_email: notificationEmail,
      phone: phone || null,
      average_order_value_chf: Number.isFinite(averageOrderValueChf) ? averageOrderValueChf : 250,
      recovery_message: recoveryMessage || null,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) {
    console.error("Client update failed:", error);
    redirect(`/admin/clients/${id}/edit?error=save`);
  }

  redirect(`/admin/clients/${id}?updated=client`);
}

async function loadClient(id: string) {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("clients")
      .select(
        "id, name, slug, industry, contact_person, notification_email, phone, average_order_value_chf, recovery_message, is_active",
      )
      .eq("id", id)
      .maybeSingle<ClientRow>();

    if (error || !data) {
      return { client: null, error: "Kunde wurde nicht gefunden." };
    }

    return { client: data, error: "" };
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return { client: null, error: error.message };
    }

    return { client: null, error: "Supabase ist noch nicht konfiguriert." };
  }
}

export default async function ClientEditPage({ params, searchParams }: ClientEditPageProps) {
  await requireAdminSession();
  const { id } = await params;
  const urlParams = await searchParams;
  const { client, error } = await loadClient(id);

  if (!client) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href="/admin/clients" className="text-sm font-semibold text-swiss-green">
            Zurück zu Kunden
          </Link>
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">
            {error}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-swiss-line bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <Link href={`/admin/clients/${client.id}`} className="text-sm font-semibold text-swiss-green">
            Zurück zum Kunden
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">Kunde bearbeiten</h1>
          <p className="mt-3 text-slate-600">{client.name}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {urlParams.error ? (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-800">
            Kunde konnte nicht gespeichert werden. Bitte Pflichtfelder und Slug prüfen.
          </div>
        ) : null}

        <form action={updateClientAction} className="rounded-lg border border-swiss-line bg-white p-6 shadow-soft">
          <input type="hidden" name="id" value={client.id} />
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              ["name", "Name", client.name, "text", true],
              ["slug", "Slug", client.slug, "text", true],
              ["industry", "Branche", client.industry, "text", true],
              ["contact_person", "Kontaktperson", client.contact_person || "", "text", false],
              ["notification_email", "Notification E-Mail", client.notification_email, "email", true],
              ["phone", "Telefon", client.phone || "", "text", false],
              [
                "average_order_value_chf",
                "Durchschnittlicher Auftragswert CHF",
                String(client.average_order_value_chf || 250),
                "number",
                false,
              ],
            ].map(([name, label, value, type, required]) => (
              <label key={String(name)} className="space-y-2">
                <span className="text-sm font-semibold text-navy-950">{label}</span>
                <input
                  name={String(name)}
                  type={String(type)}
                  defaultValue={String(value)}
                  required={Boolean(required)}
                  className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
                />
              </label>
            ))}
          </div>

          <label className="mt-5 block space-y-2">
            <span className="text-sm font-semibold text-navy-950">Recovery Message</span>
            <textarea
              name="recovery_message"
              rows={5}
              defaultValue={client.recovery_message || ""}
              className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none ring-swiss-green transition focus:ring-2"
            />
          </label>

          <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-navy-950">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked={Boolean(client.is_active)}
              className="h-4 w-4 rounded border-slate-300 text-swiss-green"
            />
            Pilot-Link aktiv
          </label>

          <button
            type="submit"
            className="mt-6 rounded-md bg-swiss-green px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            Änderungen speichern
          </button>
        </form>
      </section>
    </main>
  );
}
