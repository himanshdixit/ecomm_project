import { requestResource } from "@/services/api/baseService";

export const wishlistService = {
  getWishlist() {
    return requestResource({ url: "/wishlist", method: "get" }, "wishlist");
  },
  toggleProduct(productId) {
    return requestResource({ url: "/wishlist/toggle", method: "post", data: { productId } }, "wishlist");
  },
};
