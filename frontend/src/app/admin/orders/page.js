import AdminOrdersClient from "@/components/admin/AdminOrdersClient";
import { getAdminOrders } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getAdminOrders();

  return <AdminOrdersClient initialOrders={orders} />;
}
