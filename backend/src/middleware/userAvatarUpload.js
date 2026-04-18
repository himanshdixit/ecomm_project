import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";

import { ensureUserAvatarUploadsDirectory, userAvatarUploadsDirectory } from "../utils/uploadStorage.js";

const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_AVATAR_SIZE = 3 * 1024 * 1024;

const storage = multer.diskStorage({
  destination(req, file, callback) {
    ensureUserAvatarUploadsDirectory();
    callback(null, userAvatarUploadsDirectory);
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeExtension = extension || ".jpg";
    const uniqueSegment = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
    callback(null, `avatar-${uniqueSegment}${safeExtension}`);
  },
});

const fileFilter = (req, file, callback) => {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "avatar"));
    return;
  }

  callback(null, true);
};

export const uploadUserAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_AVATAR_SIZE,
    files: 1,
  },
}).single("avatar");

export { MAX_AVATAR_SIZE };
