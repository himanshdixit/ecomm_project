const SESSION_SYNC_PATH = "/api/session";

const canUseBrowser = () => typeof window !== "undefined";

export async function syncFrontendSessionCookie(token) {
  if (!canUseBrowser() || !token) {
    return;
  }

  try {
    await fetch(SESSION_SYNC_PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({ token }),
    });
  } catch {
    // Best-effort sync for frontend-domain server auth checks.
  }
}

export async function clearFrontendSessionCookie() {
  if (!canUseBrowser()) {
    return;
  }

  try {
    await fetch(SESSION_SYNC_PATH, {
      method: "DELETE",
      credentials: "same-origin",
    });
  } catch {
    // Best-effort cleanup for frontend-domain server auth checks.
  }
}
