import { requestResource } from "@/services/api/baseService";

export const adminService = {
  getCategories() {
    return requestResource({ url: "/categories", method: "get" }, "categories");
  },
  createProduct(payload) {
    return requestResource({ url: "/products", method: "post", data: payload }, "product");
  },
  updateProduct(productId, payload) {
    return requestResource({ url: `/products/${productId}`, method: "put", data: payload }, "product");
  },
  deleteProduct(productId) {
    return requestResource({ url: `/products/${productId}`, method: "delete" });
  },
  createCategory(payload) {
    return requestResource({ url: "/categories", method: "post", data: payload }, "category");
  },
  updateCategory(categoryId, payload) {
    return requestResource({ url: `/categories/${categoryId}`, method: "put", data: payload }, "category");
  },
  deleteCategory(categoryId) {
    return requestResource({ url: `/categories/${categoryId}`, method: "delete" });
  },
  updateUserRole(userId, role) {
    return requestResource({ url: `/users/${userId}/role`, method: "patch", data: { role } }, "user");
  },
  updateOrder(orderId, payload) {
    return requestResource({ url: `/orders/${orderId}/status`, method: "patch", data: payload }, "order");
  },
};
