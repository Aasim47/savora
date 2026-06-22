import { Router } from "express";
import { createCategory, getCategories, deleteCategory } from "../controllers/category.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { createCategorySchema, categoryIdSchema } from "../validators";

const router = Router();

router.post("/", authMiddleware, requireAdmin, validate(createCategorySchema), createCategory);
router.get("/", getCategories);
router.delete("/:id", authMiddleware, requireAdmin, validate(categoryIdSchema), deleteCategory);

export default router;
