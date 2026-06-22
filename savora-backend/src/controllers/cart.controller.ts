import { Request, Response } from "express";
import * as CartService from "../services/cart.service";

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user!.id;
    const cart = await CartService.getCart(userId);
    res.json(cart);
  } catch (error) {
    console.error("❌ ERROR FETCHING CART:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user!.id;
    const { menuItemId, quantity } = req.body;
    if (!menuItemId || quantity === undefined) {
      res.status(400).json({ message: "menuItemId and quantity are required" });
      return;
    }
    const cartItem = await CartService.addToCart(userId, menuItemId, quantity);
    res.status(201).json(cartItem);
  } catch (error: any) {
    if (error.message === "DIFFERENT_RESTAURANT") {
      res.status(400).json({ message: "DIFFERENT_RESTAURANT" });
      return;
    }
    res.status(500).json(error);
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user!.id;
    await CartService.clearCart(userId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json(error);
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user!.id;
    const { menuItemId } = req.body;
    if (!menuItemId) {
      res.status(400).json({ message: "menuItemId is required" });
      return;
    }
    await CartService.removeFromCart(userId, menuItemId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json(error);
  }
};
