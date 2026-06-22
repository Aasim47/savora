import { Router } from "express";
import multer from "multer";

import {
  createMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem
} from "../controllers/menu.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { createMenuItemSchema, updateMenuItemSchema, menuItemIdSchema } from "../validators";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", authMiddleware, requireAdmin, upload.single("image"), validate(createMenuItemSchema), createMenuItem);
router.get("/", getMenuItems);
router.put("/:id", authMiddleware, requireAdmin, upload.single("image"), validate(updateMenuItemSchema), updateMenuItem);
router.delete("/:id", authMiddleware, requireAdmin, validate(menuItemIdSchema), deleteMenuItem);

export default router;
