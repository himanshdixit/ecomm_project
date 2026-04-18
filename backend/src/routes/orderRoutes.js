import express from "express";

import { cancelMyOrder, createOrder, getAllOrders, getMyOrderById, getMyOrders, reorderMyOrder, updateOrderStatus } from "../controllers/orderController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-orders", protect, getMyOrders);
router.get("/my-orders/:id", protect, getMyOrderById);
router.post("/", protect, createOrder);
router.post("/:id/reorder", protect, reorderMyOrder);
router.patch("/:id/cancel", protect, cancelMyOrder);
router.get("/", protect, authorize("admin"), getAllOrders);
router.patch("/:id/status", protect, authorize("admin"), updateOrderStatus);

export default router;
