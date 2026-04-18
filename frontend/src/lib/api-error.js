import axios from "axios";

export class ApiError extends Error {
  constructor({ message, status = 500, code = "API_ERROR", details = null, originalError = null }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.originalError = originalError;
  }
}

export const normalizeApiError = (error, fallbackMessage = "Something went wrong. Please try again.") => {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const payload = error.response?.data;

    return new ApiError({
      message: payload?.message || error.message || fallbackMessage,
      status: error.response?.status || 500,
      code: payload?.code || error.code || "API_ERROR",
      details: payload?.errors || payload?.data || null,
      originalError: error,
    });
  }

  return new ApiError({
    message: error?.message || fallbackMessage,
    originalError: error,
  });
};

export const getApiErrorMessage = (error, fallbackMessage) => normalizeApiError(error, fallbackMessage).message;
