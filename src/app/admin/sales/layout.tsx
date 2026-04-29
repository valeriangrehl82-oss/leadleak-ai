import { requireAdminPage } from "@/lib/adminGuard";

export default async function AdminSalesLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();

  return children;
}
