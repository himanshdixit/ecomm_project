import express from "express";

import { getDashboardStats } from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, authorize("admin"), getDashboardStats);

export default router;
