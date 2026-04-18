"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";

import useHydrated from "@/hooks/useHydrated";
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

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "rating", label: "Top rated" },
  { value: "price_asc", label: "Price low-high" },
  { value: "price_desc", label: "Price high-low" },
  { value: "name", label: "Name" },
];

const resolveActiveFilterChips = (filters = {}) => {
  const chips = [];

  if (filters.search) {
    chips.push(`Search: ${filters.search}`);
  }

  if (filters.inStock === "true") {
    chips.push("In stock only");
  }

  if (filters.minPrice) {
    chips.push(`Min \u20B9${filters.minPrice}`);
  }

  if (filters.maxPrice) {
    chips.push(`Max \u20B9${filters.maxPrice}`);
  }

  if (filters.sort && filters.sort !== "latest") {
    const option = sortOptions.find((entry) => entry.value === filters.sort);
    chips.push(option?.label || filters.sort);
  }

  return chips;
};

const buildQuickFilters = (filters = {}) => [
  {
    key: "under-100",
    label: "Under \u20B9100",
    active: filters.maxPrice === "100" && !filters.minPrice,
    nextFilters: filters.maxPrice === "100" && !filters.minPrice ? { maxPrice: "", minPrice: "" } : { maxPrice: "100", minPrice: "" },
  },
  {
    key: "top-rated",
    label: "Top rated",
    active: filters.sort === "rating",
    nextFilters: { sort: filters.sort === "rating" ? "latest" : "rating" },
  },
  {
    key: "popular",
    label: "Popular",
    active: filters.sort === "popular",
    nextFilters: { sort: filters.sort === "popular" ? "latest" : "popular" },
  },
  {
    key: "in-stock",
    label: "In stock",
    active: filters.inStock === "true",
    nextFilters: { inStock: filters.inStock === "true" ? "" : "true" },
  },
];

const CategoryRail = memo(function CategoryRail({ categories, activeCategory, activeFilters, onCategorySelect, pendingCategorySlug }) {
  return (
    <div className="scroll-touch h-[calc(100dvh-13rem)] min-h-[21rem] overflow-y-auto pr-1 md:h-[calc(100dvh-14rem)] md:min-h-[24rem] lg:h-[calc(100dvh-15rem)] lg:min-h-[25rem]">
      <div className="space-y-1.5">
        {categories.map((category) => {
          const active = activeCategory.slug === category.slug;
          const pending = pendingCategorySlug === category.slug;
          const itemClassName = cn(
            "flex w-full flex-col items-center gap-1.5 rounded-[0.95rem] border px-1 py-2 text-center transition md:gap-2 md:rounded-[1.05rem] md:px-1.5 md:py-2.5",
            active
              ? "border-[#d9e8cb] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.06)]"
              : "border-transparent bg-transparent hover:border-white/70 hover:bg-white/75"
          );

          const content = (
            <>
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-[0.8rem] border border-white/90 bg-white md:h-12 md:w-12 md:rounded-[0.95rem]",
                  active && "shadow-soft"
                )}
                style={{ backgroundColor: category.tint || "#edf3e2" }}
              >
                <Image
                  src={category.image || activeCategory.image || "/images/products/fruit-basket.svg"}
                  alt={category.name}
                  width={36}
                  height={36}
                  className="h-6 w-auto object-contain md:h-7"
                />
              </div>
              <span
                className={cn(
                  "line-clamp-2 text-[8px] font-medium leading-[0.72rem] text-slate-500 md:text-[9px] md:leading-[0.82rem]",
                  active && "text-slate-950"
                )}
              >
                {pending ? "Loading" : `${category.branchDepth > 0 ? `${".. ".repeat(Math.min(category.branchDepth, 2))}` : ""}${category.shortName || category.name}`}
              </span>
            </>
          );

          if (onCategorySelect) {
            return (
              <button key={category.slug} type="button" onClick={() => onCategorySelect(category.slug)} className={itemClassName} aria-pressed={active}>
                {content}
              </button>
            );
          }

          return (
            <Link key={category.slug} href={buildUrl(`/categories/${category.slug}`, categoryLinkParams(activeFilters))} className={itemClassName}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
});

const QuickFilterRow = memo(function QuickFilterRow({ filters, onQuickFilterToggle }) {
  if (!onQuickFilterToggle) {
    return null;
  }

  const quickFilters = buildQuickFilters(filters);

  return (
    <div className="flex flex-wrap gap-2">
      {quickFilters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={() => onQuickFilterToggle(filter.nextFilters)}
          className={cn(
            "rounded-pill border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition md:text-[11px]",
            filter.active
              ? "border-[#cfe5bf] bg-[#eef8e8] text-[#2f8f2f] shadow-soft"
              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
});

const FilterPanel = memo(function FilterPanel({
  isOpen,
  draftFilters,
  onClose,
  onDraftFilterChange,
  onApplyFilters,
  onClearDraftFilters,
  onQuickFilterToggle,
}) {
  const shouldReduceMotion = useReducedMotion();
  const isHydrated = useHydrated();
  const draftFilterChips = useMemo(() => resolveActiveFilterChips(draftFilters), [draftFilters]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isHydrated) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key="filter-overlay"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={shouldReduceMotion ? {} : { opacity: 1 }}
          exit={shouldReduceMotion ? {} : { opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[2px] sm:p-4 md:p-6"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Category filters"
            onClick={(event) => event.stopPropagation()}
            initial={
              shouldReduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 20,
                    scale: 0.98,
                  }
            }
            animate={
              shouldReduceMotion
                ? {}
                : {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }
            }
            exit={
              shouldReduceMotion
                ? {}
                : {
                    opacity: 0,
                    y: 14,
                    scale: 0.985,
                  }
            }
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[42rem] flex-col overflow-hidden rounded-[1.35rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.24)] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[1.55rem]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-5 sm:py-5">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Filter products</div>
                <h2 className="mt-1 text-lg leading-6 text-slate-950 sm:text-[1.35rem] sm:leading-7">Refine this category</h2>
                <p className="mt-1 text-sm text-slate-500">Use one panel to search, sort, price-match, and narrow the current aisle.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                onApplyFilters();
                onClose();
              }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="scroll-touch flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
                <section className="space-y-3 rounded-[1.15rem] border border-slate-200 bg-[#fbfcf7] p-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Quick picks</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">Fast filter presets</div>
                  </div>
                  <QuickFilterRow filters={draftFilters} onQuickFilterToggle={onQuickFilterToggle} />
                </section>

                <section className="space-y-3 rounded-[1.15rem] border border-slate-200 bg-[#fbfcf7] p-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Search</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">Find the right products quickly</div>
                  </div>
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={draftFilters.search}
                      onChange={(event) => onDraftFilterChange("search", event.target.value)}
                      placeholder="Search in this category"
                      className="field-control rounded-[1rem] border-slate-200 bg-white pb-3 pl-10 pr-4 pt-3 text-sm"
                    />
                  </label>
                </section>

                <section className="space-y-3 rounded-[1.15rem] border border-slate-200 bg-[#fbfcf7] p-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Sort and price</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">Control ranking and budget</div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      value={draftFilters.sort}
                      onChange={(event) => onDraftFilterChange("sort", event.target.value)}
                      className="field-control rounded-[1rem] border-slate-200 bg-white pb-3 pt-3 text-sm"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <label className="inline-flex min-h-[3rem] items-center gap-2 rounded-[1rem] border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600">
                      <input
                        type="checkbox"
                        checked={draftFilters.inStock === "true"}
                        onChange={(event) => onDraftFilterChange("inStock", event.target.checked ? "true" : "")}
                        className="h-4 w-4 rounded border-brand/20 text-brand focus:ring-brand/30"
                      />
                      In stock only
                    </label>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draftFilters.minPrice}
                      onChange={(event) => onDraftFilterChange("minPrice", event.target.value)}
                      placeholder="Minimum price"
                      className="field-control rounded-[1rem] border-slate-200 bg-white pb-3 pt-3 text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draftFilters.maxPrice}
                      onChange={(event) => onDraftFilterChange("maxPrice", event.target.value)}
                      placeholder="Maximum price"
                      className="field-control rounded-[1rem] border-slate-200 bg-white pb-3 pt-3 text-sm"
                    />
                  </div>
                </section>

                <section className="space-y-3 rounded-[1.15rem] border border-slate-200 bg-[#fbfcf7] p-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Selected filters</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">Preview before applying</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {draftFilterChips.length ? (
                      draftFilterChips.map((chip) => (
                        <span key={chip} className="rounded-pill bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 ring-1 ring-slate-200">
                          {chip}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-pill bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 ring-1 ring-slate-200">
                        No draft filters
                      </span>
                    )}
                  </div>
                </section>
              </div>

              <div className="border-t border-slate-100 bg-white px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
                  <button type="button" onClick={onClearDraftFilters} className="button-secondary w-full px-4 py-2 text-sm sm:w-auto">
                    Clear all
                  </button>
                  <button type="submit" className="button-primary w-full px-4 py-2 text-sm sm:w-auto">
                    Apply filters
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
});

export default function CategoryMobileShelf({
  categories = [],
  activeCategory,
  shelfTheme,
  activeFilters = {},
  draftFilters = {},
  productResponse,
  onCategorySelect,
  onDraftFilterChange,
  onApplyFilters,
  onClearDraftFilters,
  onPrepareFilterPanel,
  onQuickFilterToggle,
  pendingCategorySlug = "",
  isProductsLoading = false,
  children,
}) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const activeFilterChips = resolveActiveFilterChips(activeFilters);
  const totalProducts = productResponse?.pagination?.total || 0;
  const activeFilterCount = useMemo(() => activeFilterChips.length, [activeFilterChips]);
  const pathEntries = Array.isArray(activeCategory.path) && activeCategory.path.length ? activeCategory.path : [{ name: activeCategory.name, slug: activeCategory.slug }];
  const childCategories = Array.isArray(activeCategory.children) ? activeCategory.children : [];

  const openFilterPanel = () => {
    onPrepareFilterPanel?.();
    setIsFilterPanelOpen(true);
  };

  return (
    <section>
      <div className="overflow-hidden rounded-[1.2rem] border border-slate-200/90 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)] md:rounded-[1.45rem]">
        <div className="border-b border-slate-100 bg-white px-3 py-3 md:px-4 md:py-4">
          <div className="flex items-start justify-between gap-3 md:gap-4">
            <div className="min-w-0 space-y-2.5">
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                <span>Category shelf</span>
                {pathEntries.map((entry, index) => (
                  <span key={`${entry.slug}-${index}`} className="inline-flex items-center gap-1 truncate">
                    {index > 0 ? <span className="text-slate-300">/</span> : null}
                    <span className="truncate">{entry.name}</span>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[1.05rem] leading-5 text-slate-950 md:text-[1.35rem] md:leading-6 lg:text-[1.6rem]">{activeCategory.name}</h1>
                <span className="rounded-pill bg-[#eef8e8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2f8f2f]">
                  {totalProducts} products
                </span>
              </div>
              <p className="max-w-3xl text-[11px] leading-5 text-slate-500 md:text-sm md:leading-6">{activeCategory.description}</p>
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                <span className="rounded-pill bg-slate-100 px-2.5 py-1 text-slate-600">{activeCategory.deliveryTime}</span>
                <span className="rounded-pill bg-white px-2.5 py-1 text-slate-500 ring-1 ring-slate-200">{activeCategory.itemCount}+ aisle items</span>
                <span className="rounded-pill bg-white px-2.5 py-1 text-slate-500 ring-1 ring-slate-200">{activeCategory.childrenCount ? `${activeCategory.childrenCount} sub-aisles` : "Ready to shop"}</span>
              </div>
              {childCategories.length ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {childCategories.slice(0, 6).map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => onCategorySelect?.(child.slug)}
                      className="rounded-pill border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:border-[#cfe5bf] hover:text-[#2f8f2f]"
                    >
                      {child.shortName || child.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[0.95rem] border border-white/80 bg-white shadow-soft md:h-16 md:w-16 md:rounded-[1.1rem]"
              style={{ backgroundColor: shelfTheme.tint }}
            >
              <Image src={shelfTheme.image} alt={activeCategory.name} width={64} height={64} className="h-8 w-auto object-contain md:h-11" />
            </div>
          </div>
        </div>

        <div className="grid items-start grid-cols-[74px,minmax(0,1fr)] bg-[#fafbf7] md:grid-cols-[92px,minmax(0,1fr)] lg:grid-cols-[112px,minmax(0,1fr)] xl:grid-cols-[120px,minmax(0,1fr)]">
          <aside className="self-start border-r border-slate-100 bg-[#f3f5eb] p-1.5 md:p-2">
            <CategoryRail
              categories={categories}
              activeCategory={activeCategory}
              activeFilters={activeFilters}
              onCategorySelect={onCategorySelect}
              pendingCategorySlug={pendingCategorySlug}
            />
          </aside>

          <div className="min-w-0 bg-white px-2.5 py-2.5 md:px-4 md:py-4 lg:px-5 lg:py-5">
            <div className="rounded-[1rem] border border-slate-100 bg-[#fbfcf8] px-3 py-3 md:px-4 md:py-3.5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Product listing</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 md:text-base">Curated products for {activeCategory.name.toLowerCase()}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={openFilterPanel}
                    className="inline-flex min-h-[2.7rem] items-center gap-2 rounded-pill border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-soft transition hover:border-slate-300 hover:text-slate-950"
                  >
                    <SlidersHorizontal className="h-4 w-4 text-[#1195e8]" />
                    Filter
                    {activeFilterCount ? (
                      <span className="inline-flex min-w-[1.4rem] items-center justify-center rounded-full bg-[#eef8e8] px-1.5 py-0.5 text-[10px] font-bold text-[#2f8f2f]">
                        {activeFilterCount}
                      </span>
                    ) : null}
                  </button>
                  <span className="rounded-pill bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 ring-1 ring-slate-200">Responsive shelf</span>
                  <span className="rounded-pill bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 ring-1 ring-slate-200">Fast switching</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {activeFilterChips.length ? (
                  activeFilterChips.map((chip) => (
                    <span key={chip} className="rounded-pill bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 ring-1 ring-slate-200">
                      {chip}
                    </span>
                  ))
                ) : (
                  <span className="rounded-pill bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 ring-1 ring-slate-200">
                    No active filters
                  </span>
                )}
              </div>
            </div>

            <div className={cn("mt-3 transition-opacity duration-200 md:mt-4", isProductsLoading && "opacity-60")}>
              {children}
            </div>
          </div>
        </div>
      </div>

      <FilterPanel
        isOpen={isFilterPanelOpen}
        draftFilters={draftFilters}
        onClose={() => setIsFilterPanelOpen(false)}
        onDraftFilterChange={onDraftFilterChange}
        onApplyFilters={onApplyFilters}
        onClearDraftFilters={onClearDraftFilters}
        onQuickFilterToggle={onQuickFilterToggle}
      />
    </section>
  );
}
