"use client";

import Link from "next/link";
import { memo } from "react";
import { Funnel } from "lucide-react";

import { cn } from "@/lib/utils";

const buildUrl = (pathname, params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
};

const categoryLinkParams = (filters = {}) => ({
  search: filters.search,
  sort: filters.sort,
  minPrice: filters.minPrice,
  maxPrice: filters.maxPrice,
  inStock: filters.inStock,
});

function CategorySidebar({ categories = [], activeSlug = "", basePath = "/products", filters = {}, onCategorySelect }) {
  return (
    <aside className="space-y-5 xl:sticky xl:top-28">
      <div className="surface-card p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
          <Funnel className="h-4 w-4 text-brand" />
          Categories
        </div>
        <div className="space-y-2">
          <Link
            href={buildUrl("/products", categoryLinkParams(filters))}
            className={cn(
              "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition",
              !activeSlug ? "bg-brand-dark text-white shadow-soft" : "bg-brand-soft/70 text-slate-600 hover:bg-white hover:text-brand-dark"
            )}
          >
            All products
            <span className={cn("text-xs", !activeSlug ? "text-white/65" : "text-slate-400")}>Browse all</span>
          </Link>

          {categories.map((category) => {
            const active = activeSlug === category.slug;
            const className = cn(
              "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition",
              active ? "bg-brand-dark text-white shadow-soft" : "bg-brand-soft/70 text-slate-600 hover:bg-white hover:text-brand-dark"
            );
            const metaClassName = cn("text-xs", active ? "text-white/65" : "text-slate-400");

            if (onCategorySelect) {
              return (
                <button key={category.slug} type="button" onClick={() => onCategorySelect(category.slug)} className={className}>
                  <span>{category.name}</span>
                  <span className={metaClassName}>{category.itemCount}</span>
                </button>
              );
            }

            return (
              <Link
                key={category.slug}
                href={buildUrl(`/categories/${category.slug}`, categoryLinkParams(filters))}
                className={className}
              >
                {category.name}
                <span className={metaClassName}>{category.itemCount}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <form action={basePath} className="surface-card space-y-4 p-5">
        {filters.search ? <input type="hidden" name="search" value={filters.search} /> : null}
        <div>
          <label className="mb-2 block text-sm font-semibold text-brand-dark">Sort by</label>
          <select name="sort" defaultValue={filters.sort || "latest"} className="field-control">
            <option value="latest">Latest arrivals</option>
            <option value="popular">Most popular</option>
            <option value="rating">Top rated</option>
            <option value="price_asc">Price: Low to high</option>
            <option value="price_desc">Price: High to low</option>
            <option value="name">Name</option>
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-dark">Min price</label>
            <input type="number" min="0" step="0.01" name="minPrice" defaultValue={filters.minPrice || ""} placeholder="0" className="field-control" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-brand-dark">Max price</label>
            <input type="number" min="0" step="0.01" name="maxPrice" defaultValue={filters.maxPrice || ""} placeholder="50" className="field-control" />
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-brand-soft/65 px-4 py-3 text-sm text-slate-600">
          <input type="checkbox" name="inStock" value="true" defaultChecked={filters.inStock === "true"} className="h-4 w-4 rounded border-brand/20 text-brand focus:ring-brand/30" />
          In-stock items only
        </label>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="button-primary flex-1 text-sm">
            Apply filters
          </button>
          <Link href={activeSlug ? `/categories/${activeSlug}` : "/products"} className="button-secondary text-sm">
            Reset
          </Link>
        </div>
      </form>
    </aside>
  );
}

export default memo(CategorySidebar);
