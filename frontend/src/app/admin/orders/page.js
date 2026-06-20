import AdminOrdersClient from "@/components/admin/AdminOrdersClient";
import { getAdminOrders } from "@/lib/admin";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return <AdminOrdersClient initialOrders={orders} />;
}
