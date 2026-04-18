"use client";

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { FaBoxOpen, FaEdit, FaPlus } from "react-icons/fa";

import AdminFormField from "@/components/admin/AdminFormField";
import ProductImageUploader from "@/components/admin/ProductImageUploader";
import AdminMiniStat from "@/components/admin/AdminMiniStat";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminRichTextEditor from "@/components/admin/AdminRichTextEditor";
import AdminSectionCard from "@/components/admin/AdminSectionCard";
import AdminTable from "@/components/admin/AdminTable";
import {
  adminAccentButtonClass,
  adminBadgeClass,
  adminCheckboxClass,
  adminCheckboxWrapperClass,
  adminDangerButtonClass,
  adminGhostButtonClass,
  adminInputClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminTextareaClass,
  adminToolbarGroupClass,
} from "@/components/admin/adminStyles";
import { getApiErrorMessage } from "@/lib/api-error";
import { resolveMediaUrl, shouldBypassNextImageOptimization } from "@/lib/api-config";
import { buildCategoryTree } from "@/lib/category-tree";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { productFormSchema } from "@/lib/validators/admin";
import { adminService } from "@/services/api";

const PRODUCT_IMAGE_LIMIT = 6;
const PRODUCT_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

const buildEmptyVariant = (overrides = {}) => ({
  id: "",
  label: "",
  packLabel: "",
  sku: "",
  price: 0,
  originalPrice: 0,
  stock: 0,
  sortOrder: 0,
  isDefault: false,
  ...overrides,
});

const createDefaultValues = () => ({
  name: "",
  category: "",
  description: "",
  variants: [buildEmptyVariant({ label: "1 unit", packLabel: "1 unit", isDefault: true })],
  badge: "Fresh pick",
  rating: 4.5,
  reviewsCount: 0,
  deliveryTime: "Fast delivery",
  tint: "#EAF6F7",
  highlights: "",
  tags: "",
  isFeatured: false,
  isActive: true,
});

const sortProducts = (items) => [...items].sort((left, right) => new Date(right.updatedAt || right.createdAt) - new Date(left.updatedAt || left.createdAt));
const buildCategoryOptionLabel = (category) => `${"-- ".repeat(Number(category.level || 0))}${category.name}`;
const createImageToken = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createExistingImageItem = (image, index = 0) => ({
  id: `existing-${index}-${image}`,
  kind: "existing",
  src: image,
  name: String(image || "").split("/").pop() || `Image ${index + 1}`,
});

const createNewImageItem = (file) => ({
  id: createImageToken("new"),
  kind: "new",
  src: URL.createObjectURL(file),
  file,
  name: file.name,
});

const buildExistingImageItems = (images = []) =>
  (Array.isArray(images) ? images : []).filter(Boolean).map((image, index) => createExistingImageItem(image, index));

const revokeImagePreviewItem = (item) => {
  if (item?.kind === "new" && typeof item.src === "string" && item.src.startsWith("blob:")) {
    URL.revokeObjectURL(item.src);
  }
};

const normalizeVariantsForForm = (variants = []) => {
  const normalized = Array.isArray(variants) && variants.length
    ? variants.map((variant, index) =>
        buildEmptyVariant({
          id: variant.id || variant._id || "",
          label: variant.label || "",
          packLabel: variant.packLabel || variant.label || "",
          sku: variant.sku || "",
          price: Number(variant.price || 0),
          originalPrice: Number(variant.originalPrice || variant.price || 0),
          stock: Number(variant.stock || 0),
          sortOrder: Number(variant.sortOrder || index),
          isDefault: Boolean(variant.isDefault),
        })
      )
    : [buildEmptyVariant({ label: "1 unit", packLabel: "1 unit", isDefault: true })];

  const defaultIndex = normalized.findIndex((variant) => variant.isDefault);
  const resolvedDefaultIndex = defaultIndex >= 0 ? defaultIndex : 0;

  return normalized.map((variant, index) => ({
    ...variant,
    sortOrder: index,
    isDefault: index === resolvedDefaultIndex,
  }));
};

const normalizeVariantsForPayload = (variants = []) =>
  normalizeVariantsForForm(variants).map((variant, index) => {
    const label = String(variant.label || variant.packLabel || `Variant ${index + 1}`).trim();
    const price = Number(variant.price || 0);
    const originalPrice = Number(variant.originalPrice || price || 0);
    const stock = Math.max(0, Math.round(Number(variant.stock || 0)));

    return {
      ...(variant.id ? { _id: variant.id } : {}),
      label,
      packLabel: String(variant.packLabel || label).trim() || label,
      sku: String(variant.sku || "").trim(),
      price,
      originalPrice: originalPrice >= price ? originalPrice : price,
      stock,
      sortOrder: index,
      isDefault: Boolean(variant.isDefault),
    };
  });

const getFormValues = (product) => ({
  name: product?.name || "",
  category: product?.category?.id || "",
  description: product?.description || "",
  variants: normalizeVariantsForForm(product?.variants),
  badge: product?.badge || "Fresh pick",
  rating: product?.rating ?? 4.5,
  reviewsCount: product?.reviewsCount ?? 0,
  deliveryTime: product?.deliveryTime || "Fast delivery",
  tint: product?.tint || "#EAF6F7",
  highlights: Array.isArray(product?.highlights) ? product.highlights.join(", ") : "",
  tags: Array.isArray(product?.tags) ? product.tags.join(", ") : "",
  isFeatured: Boolean(product?.isFeatured),
  isActive: product?.isActive ?? true,
});

const getProductInventoryValue = (product) => {
  if (Array.isArray(product?.variants) && product.variants.length) {
    return product.variants.reduce((sum, variant) => sum + Number(variant.price || 0) * Number(variant.stock || 0), 0);
  }

  return Number(product?.price || 0) * Number(product?.stock || 0);
};

export default function AdminProductsClient({ initialProducts = [], categories = [] }) {
  const [products, setProducts] = useState(sortProducts(initialProducts));
  const [editingProductId, setEditingProductId] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feedback, setFeedback] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [imageItems, setImageItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const imageItemsRef = useRef([]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: createDefaultValues(),
  });

  useEffect(() => {
    imageItemsRef.current = imageItems;
  }, [imageItems]);

  useEffect(
    () => () => {
      imageItemsRef.current.forEach(revokeImagePreviewItem);
    },
    []
  );

  const replaceImageItems = (nextItems) => {
    setImageItems((currentItems) => {
      const nextIds = new Set(nextItems.map((item) => item.id));
      currentItems.forEach((item) => {
        if (item.kind === "new" && !nextIds.has(item.id)) {
          revokeImagePreviewItem(item);
        }
      });

      return nextItems;
    });
  };
  const { flat: categoryOptions } = useMemo(() => buildCategoryTree(categories), [categories]);
  const categoriesById = useMemo(() => new Map(categoryOptions.map((category) => [category.id, category])), [categoryOptions]);
  const selectedCategoryId = useWatch({ control, name: "category" });
  const selectedCategory = categoriesById.get(selectedCategoryId || "") || null;
  const watchedVariantsValue = useWatch({ control, name: "variants" });
  const watchedVariants = useMemo(() => (Array.isArray(watchedVariantsValue) ? watchedVariantsValue : []), [watchedVariantsValue]);
  const variantErrors = Array.isArray(errors.variants) ? errors.variants : [];
  const variantArrayError = !Array.isArray(errors.variants) && typeof errors.variants?.message === "string" ? errors.variants.message : "";

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const categoryPath = product.category?.pathLabel || product.category?.name || "";
        const matchesQuery =
          !query ||
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          categoryPath.toLowerCase().includes(query.toLowerCase()) ||
          product.slug?.toLowerCase().includes(query.toLowerCase());
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && product.isActive) ||
          (statusFilter === "inactive" && !product.isActive);

        return matchesQuery && matchesStatus;
      }),
    [products, query, statusFilter]
  );

  const totalProducts = products.length;
  const activeProducts = products.filter((product) => product.isActive).length;
  const multiVariantProducts = products.filter((product) => Number(product.variantCount || product.variants?.length || 0) > 1).length;
  const totalInventoryValue = products.reduce((sum, product) => sum + getProductInventoryValue(product), 0);

  const variantSummary = useMemo(() => {
    const variants = normalizeVariantsForForm(watchedVariants);
    const defaultVariant = variants.find((variant) => variant.isDefault) || variants[0] || null;
    const totalStock = variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);

    return {
      count: variants.length,
      totalStock,
      defaultVariant,
    };
  }, [watchedVariants]);

  const imageSummaryText = imageItems.length
    ? "Choose the cover image carefully because the first photo is used on product cards, cart, wishlist, and the product detail hero."
    : "Upload clean front, angle, pack, or detail shots to create a richer gallery for shoppers.";

  const setVariants = (nextVariants) => {
    setValue("variants", normalizeVariantsForForm(nextVariants), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const startCreate = () => {
    setEditingProductId(null);
    setFeedback(null);
    setImageError(null);
    replaceImageItems([]);
    reset(createDefaultValues());
  };

  const startEdit = (product) => {
    setEditingProductId(product.id);
    setFeedback(null);
    setImageError(null);
    replaceImageItems(buildExistingImageItems(product.images));
    reset(getFormValues(product));
  };

  const handleAddVariant = () => {
    const currentVariants = getValues("variants") || [];
    setVariants([
      ...currentVariants,
      buildEmptyVariant({
        label: "",
        packLabel: "",
        isDefault: currentVariants.length === 0,
        sortOrder: currentVariants.length,
      }),
    ]);
  };

  const handleRemoveVariant = (index) => {
    const currentVariants = [...(getValues("variants") || [])];

    if (currentVariants.length <= 1) {
      return;
    }

    currentVariants.splice(index, 1);

    if (!currentVariants.some((variant) => variant.isDefault) && currentVariants[0]) {
      currentVariants[0].isDefault = true;
    }

    setVariants(currentVariants);
  };

  const handleSetDefaultVariant = (index) => {
    const currentVariants = (getValues("variants") || []).map((variant, variantIndex) => ({
      ...variant,
      isDefault: variantIndex === index,
    }));

    setVariants(currentVariants);
  };

  const handleFilesSelected = (files) => {
    const selectedFiles = Array.isArray(files) ? files : [];

    if (!selectedFiles.length) {
      return;
    }

    const invalidFile = selectedFiles.find((file) => !PRODUCT_IMAGE_TYPES.has(file.type));

    if (invalidFile) {
      setImageError("Only JPG, PNG, WEBP, and AVIF images are supported.");
      return;
    }

    const remainingSlots = PRODUCT_IMAGE_LIMIT - imageItems.length;

    if (remainingSlots <= 0) {
      setImageError(`You can attach up to ${PRODUCT_IMAGE_LIMIT} images per product.`);
      return;
    }

    const acceptedFiles = selectedFiles.slice(0, remainingSlots);
    replaceImageItems([...imageItems, ...acceptedFiles.map((file) => createNewImageItem(file))]);
    setImageError(selectedFiles.length > acceptedFiles.length ? `Only ${PRODUCT_IMAGE_LIMIT} images can be attached to one product.` : null);
  };

  const handleMakePrimaryImage = (imageId) => {
    const targetItem = imageItems.find((item) => item.id === imageId);

    if (!targetItem) {
      return;
    }

    replaceImageItems([targetItem, ...imageItems.filter((item) => item.id !== imageId)]);
    setImageError(null);
  };

  const handleRemoveImage = (imageId) => {
    replaceImageItems(imageItems.filter((item) => item.id !== imageId));
    setImageError(null);
  };
  const buildProductFormData = (values) => {
    const formData = new FormData();
    const existingImageItems = imageItems.filter((item) => item.kind === "existing");
    const newImageItems = imageItems.filter((item) => item.kind === "new");
    const imageOrder = imageItems.map((item) => (item.kind === "existing" ? `existing:${item.src}` : `new:${item.id}`));
    const newImageKeys = newImageItems.map((item) => `new:${item.id}`);

    formData.append("name", values.name);
    formData.append("category", values.category);
    formData.append("description", values.description);
    formData.append("variants", JSON.stringify(normalizeVariantsForPayload(values.variants)));
    formData.append("badge", values.badge);
    formData.append("rating", String(values.rating));
    formData.append("reviewsCount", String(values.reviewsCount));
    formData.append("deliveryTime", values.deliveryTime);
    formData.append("tint", values.tint);
    formData.append("existingImages", JSON.stringify(existingImageItems.map((item) => item.src)));
    formData.append("imageOrder", JSON.stringify(imageOrder));
    formData.append("newImageKeys", JSON.stringify(newImageKeys));
    formData.append("highlights", values.highlights || "");
    formData.append("tags", values.tags || "");
    formData.append("isFeatured", String(values.isFeatured));
    formData.append("isActive", String(values.isActive));

    newImageItems.forEach((item) => {
      formData.append("images", item.file, item.file.name);
    });

    return formData;
  };

  const onSubmit = async (values) => {
    if (imageItems.length > PRODUCT_IMAGE_LIMIT) {
      setImageError(`You can attach up to ${PRODUCT_IMAGE_LIMIT} images per product.`);
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    setImageError(null);

    try {
      const payload = buildProductFormData(values);
      const product = editingProductId
        ? await adminService.updateProduct(editingProductId, payload)
        : await adminService.createProduct(payload);

      setProducts((currentProducts) => {
        if (editingProductId) {
          return sortProducts(currentProducts.map((item) => (item.id === product.id ? product : item)));
        }

        return sortProducts([product, ...currentProducts]);
      });

      setFeedback({ type: "success", message: editingProductId ? "Product updated successfully." : "Product created successfully." });
      setEditingProductId(null);
      replaceImageItems([]);
      reset(createDefaultValues());
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error, "Unable to save product right now.") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm("Delete this product from the catalog?");

    if (!confirmed) {
      return;
    }

    setDeletingId(productId);
    setFeedback(null);

    try {
      await adminService.deleteProduct(productId);
      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
      setFeedback({ type: "success", message: "Product deleted successfully." });

      if (editingProductId === productId) {
        setEditingProductId(null);
        replaceImageItems([]);
        reset(createDefaultValues());
      }
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error, "Unable to delete product right now.") });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catalog management"
        title="Manage products, pack sizes, and product galleries"
        description="Assign products to any category level, manage multi-unit inventory, and upload up to 6 product photos with cover-image control from one editor."
        action={
          <button type="button" onClick={startCreate} className={adminPrimaryButtonClass}>
            <FaBoxOpen className="h-4 w-4" />
            New product
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMiniStat label="Catalog size" value={totalProducts.toLocaleString("en-IN")} helper={`${filteredProducts.length} in current view`} tone="emerald" />
        <AdminMiniStat label="Active products" value={activeProducts.toLocaleString("en-IN")} helper="Visible in the storefront" tone="blue" />
        <AdminMiniStat label="Multi-pack products" value={multiVariantProducts.toLocaleString("en-IN")} helper="Products with 2 or more variants" tone="amber" />
        <AdminMiniStat label="Inventory value" value={formatCurrency(totalInventoryValue)} helper="Across all variant rows" tone="violet" />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.08fr)_minmax(0,1.32fr)]">
        <AdminSectionCard
          title={editingProductId ? "Edit product" : "Create product"}
          description="Choose the exact category node, then manage variants, price, stock, and the storefront image gallery from one premium form."
        >
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminFormField label="Product name" error={errors.name?.message}>
                <input className={adminInputClass} placeholder="Organic Alphonso Mangoes" {...register("name")} />
              </AdminFormField>
              <AdminFormField label="Category" error={errors.category?.message}>
                <select className={adminInputClass} {...register("category")}>
                  <option value="">Select category</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {buildCategoryOptionLabel(category)}
                    </option>
                  ))}
                </select>
              </AdminFormField>
            </div>

            {selectedCategory ? (
              <div className="rounded-[1.2rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                This product will be assigned to <span className="font-semibold">{selectedCategory.pathLabel || selectedCategory.name}</span>.
              </div>
            ) : (
              <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                You can assign a product to a root category, sub-category, or sub-sub-category. Choose the exact inventory node you want.
              </div>
            )}

            <AdminFormField
              label="Description"
              description="Use the editor for headings, lists, and premium product storytelling."
              error={errors.description?.message}
            >
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <AdminRichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.description?.message}
                    placeholder="Write a premium product story with highlights, usage ideas, and care notes."
                  />
                )}
              />
            </AdminFormField>
            <div className="rounded-[1.35rem] border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5">
              <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Variants and pack sizes</div>
                  <div className="mt-1 text-base font-semibold text-slate-950">Manage units, packs, and stock per variant</div>
                </div>
                <button type="button" onClick={handleAddVariant} className={adminSecondaryButtonClass}>
                  <FaPlus className="h-3.5 w-3.5" />
                  Add variant
                </button>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_16rem]">
                <div className="space-y-4">
                  {variantArrayError ? <p className="text-sm font-medium text-rose-600">{variantArrayError}</p> : null}

                  {watchedVariants.map((variant, index) => {
                    const isDefault = Boolean(variant?.isDefault);
                    const currentVariantErrors = variantErrors[index] || {};

                    return (
                      <div key={variant.id || `variant-${index}`} className="rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn(adminBadgeClass, isDefault ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700")}>Variant {index + 1}</span>
                            {isDefault ? <span className={cn(adminBadgeClass, "bg-blue-50 text-blue-700")}>Default pack</span> : null}
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <button type="button" onClick={() => handleSetDefaultVariant(index)} className={adminGhostButtonClass}>
                              {isDefault ? "Default" : "Make default"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(index)}
                              disabled={watchedVariants.length <= 1}
                              className={adminDangerButtonClass}
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          <AdminFormField label="Variant label" error={currentVariantErrors.label?.message}>
                            <input className={adminInputClass} placeholder="500 ml" {...register(`variants.${index}.label`)} />
                          </AdminFormField>
                          <AdminFormField label="Pack label" error={currentVariantErrors.packLabel?.message}>
                            <input className={adminInputClass} placeholder="Family pack 500 ml" {...register(`variants.${index}.packLabel`)} />
                          </AdminFormField>
                          <AdminFormField label="SKU" error={currentVariantErrors.sku?.message}>
                            <input className={adminInputClass} placeholder="MILK-500" {...register(`variants.${index}.sku`)} />
                          </AdminFormField>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                          <AdminFormField label="Price" error={currentVariantErrors.price?.message}>
                            <input className={adminInputClass} type="number" min="0" step="0.01" {...register(`variants.${index}.price`)} />
                          </AdminFormField>
                          <AdminFormField label="Original price" error={currentVariantErrors.originalPrice?.message}>
                            <input className={adminInputClass} type="number" min="0" step="0.01" {...register(`variants.${index}.originalPrice`)} />
                          </AdminFormField>
                          <AdminFormField label="Stock" error={currentVariantErrors.stock?.message}>
                            <input className={adminInputClass} type="number" min="0" step="1" {...register(`variants.${index}.stock`)} />
                          </AdminFormField>
                        </div>

                        <input type="hidden" {...register(`variants.${index}.id`)} />
                        <input type="hidden" {...register(`variants.${index}.sortOrder`)} />
                        <input type="hidden" {...register(`variants.${index}.isDefault`)} />
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4 rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Variant summary</div>
                    <div className="mt-1 text-base font-semibold text-slate-950">Live inventory preview</div>
                  </div>

                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="rounded-[1rem] bg-slate-50 px-3 py-3">
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Variant count</div>
                      <div className="mt-1 text-lg font-semibold text-slate-950">{variantSummary.count}</div>
                    </div>
                    <div className="rounded-[1rem] bg-slate-50 px-3 py-3">
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Default pack</div>
                      <div className="mt-1 font-semibold text-slate-950">{variantSummary.defaultVariant?.label || "Not set"}</div>
                      <div className="mt-1 text-xs text-slate-500">{formatCurrency(variantSummary.defaultVariant?.price || 0)}</div>
                    </div>
                    <div className="rounded-[1rem] bg-slate-50 px-3 py-3">
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Total stock</div>
                      <div className="mt-1 text-lg font-semibold text-slate-950">{variantSummary.totalStock}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AdminFormField label="Badge" error={errors.badge?.message}>
                <input className={adminInputClass} placeholder="Top seller" {...register("badge")} />
              </AdminFormField>
              <AdminFormField label="Rating" error={errors.rating?.message}>
                <input className={adminInputClass} type="number" min="0" max="5" step="0.1" {...register("rating")} />
              </AdminFormField>
              <AdminFormField label="Reviews" error={errors.reviewsCount?.message}>
                <input className={adminInputClass} type="number" min="0" step="1" {...register("reviewsCount")} />
              </AdminFormField>
              <AdminFormField label="Delivery time" error={errors.deliveryTime?.message}>
                <input className={adminInputClass} placeholder="10 mins" {...register("deliveryTime")} />
              </AdminFormField>
            </div>

            <AdminFormField label="Tint" error={errors.tint?.message}>
              <input className={adminInputClass} placeholder="#EAF6F7" {...register("tint")} />
            </AdminFormField>

            <AdminFormField
              label="Product photos"
              description="Upload and review up to 6 photos. Make any image the cover image before saving."
              error={imageError || undefined}
            >
              <ProductImageUploader
                items={imageItems}
                maxImages={PRODUCT_IMAGE_LIMIT}
                error={imageError}
                helperText={imageSummaryText}
                onFilesSelected={handleFilesSelected}
                onMakePrimary={handleMakePrimaryImage}
                onRemove={handleRemoveImage}
              />
            </AdminFormField>

            <div className="grid gap-4 xl:grid-cols-2">
              <AdminFormField label="Highlights" description="Comma-separated short bullets" error={errors.highlights?.message}>
                <textarea className={`${adminTextareaClass} min-h-24`} placeholder="Naturally ripened, Vitamin rich, Farm fresh" {...register("highlights")} />
              </AdminFormField>
              <AdminFormField label="Tags" description="Comma-separated tags" error={errors.tags?.message}>
                <textarea className={`${adminTextareaClass} min-h-24`} placeholder="mango, seasonal, premium" {...register("tags")} />
              </AdminFormField>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <label className={adminCheckboxWrapperClass}>
                <input type="checkbox" className={adminCheckboxClass} {...register("isFeatured")} />
                Mark as featured product
              </label>
              <label className={adminCheckboxWrapperClass}>
                <input type="checkbox" className={adminCheckboxClass} {...register("isActive")} />
                Keep product visible in storefront
              </label>
            </div>

            {feedback ? (
              <div
                className={cn(
                  "rounded-[1.2rem] px-4 py-3 text-sm font-medium",
                  feedback.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                )}
              >
                {feedback.message}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button type="submit" disabled={isSubmitting} className={adminAccentButtonClass}>
                {isSubmitting ? "Saving..." : editingProductId ? "Update product" : "Create product"}
              </button>
              <button type="button" onClick={startCreate} className={adminSecondaryButtonClass}>
                Reset form
              </button>
            </div>
          </form>
        </AdminSectionCard>

        <AdminSectionCard
          title="Product inventory"
          description="Search products by name, path, or slug and review exactly where each item sits in the category hierarchy."
          action={
            <div className={adminToolbarGroupClass}>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={`${adminInputClass} md:w-[18rem]`}
                placeholder="Search products"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={`${adminInputClass} md:w-[12rem]`}
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          }
        >
          <AdminTable
            minWidthClassName="min-w-[980px]"
            columns={[
              { key: "product", label: "Product" },
              { key: "category", label: "Category path" },
              { key: "pricing", label: "Pricing" },
              { key: "inventory", label: "Inventory" },
              { key: "status", label: "Status" },
              { key: "actions", label: "Actions" },
            ]}
            emptyMessage="No products match your current filters."
          >
            {filteredProducts.length
              ? filteredProducts.map((product) => {
                  const hasDiscount = Number(product.originalPrice || 0) > Number(product.price || 0);
                  const variantCount = Number(product.variantCount || product.variants?.length || 0);
                  const totalVariantStock = Array.isArray(product.variants)
                    ? product.variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0)
                    : Number(product.stock || 0);
                  const productImage = resolveMediaUrl(product.image || product.images?.[0] || "/images/products/produce-crate.svg");

                  return (
                    <tr key={product.id} className="transition hover:bg-slate-50/80">
                      <td className="px-4 py-4 first:pl-5 last:pr-5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                            <Image
                              src={productImage}
                              alt={product.name}
                              fill
                              className="object-cover"
                              unoptimized={shouldBypassNextImageOptimization(productImage)}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-950">{product.name}</p>
                            <p className="truncate text-xs text-slate-500">/{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 first:pl-5 last:pr-5 text-sm text-slate-600">
                        <div>
                          <div className="font-medium text-slate-900">{product.category?.name || "--"}</div>
                          <div className="mt-1 text-xs text-slate-500">{product.category?.pathLabel || product.category?.name || "--"}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 first:pl-5 last:pr-5">
                        <p className="font-semibold text-slate-950">{formatCurrency(product.price)}</p>
                        {hasDiscount ? <p className="text-xs text-slate-500 line-through">{formatCurrency(product.originalPrice)}</p> : <p className="text-xs text-slate-400">No markdown</p>}
                      </td>
                      <td className="px-4 py-4 first:pl-5 last:pr-5">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-950">{variantCount} {variantCount === 1 ? "variant" : "variants"}</p>
                          <p className="text-xs text-slate-500">{totalVariantStock} total stock</p>
                          <p className="text-xs text-slate-400">Default: {product.defaultVariant?.label || product.unit}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 first:pl-5 last:pr-5">
                        <div className="flex flex-wrap gap-2">
                          <span className={cn(adminBadgeClass, product.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                          {product.isFeatured ? <span className={cn(adminBadgeClass, "bg-amber-50 text-amber-700")}>Featured</span> : null}
                          {totalVariantStock < 10 ? <span className={cn(adminBadgeClass, "bg-rose-50 text-rose-700")}>Low stock</span> : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 first:pl-5 last:pr-5">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => startEdit(product)} className={adminGhostButtonClass}>
                            <FaEdit className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className={adminDangerButtonClass}
                          >
                            {deletingId === product.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              : null}
          </AdminTable>
        </AdminSectionCard>
      </div>
    </div>
  );
}
