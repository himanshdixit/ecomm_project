import { requestData, requestResource } from "@/services/api/baseService";

export const orderService = {
  getMyOrders() {
    return requestResource({ url: "/orders/my-orders", method: "get" }, "orders");
  },
  getOrderById(orderId) {
    return requestResource({ url: `/orders/my-orders/${orderId}`, method: "get" }, "order");
  },
  createOrder(payload) {
    return requestResource({ url: "/orders", method: "post", data: payload }, "order");
  },
  reorderOrder(orderId) {
    return requestData({ url: `/orders/${orderId}/reorder`, method: "post" });
  },
  cancelOrder(orderId) {
    return requestResource({ url: `/orders/${orderId}/cancel`, method: "patch" }, "order");
  },
  updateOrderStatus(orderId, payload) {
    return requestResource({ url: `/orders/${orderId}/status`, method: "patch", data: payload }, "order");
  },
};
