import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "token";

export async function getServerAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value || "";
}

export async function getServerAuthHeaders() {
  const token = await getServerAuthToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}
