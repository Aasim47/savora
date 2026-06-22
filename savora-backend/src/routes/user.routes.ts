import { Router } from "express";
import { getUsers, getMe, updateMe, getUserById } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";

const router = Router();

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);

router.get("/", authMiddleware, requireAdmin, getUsers);
router.get("/:id", authMiddleware, requireAdmin, getUserById);

export default router;
