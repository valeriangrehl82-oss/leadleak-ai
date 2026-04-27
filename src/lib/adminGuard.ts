import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, hasValidAdminSession } from "@/lib/adminAuth";

export async function requireAdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!hasValidAdminSession(session)) {
    redirect("/admin/login");
  }
}
