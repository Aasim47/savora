import { Router } from "express";
import {
  createPromoCode,
  getPromoCodes,
  deletePromoCode,
  validatePromoCode,
} from "../controllers/promo.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { createPromoCodeSchema, validatePromoCodeSchema, promoCodeIdSchema } from "../validators";

const router = Router();

// Auth required
router.post("/validate", authMiddleware, validate(validatePromoCodeSchema), validatePromoCode);

// Admin only
router.get("/", authMiddleware, requireAdmin, getPromoCodes);
router.post("/", authMiddleware, requireAdmin, validate(createPromoCodeSchema), createPromoCode);
router.delete("/:id", authMiddleware, requireAdmin, validate(promoCodeIdSchema), deletePromoCode);

export default router;
