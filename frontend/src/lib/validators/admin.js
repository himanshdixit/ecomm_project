import { z } from "zod";

const productVariantFormSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  label: z.string().trim().min(1, "Variant label is required."),
  packLabel: z.string().trim().optional().or(z.literal("")),
  sku: z.string().trim().optional().or(z.literal("")),
  price: z.coerce.number().min(0.01, "Variant price must be greater than 0."),
  originalPrice: z.coerce.number().min(0, "Original price cannot be negative."),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
  sortOrder: z.coerce.number().int().min(0, "Sort order cannot be negative.").default(0),
  isDefault: z.boolean().default(false),
});

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Category name is required."),
  shortName: z.string().trim().min(2, "Short name is required."),
  parentSlug: z.string().trim().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0, "Sort order cannot be negative.").default(0),
  description: z.string().trim().min(8, "Description should be at least 8 characters."),
  image: z.string().trim().optional().or(z.literal("")),
  tint: z.string().trim().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Enter a valid hex color."),
  deliveryTime: z.string().trim().min(3, "Delivery time is required."),
  isFeatured: z.boolean().default(false),
});

export const productFormSchema = z.object({
  name: z.string().trim().min(2, "Product name is required."),
  category: z.string().trim().min(1, "Select a category."),
  description: z.string().trim().min(12, "Description should be at least 12 characters."),
  variants: z.array(productVariantFormSchema).min(1, "Add at least one variant."),
  badge: z.string().trim().min(1, "Badge is required."),
  rating: z.coerce.number().min(0).max(5),
  reviewsCount: z.coerce.number().int().min(0),
  deliveryTime: z.string().trim().min(3, "Delivery time is required."),
  tint: z.string().trim().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Enter a valid hex color."),
  highlights: z.string().trim().optional().or(z.literal("")),
  tags: z.string().trim().optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
