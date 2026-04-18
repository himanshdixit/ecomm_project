"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEdit, FaLayerGroup, FaPlus, FaSitemap } from "react-icons/fa";

import AdminFormField from "@/components/admin/AdminFormField";
import AdminMiniStat from "@/components/admin/AdminMiniStat";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
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
} from "@/components/admin/adminStyles";
import { getApiErrorMessage } from "@/lib/api-error";
import { buildCategoryTree } from "@/lib/category-tree";
import { cn } from "@/lib/utils";
import { categoryFormSchema } from "@/lib/validators/admin";
import { adminService } from "@/services/api";

const defaultValues = {
  name: "",
  shortName: "",
  parentSlug: "",
  sortOrder: 0,
  description: "",
  image: "",
  tint: "#EAF6F7",
  deliveryTime: "Fast delivery",
  isFeatured: false,
};

const getLevelLabel = (level = 0) => {
  const normalizedLevel = Number(level || 0);

  if (normalizedLevel === 0) {
    return "Root";
  }

  if (normalizedLevel === 1) {
    return "Sub-category";
  }

  return `Level ${normalizedLevel + 1}`;
};

const getParentSlug = (category, categoriesById) => categoriesById.get(category?.parentId || "")?.slug || "";

const getFormValues = (category, categoriesById) => ({
  name: category?.name || "",
  shortName: category?.shortName || "",
  parentSlug: getParentSlug(category, categoriesById),
  sortOrder: Number(category?.sortOrder || 0),
  description: category?.description || "",
  image: category?.image || "",
  tint: category?.tint || "#EAF6F7",
  deliveryTime: category?.deliveryTime || "Fast delivery",
  isFeatured: Boolean(category?.isFeatured),
});

const collectDescendantIds = (categoryNode, results = new Set()) => {
  if (!categoryNode) {
    return results;
  }

  results.add(categoryNode.id);
  (categoryNode.children || []).forEach((child) => collectDescendantIds(child, results));
  return results;
};

const matchesCategoryQuery = (category, categoriesById, query) => {
  if (!query) {
    return true;
  }

  const normalizedQuery = query.toLowerCase();
  const parentName = categoriesById.get(category.parentId || "")?.name || "";
  const haystack = [
    category.name,
    category.shortName,
    category.slug,
    category.pathLabel,
    parentName,
    getLevelLabel(category.level),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
};

function HierarchyNode({ category, depth = 0, onCreateChild, onEdit }) {
  return (
    <div className={cn("space-y-3", depth > 0 && "border-l border-dashed border-slate-200 pl-4")}> 
      <div className="rounded-[1.35rem] border border-slate-200/90 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn(adminBadgeClass, "bg-slate-100 text-slate-700")}>{getLevelLabel(category.level)}</span>
              {category.isFeatured ? <span className={cn(adminBadgeClass, "bg-amber-50 text-amber-700")}>Featured</span> : null}
              {category.childrenCount ? <span className={cn(adminBadgeClass, "bg-emerald-50 text-emerald-700")}>{category.childrenCount} children</span> : null}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-950">{category.name}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">{category.pathLabel || category.name}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-medium text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">{category.directItemCount || 0} direct products</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">{category.itemCount || 0} total products</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Sort {Number(category.sortOrder || 0)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => onCreateChild(category)} className={adminGhostButtonClass}>
              <FaPlus className="h-3.5 w-3.5" />
              Add child
            </button>
            <button type="button" onClick={() => onEdit(category)} className={adminSecondaryButtonClass}>
              <FaEdit className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
        </div>
      </div>

      {category.children?.length ? (
        <div className="space-y-3">
          {category.children.map((child) => (
            <HierarchyNode key={child.id} category={child} depth={depth + 1} onCreateChild={onCreateChild} onEdit={onEdit} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminCategoriesClient({ initialCategories = [] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const formRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

  const categoriesById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);
  const categoriesBySlug = useMemo(() => new Map(categories.map((category) => [category.slug, category])), [categories]);
  const { roots, flat, nodeMap } = useMemo(() => buildCategoryTree(categories), [categories]);

  const filteredCategories = useMemo(() => flat.filter((category) => matchesCategoryQuery(category, categoriesById, query)), [flat, categoriesById, query]);

  const invalidParentIds = useMemo(() => {
    if (!editingCategoryId) {
      return new Set();
    }

    return collectDescendantIds(nodeMap.get(editingCategoryId));
  }, [editingCategoryId, nodeMap]);

  const parentOptions = useMemo(
    () => flat.filter((category) => !invalidParentIds.has(category.id)),
    [flat, invalidParentIds]
  );

  const selectedParent = categoriesBySlug.get(watch("parentSlug")) || null;
  const rootCategoriesCount = flat.filter((category) => Number(category.level || 0) === 0).length;
  const nestedCategoriesCount = flat.length - rootCategoriesCount;
  const directProductLinks = flat.reduce((sum, category) => sum + Number(category.directItemCount || 0), 0);
  const deepestLevel = flat.reduce((maxLevel, category) => Math.max(maxLevel, Number(category.level || 0)), 0) + (flat.length ? 1 : 0);

  const scrollFormIntoView = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetToDefault = () => {
    setEditingCategoryId(null);
    setFeedback(null);
    reset(defaultValues);
  };

  const startCreate = () => {
    resetToDefault();
    scrollFormIntoView();
  };

  const startCreateChild = (category) => {
    setEditingCategoryId(null);
    setFeedback(null);
    reset({
      ...defaultValues,
      parentSlug: category.slug,
      sortOrder: Number(category.childrenCount || 0),
      tint: category.tint || defaultValues.tint,
      deliveryTime: category.deliveryTime || defaultValues.deliveryTime,
    });
    scrollFormIntoView();
  };

  const startEdit = (category) => {
    setEditingCategoryId(category.id);
    setFeedback(null);
    reset(getFormValues(category, categoriesById));
    scrollFormIntoView();
  };

  const refreshCategories = async () => {
    const nextCategories = await adminService.getCategories();
    setCategories(nextCategories || []);
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (editingCategoryId) {
        await adminService.updateCategory(editingCategoryId, values);
      } else {
        await adminService.createCategory(values);
      }

      await refreshCategories();
      setFeedback({
        type: "success",
        message: editingCategoryId ? "Category hierarchy updated successfully." : "Category created successfully.",
      });
      setEditingCategoryId(null);
      reset(defaultValues);
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error, "Unable to save category right now.") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    if (category.childrenCount) {
      setFeedback({ type: "error", message: "Move or delete child categories before removing this category." });
      return;
    }

    const confirmed = window.confirm("Delete this category? Make sure no products are still assigned to it.");

    if (!confirmed) {
      return;
    }

    setDeletingId(category.id);
    setFeedback(null);

    try {
      await adminService.deleteCategory(category.id);
      await refreshCategories();
      setFeedback({ type: "success", message: "Category deleted successfully." });

      if (editingCategoryId === category.id) {
        setEditingCategoryId(null);
        reset(defaultValues);
      }
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error, "Unable to delete category right now.") });
    } finally {
      setDeletingId(null);
    }
  };

  const formTitle = editingCategoryId ? "Edit category" : selectedParent ? "Create sub-category" : "Create root category";
  const formDescription = editingCategoryId
    ? "Update hierarchy, storefront styling, and fulfillment metadata for this category branch."
    : selectedParent
      ? `This new category will be created under ${selectedParent.pathLabel || selectedParent.name}.`
      : "Leave parent empty to create a top-level storefront category. Products can be mapped at any level.";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Category setup"
        title="Manage category hierarchy"
        description="Create root categories, nest sub-categories under any aisle, and keep the storefront structure aligned with your inventory model."
        action={
          <button type="button" onClick={startCreate} className={adminPrimaryButtonClass}>
            <FaLayerGroup className="h-4 w-4" />
            New root category
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMiniStat label="Total categories" value={flat.length.toLocaleString("en-IN")} helper="All levels included" tone="emerald" />
        <AdminMiniStat label="Root categories" value={rootCategoriesCount.toLocaleString("en-IN")} helper="Top-level storefront aisles" tone="blue" />
        <AdminMiniStat label="Nested categories" value={nestedCategoriesCount.toLocaleString("en-IN")} helper={`Depth up to ${deepestLevel || 0} levels`} tone="violet" />
        <AdminMiniStat label="Direct product links" value={directProductLinks.toLocaleString("en-IN")} helper="Products assigned directly to category nodes" tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div ref={formRef}>
          <AdminSectionCard title={formTitle} description={formDescription}>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminFormField label="Category name" error={errors.name?.message}>
                  <input className={adminInputClass} placeholder="Fresh Fruits" {...register("name")} />
                </AdminFormField>
                <AdminFormField label="Short name" error={errors.shortName?.message}>
                  <input className={adminInputClass} placeholder="Fruits" {...register("shortName")} />
                </AdminFormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
                <AdminFormField
                  label="Parent category"
                  description="Optional"
                  error={errors.parentSlug?.message}
                >
                  <select className={adminInputClass} {...register("parentSlug")}>
                    <option value="">No parent (root category)</option>
                    {parentOptions.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {`${"  ".repeat(Number(category.level || 0))}${category.pathLabel || category.name}`}
                      </option>
                    ))}
                  </select>
                </AdminFormField>
                <AdminFormField label="Sort order" error={errors.sortOrder?.message}>
                  <input type="number" min="0" className={adminInputClass} {...register("sortOrder")} />
                </AdminFormField>
              </div>

              {selectedParent ? (
                <div className="rounded-[1.2rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  This category will sit under <span className="font-semibold">{selectedParent.pathLabel || selectedParent.name}</span>.
                </div>
              ) : (
                <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Root categories appear as the primary storefront aisles. Nested categories become sub-categories and sub-sub-categories automatically.
                </div>
              )}

              <AdminFormField label="Description" error={errors.description?.message}>
                <textarea className={`${adminTextareaClass} min-h-28`} placeholder="Category story and merchandising copy." {...register("description")} />
              </AdminFormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <AdminFormField label="Image path" error={errors.image?.message}>
                  <input className={adminInputClass} placeholder="/images/products/fruit-basket.svg" {...register("image")} />
                </AdminFormField>
                <AdminFormField label="Tint" error={errors.tint?.message}>
                  <input className={adminInputClass} placeholder="#EAF6F7" {...register("tint")} />
                </AdminFormField>
              </div>

              <AdminFormField label="Delivery time" error={errors.deliveryTime?.message}>
                <input className={adminInputClass} placeholder="Fast delivery" {...register("deliveryTime")} />
              </AdminFormField>

              <label className={adminCheckboxWrapperClass}>
                <input type="checkbox" className={adminCheckboxClass} {...register("isFeatured")} />
                Show this category in featured storefront sections
              </label>

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
                  {isSubmitting ? "Saving..." : editingCategoryId ? "Update category" : "Create category"}
                </button>
                <button type="button" onClick={resetToDefault} className={adminSecondaryButtonClass}>
                  Reset form
                </button>
              </div>
            </form>
          </AdminSectionCard>
        </div>

        <AdminSectionCard
          title="Live hierarchy"
          description="Use the tree below to create child categories quickly and verify how your storefront navigation is structured."
          action={<span className={cn(adminBadgeClass, "bg-slate-100 text-slate-700")}>{roots.length} root lanes</span>}
        >
          {roots.length ? (
            <div className="space-y-4">
              {roots.map((category) => (
                <HierarchyNode key={category.id} category={category} onCreateChild={startCreateChild} onEdit={startEdit} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              No categories yet. Start by creating a root category, then add children under it.
            </div>
          )}
        </AdminSectionCard>
      </div>

      <AdminSectionCard
        title="Category directory"
        description="Search the full hierarchy, review parent relationships, and manage child creation from a flat responsive directory."
        action={
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <FaSitemap className="h-3.5 w-3.5 text-emerald-600" />
              {filteredCategories.length} visible
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className={`${adminInputClass} md:w-[20rem]`}
              placeholder="Search by name, slug, path, or parent"
            />
          </div>
        }
      >
        <AdminTable
          minWidthClassName="min-w-[980px]"
          columns={[
            { key: "category", label: "Category" },
            { key: "parent", label: "Parent" },
            { key: "hierarchy", label: "Hierarchy" },
            { key: "products", label: "Products" },
            { key: "actions", label: "Actions" },
          ]}
          emptyMessage="No categories found."
        >
          {filteredCategories.length
            ? filteredCategories.map((category) => {
                const parentCategory = categoriesById.get(category.parentId || "") || null;
                const deleteBlocked = Boolean(category.childrenCount);

                return (
                  <tr key={category.id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-4 first:pl-5 last:pr-5">
                      <div className="flex items-start gap-3">
                        <div
                          className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-slate-200/80 text-sm font-black text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                          style={{ backgroundColor: category.tint || "#EAF6F7" }}
                        >
                          {category.shortName?.charAt(0)?.toUpperCase() || category.name?.charAt(0)?.toUpperCase() || "C"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-950">{category.name}</p>
                          <p className="mt-1 text-xs text-slate-500">/{category.slug}</p>
                          <p className="mt-1 truncate text-xs text-slate-400">{category.pathLabel || category.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 first:pl-5 last:pr-5 text-sm text-slate-600">
                      {parentCategory ? (
                        <div>
                          <div className="font-medium text-slate-800">{parentCategory.name}</div>
                          <div className="text-xs text-slate-400">/{parentCategory.slug}</div>
                        </div>
                      ) : (
                        <span className={cn(adminBadgeClass, "bg-slate-100 text-slate-700")}>Root</span>
                      )}
                    </td>
                    <td className="px-4 py-4 first:pl-5 last:pr-5">
                      <div className="flex flex-wrap gap-2">
                        <span className={cn(adminBadgeClass, "bg-slate-100 text-slate-700")}>{getLevelLabel(category.level)}</span>
                        <span className={cn(adminBadgeClass, "bg-sky-50 text-sky-700")}>Sort {Number(category.sortOrder || 0)}</span>
                        {category.childrenCount ? <span className={cn(adminBadgeClass, "bg-emerald-50 text-emerald-700")}>{category.childrenCount} children</span> : null}
                        {category.isFeatured ? <span className={cn(adminBadgeClass, "bg-amber-50 text-amber-700")}>Featured</span> : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 first:pl-5 last:pr-5">
                      <div className="flex flex-wrap gap-2">
                        <span className={cn(adminBadgeClass, "bg-slate-100 text-slate-700")}>{Number(category.directItemCount || 0)} direct</span>
                        <span className={cn(adminBadgeClass, "bg-violet-50 text-violet-700")}>{Number(category.itemCount || 0)} total</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 first:pl-5 last:pr-5">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => startCreateChild(category)} className={adminGhostButtonClass}>
                          <FaPlus className="h-3 w-3" />
                          Add child
                        </button>
                        <button type="button" onClick={() => startEdit(category)} className={adminSecondaryButtonClass}>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          disabled={deletingId === category.id || deleteBlocked}
                          title={deleteBlocked ? "Remove child categories first" : "Delete category"}
                          className={adminDangerButtonClass}
                        >
                          {deletingId === category.id ? "Deleting..." : deleteBlocked ? "Has children" : "Delete"}
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
  );
}
