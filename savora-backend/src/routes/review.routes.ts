import { Router } from "express";
import {
  createReview,
  getReviewsByRestaurant,
  getAverageRating,
} from "../controllers/review.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Public
router.get("/restaurant/:restaurantId", getReviewsByRestaurant);
router.get("/restaurant/:restaurantId/average", getAverageRating);

// Auth required
router.post("/", authMiddleware, createReview);

export default router;
