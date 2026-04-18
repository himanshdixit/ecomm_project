import mongoose from "mongoose";

import { syncProductSummaryFromVariants } from "../utils/productVariants.js";

const productVariantSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    packLabel: {
      type: String,
      default: "",
      trim: true,
    },
    sku: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      default: "1 unit",
    },
    variants: {
      type: [productVariantSchema],
      default: [],
    },
    badge: {
      type: String,
      default: "Fresh pick",
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryTime: {
      type: String,
      default: "Fast delivery",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    highlights: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    tint: {
      type: String,
      default: "#EAF6F7",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.pre("validate", function syncVariantSummary(next) {
  const { variants, price, originalPrice, stock, unit } = syncProductSummaryFromVariants(this);

  this.variants = variants;
  this.price = price;
  this.originalPrice = originalPrice;
  this.stock = stock;
  this.unit = unit;

  next();
});

productSchema.index({ name: "text", description: "text", tags: "text", "variants.label": "text" });
productSchema.index({ category: 1, isActive: 1, createdAt: -1 });

export default mongoose.model("Product", productSchema);
