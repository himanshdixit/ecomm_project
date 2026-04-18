import { clearApiAuthToken, setApiAuthToken } from "@/lib/axios";

import { request, requestResource } from "@/services/api/baseService";

const syncTokenFromPayload = (payload) => {
  const token = payload?.data?.token || payload?.token || null;

  if (token) {
    setApiAuthToken(token);
  }

  return token;
};

export const authService = {
  async getProfile() {
    return requestResource({ url: "/auth/me", method: "get" }, "user");
  },
  async login(payload) {
    const response = await request({ url: "/auth/login", method: "post", data: payload });
    syncTokenFromPayload(response);
    return response?.data?.user || null;
  },
  async register(payload) {
    const response = await request({ url: "/auth/register", method: "post", data: payload });
    syncTokenFromPayload(response);
    return response?.data?.user || null;
  },
  async logout() {
    try {
      return await request({ url: "/auth/logout", method: "post" });
    } finally {
      clearApiAuthToken();
    }
  },
};
