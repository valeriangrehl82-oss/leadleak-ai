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
    <main className="premium-page">
      <section className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="premium-eyebrow">LeadLeak AI</p>
        <h1 className="premium-title mt-3 text-3xl">Admin Login</h1>
        <p className="premium-muted mt-4">Interner Zugriff auf Audit-Anfragen</p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
