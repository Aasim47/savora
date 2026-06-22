import { Request, Response } from "express";
import * as RestaurantService from "../services/restaurant.service";
import { uploadToImgBB } from "../utils/imgbb";
import { asyncHandler } from "../errors/errorHandler";
import { validate } from "../middlewares/validate";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  restaurantIdSchema,
  paginationSchema,
} from "../validators";
import multer from "multer";

import apiCache from "../utils/cache";

const upload = multer({ storage: multer.memoryStorage() });

const sanitizeComplianceFields = (data: Record<string, any>) => {
  for (const key of ["fssaiLicenseNumber", "gstNumber", "legalBusinessName", "registeredAddress"]) {
    if (data[key] !== undefined && typeof data[key] === "string" && data[key].trim() === "") {
      data[key] = null;
    }
  }
};

export const createRestaurant = [
  validate(createRestaurantSchema),
  upload.single("image"),
  asyncHandler(async (req: Request, res: Response) => {
    const data = { ...req.body };
    delete data.image;
    sanitizeComplianceFields(data);

    if (req.file) {
      const imageUrl = await uploadToImgBB(req.file.buffer, req.file.originalname);
      data.imageUrl = imageUrl;
    }

    const restaurant = await RestaurantService.createRestaurant(data);
    apiCache.flushAll(); // Invalidate cache on change
    res.status(201).json({ success: true, data: restaurant });
  }),
];

export const getRestaurants = [
  validate(paginationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const activeOnly = req.query.activeOnly === "true";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    
    const cacheKey = `restaurants_${activeOnly}_${page}_${limit}`;
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      res.json({ success: true, ...(cachedData as any) });
      return;
    }

    const result = await RestaurantService.getRestaurants({ page, limit }, activeOnly);
    apiCache.set(cacheKey, result);
    res.json({ success: true, ...result });
  }),
];

export const getRestaurantById = [
  validate(restaurantIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const cacheKey = `restaurant_${req.params.id}`;
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      res.json({ success: true, data: cachedData });
      return;
    }

    const restaurant = await RestaurantService.getRestaurantById(req.params.id as string);
    apiCache.set(cacheKey, restaurant);
    res.json({ success: true, data: restaurant });
  }),
];

export const updateRestaurant = [
  validate(updateRestaurantSchema),
  upload.single("image"),
  asyncHandler(async (req: Request, res: Response) => {
    const data = { ...req.body };
    delete data.image;
    sanitizeComplianceFields(data);

    if (req.file) {
      const imageUrl = await uploadToImgBB(req.file.buffer, req.file.originalname);
      data.imageUrl = imageUrl;
    }

    const restaurant = await RestaurantService.updateRestaurant(req.params.id as string, data);
    apiCache.flushAll(); // Invalidate cache on change
    res.json({ success: true, data: restaurant });
  }),
];

export const deleteRestaurant = [
  validate(restaurantIdSchema),
  asyncHandler(async (req: Request, res: Response) => {
    await RestaurantService.deleteRestaurant(req.params.id as string);
    apiCache.flushAll(); // Invalidate cache on change
    res.status(204).send();
  }),
];