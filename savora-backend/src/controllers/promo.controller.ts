import { Request, Response } from "express";
import * as PromoService from "../services/promo.service";

export const createPromoCode = async (req: Request, res: Response) => {
  try {
    const promo = await PromoService.createPromoCode(req.body);
    res.status(201).json(promo);
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(400).json({ message: "A promo code with this name already exists" });
      return;
    }
    res.status(500).json({ error: error.message });
  }
};

export const getPromoCodes = async (_req: Request, res: Response) => {
  try {
    const promos = await PromoService.getPromoCodes();
    res.json(promos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePromoCode = async (req: Request, res: Response) => {
  try {
    await PromoService.deletePromoCode(req.params.id as string);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const validatePromoCode = async (req: Request, res: Response) => {
  try {
    const { code, orderAmount, restaurantId } = req.body;
    if (!code || typeof orderAmount !== "number") {
      res.status(400).json({ message: "code and orderAmount (number) are required" });
      return;
    }
    const result = await PromoService.validatePromoCode(code, orderAmount, restaurantId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
