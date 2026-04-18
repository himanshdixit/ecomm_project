import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { API_BASE_URL } from "@/lib/api-config";

const AUTH_COOKIE_NAME = "token";

export const getSessionUser = cache(async () => {
  if (!API_BASE_URL) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Cookie: `${AUTH_COOKIE_NAME}=${token}`,
      },
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
