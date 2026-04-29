import { requireAdminPage } from "@/lib/adminGuard";

export default async function AdminOutreachLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();

  return children;
}
