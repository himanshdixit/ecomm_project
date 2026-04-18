const DEFAULT_DEV_API_BASE_URL = "http://localhost:5000/api/v1";
const DEFAULT_DEV_MEDIA_BASE_URL = "http://localhost:5000";
const ABSOLUTE_URL_PATTERN = /^(?:https?:)?\/\//i;
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

const trimTrailingSlash = (value) => value?.replace(/\/$/, "") || "";

const normalizeUploadPath = (value) =>
  String(value || "")
    .trim()
    .replace(/^\/api\/v1(?=\/uploads\/)/i, "")
    .replace(/^api\/v1(?=\/uploads\/)/i, "");

const resolveApiBaseUrl = () => {
  const configuredUrl = trimTrailingSlash(process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "");

  if (configuredUrl) {
    return configuredUrl;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEFAULT_DEV_API_BASE_URL;
  }

  return "";
};

const resolveApiOrigin = (value) => {
  if (!value) {
    return "";
  }

  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
};

const resolveMediaBaseUrl = (apiBaseUrl) => {
  const configuredUrl = trimTrailingSlash(process.env.MEDIA_BASE_URL || process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "");

  if (configuredUrl) {
    return configuredUrl;
  }

  const apiOrigin = resolveApiOrigin(apiBaseUrl);

  if (apiOrigin) {
    return apiOrigin;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEFAULT_DEV_MEDIA_BASE_URL;
  }

  return "";
};

const apiBaseUrl = resolveApiBaseUrl();
const mediaBaseUrl = resolveMediaBaseUrl(apiBaseUrl);

const isPrivateHostname = (hostname = "") => {
  const normalized = String(hostname || "").trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  if (LOCAL_HOSTNAMES.has(normalized)) {
    return true;
  }

  return (
    normalized.startsWith("10.") ||
    normalized.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)
  );
};

export const API_BASE_URL = apiBaseUrl;
export const API_ORIGIN = resolveApiOrigin(apiBaseUrl);
export const MEDIA_BASE_URL = mediaBaseUrl;
export const hasApiBaseUrl = Boolean(API_BASE_URL);

export const resolveMediaUrl = (value) => {
  const normalized = normalizeUploadPath(value);

  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("data:") || normalized.startsWith("blob:")) {
    return normalized;
  }

  if (ABSOLUTE_URL_PATTERN.test(normalized)) {
    try {
      const url = new URL(normalized);
      url.pathname = normalizeUploadPath(url.pathname);
      return url.toString();
    } catch {
      return normalized;
    }
  }

  if (normalized.startsWith("/uploads/") && MEDIA_BASE_URL) {
    return `${MEDIA_BASE_URL}${normalized}`;
  }

  if (normalized.startsWith("uploads/") && MEDIA_BASE_URL) {
    return `${MEDIA_BASE_URL}/${normalized}`;
  }

  return normalized;
};

export const shouldBypassNextImageOptimization = (value) => {
  const resolved = resolveMediaUrl(value);

  if (!resolved || !ABSOLUTE_URL_PATTERN.test(resolved)) {
    return false;
  }

  try {
    return isPrivateHostname(new URL(resolved).hostname);
  } catch {
    return false;
  }
};
