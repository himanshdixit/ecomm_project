import path from "node:path";

import multer from "multer";

import { generateSlug } from "../utils/generateSlug.js";
import { ensureProductUploadsDirectory, productUploadsDirectory } from "../utils/uploadStorage.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const mimeExtensionMap = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

export const MAX_PRODUCT_IMAGES = 6;
export const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination(req, file, callback) {
    try {
      ensureProductUploadsDirectory();
      callback(null, productUploadsDirectory);
    } catch (error) {
      callback(error);
    }
  },
  filename(req, file, callback) {
    const originalExtension = path.extname(file.originalname || "").toLowerCase();
    const safeExtension = originalExtension || mimeExtensionMap[file.mimetype] || ".jpg";
    const baseName = generateSlug(path.basename(file.originalname || "product-image", originalExtension) || "product-image") || "product-image";

    callback(null, `${baseName}-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`);
  },
});

const fileFilter = (req, file, callback) => {
  if (allowedMimeTypes.has(file.mimetype)) {
    callback(null, true);
    return;
  }

  const error = new Error("Only JPG, PNG, WEBP, and AVIF images are supported.");
  error.statusCode = 400;
  error.code = "INVALID_FILE_TYPE";
  callback(error);
};

export const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: {
    files: MAX_PRODUCT_IMAGES,
    fileSize: MAX_PRODUCT_IMAGE_SIZE,
  },
}).array("images", MAX_PRODUCT_IMAGES);
