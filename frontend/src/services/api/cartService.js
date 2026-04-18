import { requestResource } from "@/services/api/baseService";

export const cartService = {
  getCart() {
    return requestResource({ url: "/cart", method: "get" }, "cart");
  },
  addItem(payload) {
    return requestResource({ url: "/cart", method: "post", data: payload }, "cart");
  },
  updateItemQuantity(itemId, quantity) {
    return requestResource({ url: `/cart/${itemId}`, method: "patch", data: { quantity } }, "cart");
  },
  removeItem(itemId) {
    return requestResource({ url: `/cart/${itemId}`, method: "delete" }, "cart");
  },
};
