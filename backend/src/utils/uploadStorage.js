import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(currentDirectory, "..", "..");

export const publicDirectory = path.join(backendRoot, "public");
export const uploadsDirectory = path.join(publicDirectory, "uploads");
export const productUploadsDirectory = path.join(uploadsDirectory, "products");
export const userAvatarUploadsDirectory = path.join(uploadsDirectory, "avatars");
export const productUploadPublicBasePath = "/uploads/products";
export const userAvatarUploadPublicBasePath = "/uploads/avatars";

const ensureDirectory = (directoryPath) => {
  fs.mkdirSync(directoryPath, { recursive: true });
};

const getManagedUploadPublicPath = (basePath, fileName) => `${basePath}/${fileName}`;

const isManagedUploadPath = (value = "", basePath) => String(value || "").startsWith(`${basePath}/`);

const resolveManagedUploadPath = (value = "", { basePath, rootDirectory }) => {
  if (!isManagedUploadPath(value, basePath)) {
    return "";
  }

  const normalized = path.posix.normalize(String(value));

  if (!normalized.startsWith(`${basePath}/`)) {
    return "";
  }

  const relativePath = normalized.slice(basePath.length + 1);
  const resolvedPath = path.resolve(rootDirectory, relativePath);

  if (!resolvedPath.startsWith(rootDirectory)) {
    return "";
  }

  return resolvedPath;
};

const deleteManagedUploadFiles = async (values = [], resolver) => {
  const uniqueValues = [...new Set((Array.isArray(values) ? values : [values]).filter(Boolean))];

  await Promise.all(
    uniqueValues.map(async (value) => {
      const filePath = resolver(value);

      if (!filePath) {
        return;
      }

      try {
        await fs.promises.unlink(filePath);
      } catch (error) {
        if (error?.code !== "ENOENT") {
          throw error;
        }
      }
    })
  );
};

export const ensureProductUploadsDirectory = () => ensureDirectory(productUploadsDirectory);
export const ensureUserAvatarUploadsDirectory = () => ensureDirectory(userAvatarUploadsDirectory);
export const getProductUploadPublicPath = (fileName) => getManagedUploadPublicPath(productUploadPublicBasePath, fileName);
export const getUserAvatarPublicPath = (fileName) => getManagedUploadPublicPath(userAvatarUploadPublicBasePath, fileName);
export const isManagedProductUploadPath = (value = "") => isManagedUploadPath(value, productUploadPublicBasePath);
export const isManagedUserAvatarPath = (value = "") => isManagedUploadPath(value, userAvatarUploadPublicBasePath);
export const resolveManagedProductUploadPath = (value = "") =>
  resolveManagedUploadPath(value, { basePath: productUploadPublicBasePath, rootDirectory: productUploadsDirectory });
export const resolveManagedUserAvatarPath = (value = "") =>
  resolveManagedUploadPath(value, { basePath: userAvatarUploadPublicBasePath, rootDirectory: userAvatarUploadsDirectory });
export const deleteManagedProductUploadFiles = async (values = []) =>
  deleteManagedUploadFiles(values, resolveManagedProductUploadPath);
export const deleteManagedUserAvatarFiles = async (values = []) =>
  deleteManagedUploadFiles(values, resolveManagedUserAvatarPath);
