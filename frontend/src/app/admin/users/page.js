import AdminUsersClient from "@/components/admin/AdminUsersClient";
import { getAdminUsers } from "@/lib/admin";
import { getSessionUser } from "@/lib/auth";

export default async function AdminUsersPage() {
  const admin = await getSessionUser();
  const users = await getAdminUsers();

  return <AdminUsersClient initialUsers={users} currentAdminId={admin?.id || ""} />;
}
