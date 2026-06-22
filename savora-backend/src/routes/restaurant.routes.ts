import { Router } from "express";
import * as RestaurantController from "../controllers/restaurant.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/role.middleware";

const router = Router();

router.get("/", RestaurantController.getRestaurants);
router.get("/:id", RestaurantController.getRestaurantById);

router.post("/", authMiddleware, requireAdmin, ...RestaurantController.createRestaurant);
router.put("/:id", authMiddleware, requireAdmin, ...RestaurantController.updateRestaurant);
router.delete("/:id", authMiddleware, requireAdmin, ...RestaurantController.deleteRestaurant);

export default router;