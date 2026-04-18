import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";
import { noIndexRobots } from "@/lib/seo";

export const metadata = {
  robots: noIndexRobots,
};

export default async function AdminLayout({ children }) {
  const admin = await requireAdmin();

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
