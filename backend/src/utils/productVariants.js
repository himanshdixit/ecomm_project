import { generateSlug } from "./generateSlug.js";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toPositiveStock = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : fallback;
};

const normalizeVariantLabel = (label, fallback = "1 unit") => String(label || fallback).trim() || fallback;

export const normalizeProductVariants = (productLike = {}) => {
  const rawVariants = Array.isArray(productLike.variants)
    ? productLike.variants
    : [];

  const normalizedVariants = rawVariants
    .map((variant, index) => {
      const label = normalizeVariantLabel(variant?.label, productLike.unit || `Variant ${index + 1}`);
      const price = toNumber(variant?.price, toNumber(productLike.price, 0));
      const originalPrice = toNumber(variant?.originalPrice, price);
      const stock = toPositiveStock(variant?.stock, toPositiveStock(productLike.stock, 0));
      const skuBase = productLike.slug || productLike.name || productLike._id || `product-${index + 1}`;

      return {
        _id: variant?._id,
        id: variant?.id,
        label,
        packLabel: String(variant?.packLabel || label).trim(),
        sku: String(variant?.sku || `${generateSlug(String(skuBase))}-${generateSlug(label)}`).trim(),
        price,
        originalPrice: originalPrice >= price ? originalPrice : price,
        stock,
        sortOrder: Number(variant?.sortOrder || index),
        isDefault: Boolean(variant?.isDefault),
      };
    })
    .filter((variant) => variant.label);

  if (!normalizedVariants.length) {
    normalizedVariants.push({
      label: normalizeVariantLabel(productLike.unit, "1 unit"),
      packLabel: normalizeVariantLabel(productLike.unit, "1 unit"),
      sku: generateSlug(productLike.slug || productLike.name || "default"),
      price: toNumber(productLike.price, 0),
      originalPrice: toNumber(productLike.originalPrice, toNumber(productLike.price, 0)),
      stock: toPositiveStock(productLike.stock, 0),
      sortOrder: 0,
      isDefault: true,
    });
  }

  normalizedVariants.sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0));

  const defaultIndex = normalizedVariants.findIndex((variant) => variant.isDefault);
  const resolvedDefaultIndex = defaultIndex >= 0 ? defaultIndex : 0;

  return normalizedVariants.map((variant, index) => ({
    ...variant,
    isDefault: index === resolvedDefaultIndex,
  }));
};

export const getDefaultVariant = (productLike = {}) => {
  const variants = normalizeProductVariants(productLike);
  return variants.find((variant) => variant.isDefault) || variants[0];
};

export const resolveProductVariant = (productLike = {}, variantId = "") => {
  const variants = normalizeProductVariants(productLike);
  const normalizedVariantId = String(variantId || "");

  if (normalizedVariantId) {
    const matchedVariant = variants.find((variant) => String(variant._id || variant.id || "") === normalizedVariantId);

    if (matchedVariant) {
      return matchedVariant;
    }
  }

  return variants.find((variant) => variant.isDefault) || variants[0];
};

export const syncProductSummaryFromVariants = (productLike = {}) => {
  const variants = normalizeProductVariants(productLike);
  const defaultVariant = variants.find((variant) => variant.isDefault) || variants[0];

  return {
    variants,
    defaultVariant,
    price: toNumber(defaultVariant?.price, 0),
    originalPrice: toNumber(defaultVariant?.originalPrice, toNumber(defaultVariant?.price, 0)),
    stock: toPositiveStock(defaultVariant?.stock, 0),
    unit: defaultVariant?.label || normalizeVariantLabel(productLike.unit),
  };
};

export const serializeProductVariant = (variant = {}) => ({
  id: String(variant._id || variant.id || ""),
  label: normalizeVariantLabel(variant.label),
  packLabel: String(variant.packLabel || variant.label || "").trim(),
  sku: String(variant.sku || "").trim(),
  price: toNumber(variant.price, 0),
  originalPrice: toNumber(variant.originalPrice, toNumber(variant.price, 0)),
  stock: toPositiveStock(variant.stock, 0),
  sortOrder: Number(variant.sortOrder || 0),
  isDefault: Boolean(variant.isDefault),
});
