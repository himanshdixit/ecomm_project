import { notFound } from "next/navigation";

import CategoryCatalogClient from "@/components/product/CategoryCatalogClient";
import { buildMetadata, indexRobots, truncateText } from "@/lib/seo";
import { getCategories, getProducts, toQueryValue } from "@/lib/storefront";

const resolveFilters = (params = {}) => ({
  search: toQueryValue(params.search),
  sort: toQueryValue(params.sort) || "latest",
  minPrice: toQueryValue(params.minPrice),
  maxPrice: toQueryValue(params.maxPrice),
  inStock: toQueryValue(params.inStock),
  page: toQueryValue(params.page) || "1",
});

const hasActiveFilters = (filters) =>
  Boolean(filters.search || filters.minPrice || filters.maxPrice || filters.inStock === "true" || filters.sort !== "latest" || filters.page !== "1");

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const filters = resolveFilters(resolvedSearchParams);
  const categories = await getCategories();
  const category = categories.find((entry) => entry.slug === slug);

  if (!category) {
    return buildMetadata({
      title: "Category",
      description: "Browse grocery products by category.",
      path: `/categories/${slug}`,
      robots: { index: false, follow: false },
    });
  }

  return buildMetadata({
    title: category.name,
    description: truncateText(category.description || `Shop ${category.name} with live pricing, fresh inventory, and fast grocery delivery.`),
    path: `/categories/${category.slug}`,
    image: category.image || undefined,
    keywords: [category.name, `${category.name} delivery`, "grocery category"],
    robots: hasActiveFilters(filters) ? { index: false, follow: true } : indexRobots,
  });
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const filters = resolveFilters(resolvedSearchParams);

  const categories = await getCategories();
  const category = categories.find((entry) => entry.slug === slug);

  if (!category) {
    notFound();
  }

  const productResponse = await getProducts({
    ...filters,
    category: slug,
    limit: "12",
  });

  return (
    <main className="mx-auto w-full max-w-7xl space-y-3 px-2 py-3 sm:space-y-5 sm:px-4 sm:py-5 lg:space-y-6 lg:px-8 lg:py-8">
      <CategoryCatalogClient
        categories={categories}
        initialCategory={category}
        initialProductResponse={productResponse}
        initialFilters={filters}
      />
    </main>
  );
}

