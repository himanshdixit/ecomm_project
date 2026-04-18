import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import { getAdminDashboard } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const dashboardData = await getAdminDashboard();

  return <AdminDashboardClient dashboardData={dashboardData} adminName={admin.name} />;
}
