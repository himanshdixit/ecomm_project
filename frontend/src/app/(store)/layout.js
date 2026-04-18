import StorefrontShell from "@/components/layout/StorefrontShell";
import { getCategories } from "@/lib/storefront";

export default async function StoreLayout({ children }) {
  const categories = await getCategories();

  return <StorefrontShell initialCategories={categories}>{children}</StorefrontShell>;
}
