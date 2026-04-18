import { config } from "../config/env.js";

const getMulterErrorMessage = (error) => {
  if (error?.code === "LIMIT_FILE_COUNT") {
    return error.field === "avatar" ? "You can upload only one profile picture." : "You can upload up to 6 images per product.";
  }

  if (error?.code === "LIMIT_FILE_SIZE") {
    return error.field === "avatar" ? "Profile pictures must be 3 MB or smaller." : "Each product image must be 5 MB or smaller.";
  }

  if (error?.code === "LIMIT_UNEXPECTED_FILE") {
    return error.field === "avatar"
      ? "Unexpected upload field. Use the avatar field for profile picture uploads."
      : "Unexpected upload field. Use the product images field for uploads.";
  }

  return error?.message || "Upload failed.";
};

export const errorHandler = (error, req, res, next) => {
  const isMulterError = error?.name === "MulterError";
  const statusCode = isMulterError
    ? 400
    : res.statusCode && res.statusCode !== 200
      ? res.statusCode
      : error.statusCode || 500;

  const response = {
    success: false,
    message: isMulterError ? getMulterErrorMessage(error) : error.message || "Internal server error",
    error: {
      code: error.code || (statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_FAILED"),
      details: error.details || (isMulterError && error.field ? { field: error.field } : null),
    },
  };

  if (config.nodeEnv !== "production") {
    response.error.stack = error.stack;
  }

  res.status(statusCode).json(response);
};
