import { Request, Response } from "express";
import * as ReviewService from "../services/review.service";

export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user!.id;
    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating) {
      res.status(400).json({ message: "orderId and rating are required" });
      return;
    }

    const review = await ReviewService.createReview(userId, orderId, rating, comment);
    res.status(201).json(review);
  } catch (error: any) {
    if (error.message.includes("not found") || error.message.includes("already reviewed") || error.message.includes("only review")) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ error: error.message });
  }
};

export const getReviewsByRestaurant = async (req: Request, res: Response) => {
  try {
    const reviews = await ReviewService.getReviewsByRestaurant(req.params.restaurantId as string);
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAverageRating = async (req: Request, res: Response) => {
  try {
    const result = await ReviewService.getAverageRating(req.params.restaurantId as string);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
