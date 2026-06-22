import { Router } from "express";
import { createOrder, getOrders, updateOrderStatus, getUserOrders, getOrderById, updateOrderDistance } from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate";
import { createOrderSchema, updateOrderStatusSchema, updateDeliveryDistanceSchema, orderIdSchema } from "../validators";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createOrderSchema), createOrder);
router.get("/me", getUserOrders);
router.get("/:id", validate(orderIdSchema), getOrderById);
router.get("/", requireAdmin, getOrders);
router.patch("/:id/status", requireAdmin, validate(updateOrderStatusSchema), updateOrderStatus);
router.patch("/:id/distance", requireAdmin, validate(updateDeliveryDistanceSchema), updateOrderDistance);

export default router;
