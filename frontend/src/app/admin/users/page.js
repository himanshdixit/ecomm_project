import AdminUsersClient from "@/components/admin/AdminUsersClient";
import { getAdminUsers } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await getAdminUsers();

  return <AdminUsersClient initialUsers={users} currentAdminId={admin.id} />;
}
