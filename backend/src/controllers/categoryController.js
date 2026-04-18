import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { applyCategoryHierarchy, buildCategoryTree, findCategoryNode, syncCategoryDescendants } from "../utils/catalog.js";
import { generateSlug } from "../utils/generateSlug.js";
import { serializeCategory } from "../utils/serializers.js";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const resolveParentCategory = async (value = "", currentCategoryId = null) => {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return null;
  }

  let parentCategory = null;

  if (mongoose.Types.ObjectId.isValid(normalizedValue)) {
    parentCategory = await Category.findById(normalizedValue);
  }

  if (!parentCategory) {
    parentCategory = await Category.findOne({ slug: normalizedValue });
  }

  if (!parentCategory) {
    return null;
  }

  if (currentCategoryId && String(parentCategory._id) === String(currentCategoryId)) {
    throw new Error("A category cannot be its own parent.");
  }

  if (currentCategoryId && parentCategory.pathIds?.some((ancestorId) => String(ancestorId) === String(currentCategoryId))) {
    throw new Error("A category cannot be moved inside its own descendant.");
  }

  return parentCategory;
};

const toCategoryPayload = async (body, currentCategory = null) => {
  const name = body.name?.trim() || currentCategory?.name || "";
  const slug = body.slug ? generateSlug(body.slug) : generateSlug(name);
  const parentInput = body.parentSlug ?? body.parent ?? "";
  const parentCategory = await resolveParentCategory(parentInput, currentCategory?._id);

  return {
    name,
    shortName: body.shortName?.trim() || currentCategory?.shortName || name,
    description: body.description?.trim() || currentCategory?.description || "",
    image: body.image?.trim() || currentCategory?.image || "",
    tint: body.tint?.trim() || currentCategory?.tint || "#EAF6F7",
    deliveryTime: body.deliveryTime?.trim() || currentCategory?.deliveryTime || "Fast delivery",
    isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : Boolean(currentCategory?.isFeatured),
    sortOrder: toNumber(body.sortOrder, currentCategory?.sortOrder ?? 0),
    slug,
    parentCategory,
  };
};

const getSerializedCategories = async () => {
  const [categories, productCounts] = await Promise.all([
    Category.find().sort({ sortOrder: 1, name: 1 }).lean(),
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", itemCount: { $sum: 1 } } },
    ]),
  ]);

  const countMap = new Map(productCounts.map((entry) => [String(entry._id), entry.itemCount]));
  const { roots, flat } = buildCategoryTree(categories, countMap);

  return {
    categories: flat.map((category) => serializeCategory(category)),
    categoryTree: roots.map((category) => serializeCategory(category)),
  };
};

export const getCategories = asyncHandler(async (req, res) => {
  const { categories, categoryTree } = await getSerializedCategories();

  res.status(200).json({
    success: true,
    message: "Categories fetched successfully.",
    data: {
      categories,
      categoryTree,
    },
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const payload = await toCategoryPayload(req.body);

  if (!payload.name) {
    res.status(400);
    throw new Error("Category name is required.");
  }

  if (payload.parentCategory && String(payload.parentCategory.slug) === payload.slug) {
    res.status(400);
    throw new Error("A category cannot reuse its parent's slug.");
  }

  const category = new Category({
    name: payload.name,
    shortName: payload.shortName,
    description: payload.description,
    image: payload.image,
    tint: payload.tint,
    deliveryTime: payload.deliveryTime,
    isFeatured: payload.isFeatured,
    sortOrder: payload.sortOrder,
    slug: payload.slug,
  });

  applyCategoryHierarchy(category, payload.parentCategory);
  await category.save();

  res.status(201).json({
    success: true,
    message: "Category created successfully.",
    data: {
      category: serializeCategory(category, { itemCount: 0, directItemCount: 0 }),
    },
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found.");
  }

  const payload = await toCategoryPayload(req.body, category);

  category.name = payload.name;
  category.shortName = payload.shortName;
  category.description = payload.description;
  category.image = payload.image;
  category.tint = payload.tint;
  category.deliveryTime = payload.deliveryTime;
  category.isFeatured = payload.isFeatured;
  category.sortOrder = payload.sortOrder;
  category.slug = payload.slug;
  applyCategoryHierarchy(category, payload.parentCategory);
  await category.save();
  await syncCategoryDescendants(Category, category);

  const serialized = await getSerializedCategories();
  const updatedCategory = serialized.categories.find((entry) => entry.id === String(category._id));

  res.status(200).json({
    success: true,
    message: "Category updated successfully.",
    data: {
      category: updatedCategory || serializeCategory(category),
    },
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found.");
  }

  const childCount = await Category.countDocuments({ parent: category._id });

  if (childCount > 0) {
    res.status(400);
    throw new Error("Delete or move child categories before removing this category.");
  }

  const productCount = await Product.countDocuments({ category: category._id, isActive: true });

  if (productCount > 0) {
    res.status(400);
    throw new Error("Move or delete products in this category before removing it.");
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Category deleted successfully.",
  });
});
