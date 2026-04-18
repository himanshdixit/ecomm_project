import Link from "next/link";

import CategorySidebar from "@/components/product/CategorySidebar";
import ProductCard from "@/components/product/ProductCard";
import SectionHeading from "@/components/shared/SectionHeading";
import { buildMetadata, indexRobots } from "@/lib/seo";
import { getCategories, getProducts, toQueryValue } from "@/lib/storefront";

const buildPageHref = (page, filters) => {
  const searchParams = new URLSearchParams();

  Object.entries({ ...filters, page: String(page) }).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  return `/products?${searchParams.toString()}`;
};

const resolveFilters = (params = {}) => ({
  search: toQueryValue(params.search),
  sort: toQueryValue(params.sort) || "latest",
  minPrice: toQueryValue(params.minPrice),
  maxPrice: toQueryValue(params.maxPrice),
  inStock: toQueryValue(params.inStock),
  featured: toQueryValue(params.featured),
  page: toQueryValue(params.page) || "1",
});

const hasCatalogFilters = (filters) =>
  Boolean(
    filters.search ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.inStock === "true" ||
      filters.featured === "true" ||
      filters.sort !== "latest" ||
      filters.page !== "1"
  );

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const filters = resolveFilters(params);
  const searchDescription = filters.search
    ? `Search grocery results for ${filters.search}, including fresh produce, dairy, pantry staples, and daily essentials.`
    : "Browse grocery products, fresh produce, pantry staples, snacks, dairy, and daily essentials with clean category-first navigation.";

  return buildMetadata({
    title: filters.search ? `Search: ${filters.search}` : "Products",
    description: searchDescription,
    path: "/products",
    keywords: [filters.search, "grocery products", "daily essentials catalog"],
    robots: hasCatalogFilters(filters) ? { index: false, follow: true } : indexRobots,
  });
}

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const filters = resolveFilters(params);

  const [categories, productResponse] = await Promise.all([
    getCategories(),
    getProducts({
      ...filters,
      limit: "12",
    }),
  ]);

  return (
    <main className="page-shell section-gap space-y-6">
      <form action="/products" className="surface-card overflow-hidden p-6 sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[1.5fr,1fr,1fr,1fr,auto] lg:items-end">
          <div className="space-y-2">
            <div className="pill-chip w-fit">Live catalog</div>
            <input type="search" name="search" defaultValue={filters.search} placeholder="Search fresh produce, dairy, snacks..." className="field-control" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-dark">Sort</label>
            <select name="sort" defaultValue={filters.sort} className="field-control">
              <option value="latest">Latest arrivals</option>
              <option value="popular">Most popular</option>
              <option value="rating">Top rated</option>
              <option value="price_asc">Price: Low to high</option>
              <option value="price_desc">Price: High to low</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-dark">Min price</label>
            <input type="number" min="0" step="0.01" name="minPrice" defaultValue={filters.minPrice} className="field-control" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-dark">Max price</label>
            <input type="number" min="0" step="0.01" name="maxPrice" defaultValue={filters.maxPrice} className="field-control" />
          </div>
          <button type="submit" className="button-primary text-sm">
            Search
          </button>
        </div>
        <label className="mt-4 inline-flex items-center gap-3 text-sm text-slate-600">
          <input type="checkbox" name="inStock" value="true" defaultChecked={filters.inStock === "true"} className="h-4 w-4 rounded border-brand/20 text-brand focus:ring-brand/30" />
          In-stock items only
        </label>
      </form>

      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        <CategorySidebar categories={categories} activeSlug="" filters={filters} basePath="/products" />

        <section className="space-y-6">
          <SectionHeading
            eyebrow="Catalog"
            title="Daily essentials, now fetched from your real product API."
            description={`Showing ${productResponse.pagination.total} products${filters.search ? ` for "${filters.search}"` : ""}.`}
          />

          {productResponse.products.length ? (
            <>
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
                {productResponse.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {productResponse.pagination.pages > 1 ? (
                <div className="surface-card flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-slate-500">
                    Page {productResponse.pagination.page} of {productResponse.pagination.pages}
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {productResponse.pagination.page > 1 ? (
                      <Link href={buildPageHref(productResponse.pagination.page - 1, filters)} className="button-secondary px-4 py-2 text-sm">
                        Previous
                      </Link>
                    ) : null}
                    {productResponse.pagination.page < productResponse.pagination.pages ? (
                      <Link href={buildPageHref(productResponse.pagination.page + 1, filters)} className="button-primary px-4 py-2 text-sm">
                        Next
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="surface-card p-6 text-sm text-slate-600">No products matched these filters yet. Try a broader search or clear some filters.</div>
          )}
        </section>
      </div>
    </main>
  );
}
