import { cache } from "react";
import { redirect } from "next/navigation";

import { API_BASE_URL } from "@/lib/api-config";
import { getServerAuthHeaders } from "@/lib/server-auth";

export const getSessionUser = cache(async () => {
  if (!API_BASE_URL) {
    return null;
  }

  const authHeaders = await getServerAuthHeaders();

  if (!Object.keys(authHeaders).length) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: authHeaders,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return payload?.data?.user ?? null;
  } catch {
    return null;
  }
});

export async function requireUser(redirectTo = "/login") {
  const user = await getSessionUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

export async function requireAdmin(redirectTo = "/login?redirect=/admin") {
  const user = await getSessionUser();

  if (!user) {
    redirect(redirectTo);
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  return user;
}

export async function requireGuest() {
  const user = await getSessionUser();

  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/");
  }
}
