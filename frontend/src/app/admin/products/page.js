import AdminProductsClient from "@/components/admin/AdminProductsClient";
import { getAdminCategories, getAdminProducts } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";

export default async function AdminProductsPage() {
  await requireAdmin();

  const [productData, categories] = await Promise.all([
    getAdminProducts({ limit: 100, sort: "latest", status: "all" }),
    getAdminCategories(),
  ]);

  return <AdminProductsClient initialProducts={productData.products || []} categories={categories} />;
}
