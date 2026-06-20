import AdminCategoriesClient from "@/components/admin/AdminCategoriesClient";
import { getAdminCategories } from "@/lib/admin";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return <AdminCategoriesClient initialCategories={categories} />;
}
