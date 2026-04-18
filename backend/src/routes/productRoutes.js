import express from "express";

import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  getProductBySlug,
  getProducts,
  updateProduct,
} from "../controllers/productController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { uploadProductImages } from "../middleware/productImageUpload.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/admin/all", protect, authorize("admin"), getAdminProducts);
router.get("/:slug", getProductBySlug);
router.post("/", protect, authorize("admin"), uploadProductImages, createProduct);
router.put("/:id", protect, authorize("admin"), uploadProductImages, updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

export default router;
