import axios from "axios";

import { normalizeApiError } from "@/lib/api-error";
import { API_BASE_URL } from "@/lib/api-config";

const AUTH_STORAGE_KEY = "codex_auth_token";
export const API_ERROR_EVENT = "codex-commerce:api-error";
export const API_AUTH_ERROR_EVENT = "codex-commerce:auth-error";

let inMemoryAuthToken = null;

const canUseBrowserStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";
const isFormDataPayload = (value) => typeof FormData !== "undefined" && value instanceof FormData;

const removeJsonContentType = (headers) => {
  if (!headers) {
    return;
  }

  if (typeof headers.delete === "function") {
    headers.delete("Content-Type");
    headers.delete("content-type");
    return;
  }

  delete headers["Content-Type"];
  delete headers["content-type"];
};

const readStoredAuthToken = () => {
  if (inMemoryAuthToken) {
    return inMemoryAuthToken;
  }

  if (!canUseBrowserStorage()) {
    return null;
  }

  const storedToken = window.localStorage.getItem(AUTH_STORAGE_KEY);
  return storedToken || null;
};

export const setApiAuthToken = (token, options = {}) => {
  const { persist = false } = options;
  inMemoryAuthToken = token || null;

  if (!canUseBrowserStorage()) {
    return inMemoryAuthToken;
  }

  if (!token) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }

  if (persist) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  return inMemoryAuthToken;
};

export const clearApiAuthToken = () => setApiAuthToken(null);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};

    if (isFormDataPayload(config.data)) {
      removeJsonContentType(config.headers);
    }

    const token = readStoredAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(normalizeApiError(error, "Unable to prepare this request."))
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = normalizeApiError(error);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(API_ERROR_EVENT, { detail: normalizedError }));

      if (normalizedError.status === 401) {
        clearApiAuthToken();
        window.dispatchEvent(new CustomEvent(API_AUTH_ERROR_EVENT, { detail: normalizedError }));
      }
    }

    return Promise.reject(normalizedError);
  }
);

export default api;
