import { requestResource } from "@/services/api/baseService";

export const userService = {
  getDashboard() {
    return requestResource({ url: "/users/me/dashboard", method: "get" }, "dashboard");
  },
  updateProfile(payload) {
    return requestResource({ url: "/users/me/profile", method: "put", data: payload }, "user");
  },
};
