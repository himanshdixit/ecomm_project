import { API_BASE_URL } from "@/lib/api-config";
import { getServerAuthHeaders } from "@/lib/server-auth";

const defaultDashboard = {
  summary: {
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    averageOrderValue: 0,
  },
  charts: {
    monthlyRevenue: [],
    monthlyOrders: [],
    monthlyUsers: [],
    ordersByStatus: [],
  },
  recentOrders: [],
  lowStockProducts: [],
};

const defaultProductCollection = {
  products: [],
  pagination: {
    page: 1,
    limit: 24,
    pages: 0,
    total: 0,
  },
  filters: {},
};

const buildSearch = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

const requestJson = async (path, fallback) => {
  if (!API_BASE_URL) {
    return fallback;
  }

  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: authHeaders,
      cache: "no-store",
    });

    if (!response.ok) {
      return fallback;
    }

    const payload = await response.json();
    return payload?.data ?? fallback;
  } catch {
    return fallback;
  }
};

export async function getAdminDashboard() {
  return requestJson("/admin/dashboard", defaultDashboard);
}

export async function getAdminProducts(params = {}) {
  return requestJson(`/products/admin/all${buildSearch(params)}`, defaultProductCollection);
}

export async function getAdminCategories() {
  const data = await requestJson("/categories", { categories: [] });
  return data.categories || [];
}

export async function getAdminUsers() {
  const data = await requestJson("/users", { users: [] });
  return data.users || [];
}

export async function getAdminOrders() {
  const data = await requestJson("/orders", { orders: [] });
  return data.orders || [];
}
