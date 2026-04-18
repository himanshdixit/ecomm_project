import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    shortName: {
      type: String,
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
      trim: true,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    tint: {
      type: String,
      default: "#EAF6F7",
    },
    deliveryTime: {
      type: String,
      default: "Fast delivery",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    root: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    pathIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Category",
      default: [],
    },
    pathNames: {
      type: [String],
      default: [],
    },
    pathSlugs: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

categorySchema.index({ parent: 1, sortOrder: 1, name: 1 });
categorySchema.index({ root: 1, level: 1, sortOrder: 1, name: 1 });

export default mongoose.model("Category", categorySchema);
