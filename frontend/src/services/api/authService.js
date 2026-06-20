import { clearApiAuthToken, setApiAuthToken } from "@/lib/axios";
import { clearFrontendSessionCookie, syncFrontendSessionCookie } from "@/lib/session-cookie";

import { request, requestResource } from "@/services/api/baseService";

const syncTokenFromPayload = async (payload) => {
  const token = payload?.data?.token || payload?.token || null;

  if (token) {
    setApiAuthToken(token, { persist: true });
    await syncFrontendSessionCookie(token);
  }

  return token;
};

export const authService = {
  async getProfile() {
    return requestResource({ url: "/auth/me", method: "get" }, "user");
  },
  async login(payload) {
    const response = await request({ url: "/auth/login", method: "post", data: payload });
    await syncTokenFromPayload(response);
    return response?.data?.user || null;
  },
  async register(payload) {
    const response = await request({ url: "/auth/register", method: "post", data: payload });
    await syncTokenFromPayload(response);
    return response?.data?.user || null;
  },
  async logout() {
    try {
      return await request({ url: "/auth/logout", method: "post" });
    } finally {
      clearApiAuthToken();
      await clearFrontendSessionCookie();
    }
  },
};
