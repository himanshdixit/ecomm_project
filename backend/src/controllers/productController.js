import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { getCategoryAndDescendantIds } from "../utils/catalog.js";
import { generateSlug } from "../utils/generateSlug.js";
import { syncProductSummaryFromVariants } from "../utils/productVariants.js";
import { serializeProduct } from "../utils/serializers.js";
import { deleteManagedProductUploadFiles, getProductUploadPublicPath } from "../utils/uploadStorage.js";

const CATEGORY_SELECT = "name shortName slug description image tint deliveryTime isFeatured parent root level sortOrder pathIds pathNames pathSlugs";
const MAX_PRODUCT_IMAGES = 6;

const sortMap = {
  latest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { rating: -1 },
  popular: { reviewsCount: -1 },
  name: { name: 1 },
  stock_low: { stock: 1, createdAt: -1 },
  stock_high: { stock: -1, createdAt: -1 },
};

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value || {}, key);

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toBoolean = (value, fallback = null) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return fallback;
};

const parseJsonArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    const parsedArray = parseJsonArray(trimmed);

    if (parsedArray.length) {
      return parsedArray.map((item) => String(item).trim()).filter(Boolean);
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeTokenArray = (value) => parseJsonArray(value).map((item) => String(item).trim()).filter(Boolean);

const parseVariantsInput = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const resolveCategoryDocument = async (value) => {
  if (!value) {
    return null;
  }

  if (mongoose.Types.ObjectId.isValid(value)) {
    const category = await Category.findById(value).select("_id");
    return category || null;
  }

  const category = await Category.findOne({ slug: value }).select("_id");
  return category || null;
};

const buildProductVariants = (body, existingProduct = null) => {
  const explicitVariants = parseVariantsInput(body.variants);

  if (explicitVariants.length) {
    return explicitVariants;
  }

  const existingVariants = Array.isArray(existingProduct?.variants)
    ? existingProduct.variants.map((variant) => ({
        _id: variant._id,
        label: variant.label,
        packLabel: variant.packLabel,
        sku: variant.sku,
        price: variant.price,
        originalPrice: variant.originalPrice,
        stock: variant.stock,
        sortOrder: variant.sortOrder,
        isDefault: variant.isDefault,
      }))
    : [];

  if (existingVariants.length) {
    const defaultIndex = existingVariants.findIndex((variant) => variant.isDefault);
    const resolvedDefaultIndex = defaultIndex >= 0 ? defaultIndex : 0;

    return existingVariants.map((variant, index) => {
      if (index !== resolvedDefaultIndex) {
        return variant;
      }

      return {
        ...variant,
        label: hasOwn(body, "unit") ? String(body.unit || "").trim() || variant.label : variant.label,
        packLabel: hasOwn(body, "unit") ? String(body.unit || "").trim() || variant.packLabel || variant.label : variant.packLabel,
        price: hasOwn(body, "price") ? toNumber(body.price) ?? variant.price : variant.price,
        originalPrice: hasOwn(body, "originalPrice") ? toNumber(body.originalPrice) ?? variant.originalPrice : variant.originalPrice,
        stock: hasOwn(body, "stock") ? toNumber(body.stock) ?? variant.stock : variant.stock,
        isDefault: true,
      };
    });
  }

  return [
    {
      label: String(body.unit || existingProduct?.unit || "1 unit").trim() || "1 unit",
      packLabel: String(body.unit || existingProduct?.unit || "1 unit").trim() || "1 unit",
      price: toNumber(body.price) ?? existingProduct?.price ?? 0,
      originalPrice: toNumber(body.originalPrice) ?? existingProduct?.originalPrice ?? toNumber(body.price) ?? existingProduct?.price ?? 0,
      stock: toNumber(body.stock) ?? existingProduct?.stock ?? 0,
      sortOrder: 0,
      isDefault: true,
    },
  ];
};

const extractUploadedImagePaths = (files = []) =>
  (Array.isArray(files) ? files : []).map((file) => getProductUploadPublicPath(file.filename)).filter(Boolean);

const buildOrderedProductImages = ({ existingImages = [], uploadedImages = [], imageOrder = [], newImageKeys = [] }) => {
  const orderedImages = [];
  const seenImages = new Set();
  const existingSet = new Set(existingImages);
  const uploadedEntries = newImageKeys.map((key, index) => [key, uploadedImages[index]]).filter((entry) => Boolean(entry[0] && entry[1]));
  const uploadedImageMap = new Map(uploadedEntries);

  const pushImage = (value) => {
    const normalized = String(value || "").trim();

    if (!normalized || seenImages.has(normalized)) {
      return;
    }

    seenImages.add(normalized);
    orderedImages.push(normalized);
  };

  imageOrder.forEach((token) => {
    if (token.startsWith("existing:")) {
      const existingImage = token.slice("existing:".length);

      if (existingSet.has(existingImage)) {
        pushImage(existingImage);
      }

      return;
    }

    if (token.startsWith("new:")) {
      pushImage(uploadedImageMap.get(token));
    }
  });

  existingImages.forEach(pushImage);
  uploadedImages.forEach(pushImage);

  return orderedImages;
};

const buildProductPayload = async (body, { existingProduct = null, uploadedImages = [] } = {}) => {
  const name = body.name?.trim() || existingProduct?.name || "";
  const highlights = normalizeStringArray(body.highlights);
  const tags = normalizeStringArray(body.tags);
  const categoryDoc = await resolveCategoryDocument(body.category || existingProduct?.category);

  if (!categoryDoc) {
    return { error: "A valid category is required." };
  }

  const currentImages = Array.isArray(existingProduct?.images) ? existingProduct.images : [];
  const retainedExistingImages = existingProduct
    ? hasOwn(body, "existingImages")
      ? normalizeStringArray(body.existingImages).filter((image) => currentImages.includes(image))
      : currentImages
    : normalizeStringArray(body.images);
  const imageOrder = normalizeTokenArray(body.imageOrder);
  const newImageKeys = normalizeTokenArray(body.newImageKeys);
  const images = buildOrderedProductImages({
    existingImages: retainedExistingImages,
    uploadedImages,
    imageOrder,
    newImageKeys,
  });

  if (images.length > MAX_PRODUCT_IMAGES) {
    return { error: `You can attach up to ${MAX_PRODUCT_IMAGES} images per product.` };
  }

  const rawPayload = {
    name,
    slug: body.slug ? generateSlug(body.slug) : generateSlug(name),
    description: body.description?.trim() || existingProduct?.description || "",
    badge: body.badge?.trim() || existingProduct?.badge || "Fresh pick",
    rating: toNumber(body.rating) ?? existingProduct?.rating ?? 4.5,
    reviewsCount: toNumber(body.reviewsCount) ?? existingProduct?.reviewsCount ?? 0,
    deliveryTime: body.deliveryTime?.trim() || existingProduct?.deliveryTime || "Fast delivery",
    category: categoryDoc._id,
    images,
    highlights: highlights.length > 0 ? highlights : existingProduct?.highlights || [],
    tags: tags.length > 0 ? tags : existingProduct?.tags || [],
    tint: body.tint?.trim() || existingProduct?.tint || "#EAF6F7",
    isFeatured: toBoolean(body.isFeatured, existingProduct?.isFeatured ?? false),
    isActive: toBoolean(body.isActive, existingProduct?.isActive ?? true),
    variants: buildProductVariants(body, existingProduct),
  };

  const { price, originalPrice, stock, unit, variants } = syncProductSummaryFromVariants(rawPayload);

  return {
    ...rawPayload,
    price,
    originalPrice,
    stock,
    unit,
    variants,
  };
};

const deleteUnreferencedManagedImages = async (images = [], { excludeProductId = null } = {}) => {
  const uniqueImages = [...new Set((Array.isArray(images) ? images : [images]).filter(Boolean))];

  if (!uniqueImages.length) {
    return;
  }

  const removableImages = [];

  for (const image of uniqueImages) {
    const query = { images: image };

    if (excludeProductId) {
      query._id = { $ne: excludeProductId };
    }

    const isStillReferenced = await Product.exists(query);

    if (!isStillReferenced) {
      removableImages.push(image);
    }
  }

  await deleteManagedProductUploadFiles(removableImages);
};

const buildProductQuery = async (params = {}, { includeInactive = false } = {}) => {
  const { search = "", category = "", featured, inStock, status = "all" } = params;
  const minPrice = toNumber(params.minPrice);
  const maxPrice = toNumber(params.maxPrice);
  const query = includeInactive ? {} : { isActive: true };

  if (search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ name: regex }, { description: regex }, { tags: regex }, { "variants.label": regex }];
  }

  if (featured === "true") {
    query.isFeatured = true;
  }

  if (inStock === "true") {
    query.stock = { $gt: 0 };
  }

  if (minPrice !== null || maxPrice !== null) {
    query.price = {};

    if (minPrice !== null) {
      query.price.$gte = minPrice;
    }

    if (maxPrice !== null) {
      query.price.$lte = maxPrice;
    }
  }

  if (includeInactive) {
    if (status === "active") {
      query.isActive = true;
    }

    if (status === "inactive") {
      query.isActive = false;
    }
  }

  if (category) {
    const categories = await Category.find().select("_id slug parent root level sortOrder pathIds pathNames pathSlugs name").lean();
    const categoryIds = getCategoryAndDescendantIds(categories, category);

    if (!categoryIds.length) {
      return {
        query: null,
        filters: {
          search,
          category,
          status,
          minPrice,
          maxPrice,
          featured: featured === "true",
          inStock: inStock === "true",
        },
      };
    }

    query.category = {
      $in: categoryIds.map((id) => new mongoose.Types.ObjectId(id)),
    };
  }

  return {
    query,
    filters: {
      search,
      category,
      status,
      minPrice,
      maxPrice,
      featured: featured === "true",
      inStock: inStock === "true",
    },
  };
};

const sendProductListResponse = async ({ req, res, includeInactive = false }) => {
  const sort = req.query.sort || "latest";
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
  const { query, filters } = await buildProductQuery(req.query, { includeInactive });

  if (!query) {
    res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      data: {
        products: [],
        pagination: {
          page,
          limit,
          pages: 0,
          total: 0,
        },
        filters: {
          ...filters,
          sort,
        },
      },
    });
    return;
  }

  const skip = (page - 1) * limit;
  const sortOption = sortMap[sort] || sortMap.latest;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", CATEGORY_SELECT)
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    message: "Products fetched successfully.",
    data: {
      products: products.map((product) => serializeProduct(product)),
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit),
        total,
      },
      filters: {
        ...filters,
        sort,
      },
    },
  });
};

export const getProducts = asyncHandler(async (req, res) => {
  await sendProductListResponse({ req, res, includeInactive: false });
});

export const getAdminProducts = asyncHandler(async (req, res) => {
  await sendProductListResponse({ req, res, includeInactive: true });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate("category", CATEGORY_SELECT);

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category?._id,
    isActive: true,
  })
    .populate("category", CATEGORY_SELECT)
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(4);

  res.status(200).json({
    success: true,
    message: "Product fetched successfully.",
    data: {
      product: serializeProduct(product),
      relatedProducts: relatedProducts.map((item) => serializeProduct(item)),
    },
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const uploadedImages = extractUploadedImagePaths(req.files);

  try {
    const payload = await buildProductPayload(req.body, { uploadedImages });

    if (payload.error) {
      res.status(400);
      throw new Error(payload.error);
    }

    if (!payload.name || !payload.description) {
      res.status(400);
      throw new Error("Name and description are required.");
    }

    const product = await Product.create(payload);
    await product.populate("category", CATEGORY_SELECT);

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: {
        product: serializeProduct(product),
      },
    });
  } catch (error) {
    await deleteManagedProductUploadFiles(uploadedImages);
    throw error;
  }
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  const previousImages = Array.isArray(product.images) ? [...product.images] : [];
  const uploadedImages = extractUploadedImagePaths(req.files);

  try {
    const payload = await buildProductPayload(req.body, { existingProduct: product, uploadedImages });

    if (payload.error) {
      res.status(400);
      throw new Error(payload.error);
    }

    Object.assign(product, payload);
    await product.save();
    await product.populate("category", CATEGORY_SELECT);

    const removedImages = previousImages.filter((image) => !payload.images.includes(image));
    await deleteUnreferencedManagedImages(removedImages, { excludeProductId: product._id });

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: {
        product: serializeProduct(product),
      },
    });
  } catch (error) {
    await deleteManagedProductUploadFiles(uploadedImages);
    throw error;
  }
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found.");
  }

  const managedImages = Array.isArray(product.images) ? [...product.images] : [];

  await product.deleteOne();
  await deleteUnreferencedManagedImages(managedImages, { excludeProductId: product._id });

  res.status(200).json({
    success: true,
    message: "Product deleted successfully.",
  });
});
