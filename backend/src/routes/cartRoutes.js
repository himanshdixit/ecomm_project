import express from "express";

import { addToCart, getCart, removeCartItem, updateCartItem } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.patch("/:itemId", updateCartItem);
router.delete("/:itemId", removeCartItem);

export default router;
