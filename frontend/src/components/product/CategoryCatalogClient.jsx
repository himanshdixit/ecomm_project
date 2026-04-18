"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import CategoryMobileShelf from "@/components/product/CategoryMobileShelf";
import ProductCard from "@/components/product/ProductCard";
import StatusBanner from "@/components/shared/StatusBanner";
import { getCategoryBranch } from "@/lib/category-tree";
import { emitStorefrontCategoryActive, subscribeToStorefrontCategorySelect } from "@/lib/storefront-events";
import { getCategoryTheme } from "@/lib/storefront-theme";
import { catalogService } from "@/services/api";

const EMPTY_PRODUCT_RESPONSE = {
  products: [],
  pagination: {
    page: 1,
    limit: 12,
    pages: 0,
    total: 0,
  },
  filters: {},
};

const DEFAULT_FILTERS = {
  search: "",
  sort: "latest",
  minPrice: "",
  maxPrice: "",
  inStock: "",
  page: "1",
};

const normalizeFilters = (filters = {}) => ({
  search: filters.search || "",
  sort: filters.sort || "latest",
  minPrice: filters.minPrice || "",
  maxPrice: filters.maxPrice || "",
  inStock: filters.inStock || "",
  page: filters.page || "1",
});

const serializeFilters = (filters = {}) => JSON.stringify(normalizeFilters(filters));

const buildProductParams = (slug, filters = {}) => ({
  search: filters.search || "",
  sort: filters.sort || "latest",
  minPrice: filters.minPrice || "",
  maxPrice: filters.maxPrice || "",
  inStock: filters.inStock || "",
  category: slug,
  page: "1",
  limit: "12",
});

export default function CategoryCatalogClient({ categories = [], initialCategory, initialProductResponse, initialFilters }) {
  const initialFilterState = useMemo(() => normalizeFilters(initialFilters), [initialFilters]);
  const [activeSlug, setActiveSlug] = useState(initialCategory.slug);
  const [activeFilters, setActiveFilters] = useState(initialFilterState);
  const [draftFilters, setDraftFilters] = useState(initialFilterState);
  const [productResponse, setProductResponse] = useState(initialProductResponse || EMPTY_PRODUCT_RESPONSE);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);
  const activeSlugRef = useRef(initialCategory.slug);
  const activeFiltersRef = useRef(initialFilterState);
  const propSnapshotRef = useRef({
    slug: initialCategory.slug,
    response: initialProductResponse,
    filtersKey: serializeFilters(initialFilterState),
  });

  const activeCategory = useMemo(
    () => categories.find((category) => category.slug === activeSlug) || initialCategory,
    [activeSlug, categories, initialCategory]
  );
  const shelfTheme = getCategoryTheme(activeCategory);
  const branchCategories = useMemo(() => {
    const branch = getCategoryBranch(categories, activeSlug);
    return branch.length ? branch : [activeCategory];
  }, [activeCategory, activeSlug, categories]);

  useEffect(() => {
    const nextInitialFilters = initialFilterState;
    const nextFiltersKey = serializeFilters(nextInitialFilters);
    const propsChanged =
      propSnapshotRef.current.slug !== initialCategory.slug ||
      propSnapshotRef.current.response !== initialProductResponse ||
      propSnapshotRef.current.filtersKey !== nextFiltersKey;

    if (!propsChanged) {
      return;
    }

    propSnapshotRef.current = {
      slug: initialCategory.slug,
      response: initialProductResponse,
      filtersKey: nextFiltersKey,
    };
    requestIdRef.current += 1;
    activeSlugRef.current = initialCategory.slug;
    activeFiltersRef.current = nextInitialFilters;
    setActiveSlug(initialCategory.slug);
    setActiveFilters(nextInitialFilters);
    setDraftFilters(nextInitialFilters);
    setProductResponse(initialProductResponse || EMPTY_PRODUCT_RESPONSE);
    setIsProductsLoading(false);
    setError("");
  }, [initialCategory.slug, initialFilterState, initialProductResponse]);

  useEffect(() => {
    activeSlugRef.current = activeSlug;
    emitStorefrontCategoryActive({ slug: activeSlug });
  }, [activeSlug]);

  const loadCategoryProducts = useCallback(
    async (nextSlug, nextFilters = activeFiltersRef.current) => {
      const resolvedSlug = nextSlug || activeSlugRef.current;
      const resolvedFilters = normalizeFilters(nextFilters);
      const sameSlug = resolvedSlug === activeSlugRef.current;
      const sameFilters = serializeFilters(resolvedFilters) === serializeFilters(activeFiltersRef.current);

      if (!resolvedSlug || (sameSlug && sameFilters)) {
        return;
      }

      const nextCategory = categories.find((category) => category.slug === resolvedSlug);

      if (!nextCategory) {
        return;
      }

      const previousSlug = activeSlugRef.current;
      const previousFilters = activeFiltersRef.current;
      const requestId = requestIdRef.current + 1;

      requestIdRef.current = requestId;
      activeSlugRef.current = resolvedSlug;
      activeFiltersRef.current = resolvedFilters;
      setActiveSlug(resolvedSlug);
      setActiveFilters(resolvedFilters);
      setDraftFilters(resolvedFilters);
      setIsProductsLoading(true);
      setError("");

      try {
        const nextResponse = await catalogService.getProducts(buildProductParams(resolvedSlug, resolvedFilters));

        if (requestId !== requestIdRef.current) {
          return;
        }

        setProductResponse(nextResponse || EMPTY_PRODUCT_RESPONSE);
      } catch (fetchError) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        activeSlugRef.current = previousSlug;
        activeFiltersRef.current = previousFilters;
        setActiveSlug(previousSlug);
        setActiveFilters(previousFilters);
        setDraftFilters(previousFilters);
        setError(fetchError?.message || "Unable to load products for this category right now.");
      } finally {
        if (requestId === requestIdRef.current) {
          setIsProductsLoading(false);
        }
      }
    },
    [categories]
  );

  useEffect(() => {
    const unsubscribe = subscribeToStorefrontCategorySelect(({ slug }) => {
      if (slug) {
        void loadCategoryProducts(slug, activeFiltersRef.current);
      }
    });

    return unsubscribe;
  }, [loadCategoryProducts]);

  const handleDraftFilterChange = useCallback((key, value) => {
    setDraftFilters((current) =>
      normalizeFilters({
        ...current,
        [key]: value,
        page: "1",
      })
    );
  }, []);

  const handlePrepareFilterPanel = useCallback(() => {
    setDraftFilters(normalizeFilters(activeFiltersRef.current));
  }, []);

  const handleApplyFilters = useCallback(() => {
    void loadCategoryProducts(activeSlugRef.current, draftFilters);
  }, [draftFilters, loadCategoryProducts]);

  const handleClearDraftFilters = useCallback(() => {
    setDraftFilters({ ...DEFAULT_FILTERS });
  }, []);

  const handleQuickFilterToggle = useCallback((partialFilters = {}) => {
    setDraftFilters((current) =>
      normalizeFilters({
        ...current,
        ...partialFilters,
        page: "1",
      })
    );
  }, []);

  return (
    <div className="space-y-4">
      <CategoryMobileShelf
        categories={branchCategories}
        allCategories={categories}
        activeCategory={activeCategory}
        shelfTheme={shelfTheme}
        activeFilters={activeFilters}
        draftFilters={draftFilters}
        productResponse={productResponse}
        onCategorySelect={(slug) => void loadCategoryProducts(slug, activeFiltersRef.current)}
        onDraftFilterChange={handleDraftFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearDraftFilters={handleClearDraftFilters}
        onPrepareFilterPanel={handlePrepareFilterPanel}
        onQuickFilterToggle={handleQuickFilterToggle}
        pendingCategorySlug={isProductsLoading ? activeSlug : ""}
        isProductsLoading={isProductsLoading}
      >
        {error ? <StatusBanner tone="error" title="Products unavailable" message={error} /> : null}

        {productResponse?.products?.length ? (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
            {productResponse.products.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        ) : (
          <div className="rounded-[1rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500 md:p-5">
            No products matched these filters in this category yet.
          </div>
        )}
      </CategoryMobileShelf>
    </div>
  );
}
