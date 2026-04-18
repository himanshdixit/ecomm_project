import express from "express";

import { getAccountDashboard, getUserById, getUsers, updateMyProfile, updateUserRole } from "../controllers/userController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { uploadUserAvatar } from "../middleware/userAvatarUpload.js";

const router = express.Router();

router.use(protect);

router.get("/me/dashboard", getAccountDashboard);
router.put("/me/profile", uploadUserAvatar, updateMyProfile);

router.get("/", authorize("admin"), getUsers);
router.get("/:id", authorize("admin"), getUserById);
router.patch("/:id/role", authorize("admin"), updateUserRole);

export default router;
