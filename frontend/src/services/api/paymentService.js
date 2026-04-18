import { requestResource } from "@/services/api/baseService";

export const paymentService = {
  createIntent(payload) {
    return requestResource({ url: "/payments/create-intent", method: "post", data: payload }, "paymentIntent");
  },
};
