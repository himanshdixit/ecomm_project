import { requestData, requestResource } from "@/services/api/baseService";

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const catalogService = {
  getCategories() {
    return requestResource({ url: "/categories", method: "get" }, "categories");
  },
  getProducts(params = {}) {
    return requestData({ url: `/products${buildQueryString(params)}`, method: "get" });
  },
};
