import AdminCategoriesClient from "@/components/admin/AdminCategoriesClient";
import { getAdminCategories } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await getAdminCategories();

  return <AdminCategoriesClient initialCategories={categories} />;
}
