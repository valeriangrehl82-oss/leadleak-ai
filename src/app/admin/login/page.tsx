import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasValidAdminSession, ADMIN_COOKIE_NAME } from "@/lib/adminAuth";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (hasValidAdminSession(session)) {
    redirect("/admin/audits");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-swiss-green">LeadLeak AI</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy-950">Admin Login</h1>
        <p className="mt-4 leading-7 text-slate-600">Interner Zugriff auf Audit-Anfragen</p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
