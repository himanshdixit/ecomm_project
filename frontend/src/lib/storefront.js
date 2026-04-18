import { API_BASE_URL } from "@/lib/api-config";

const DEFAULT_REVALIDATE = 300;
const DEFAULT_PRODUCT_LIMIT = "48";

const getQueryValue = (value) => {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
};

const buildSearch = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const normalizedValue = getQueryValue(value);

    if (normalizedValue !== "" && normalizedValue !== undefined && normalizedValue !== null) {
      searchParams.set(key, String(normalizedValue));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

const requestJson = async (path, options = {}) => {
  if (!API_BASE_URL) {
    return null;
  }

  const { revalidate = DEFAULT_REVALIDATE, tags = [] } = options;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      next: {
        revalidate,
        tags,
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
};

const emptyProductResponse = {
  products: [],
  pagination: {
    page: 1,
    limit: 12,
    pages: 0,
    total: 0,
  },
  filters: {},
};

export const toQueryValue = getQueryValue;

export async function getCategories() {
  const response = await requestJson("/categories", {
    revalidate: 900,
    tags: ["categories"],
  });
  return response?.data?.categories || [];
}

export async function getProducts(params = {}) {
  const response = await requestJson(`/products${buildSearch(params)}`, {
    revalidate: 300,
    tags: ["products"],
  });

  return response?.data || emptyProductResponse;
}

export async function getProductDetail(slug) {
  const response = await requestJson(`/products/${slug}`, {
    revalidate: 300,
    tags: ["products", `product:${slug}`],
  });

  return (
    response?.data || {
      product: null,
      relatedProducts: [],
    }
  );
}

export async function getAllProductsForSitemap() {
  const firstPage = await getProducts({
    limit: DEFAULT_PRODUCT_LIMIT,
    page: "1",
    sort: "latest",
  });

  const pages = Math.max(Number(firstPage.pagination?.pages || 0), 1);
  const collections = [firstPage.products || []];

  if (pages > 1) {
    const remainingPages = await Promise.all(
      Array.from({ length: pages - 1 }, (_, index) =>
        getProducts({
          limit: DEFAULT_PRODUCT_LIMIT,
          page: String(index + 2),
          sort: "latest",
        })
      )
    );

    collections.push(...remainingPages.map((entry) => entry.products || []));
  }

  const seen = new Map();

  collections.flat().forEach((product) => {
    if (product?.slug) {
      seen.set(product.slug, product);
    }
  });

  return Array.from(seen.values());
}

export async function getAllProductSlugs() {
  const products = await getAllProductsForSitemap();
  return products.map((product) => product.slug);
}
