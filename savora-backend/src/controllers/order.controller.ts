import { Request, Response } from "express";
import * as OrderService from "../services/order.service";
import { getIO } from "../socket";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user!.id;
    const { deliveryAddress, customerName, promoCode, customerPhone } = req.body;
    if (!deliveryAddress) {
      res.status(400).json({ message: "deliveryAddress is required" });
      return;
    }
    const order = await OrderService.createOrder(userId, deliveryAddress, customerName, promoCode, customerPhone);
    const io = getIO();
    if (io) {
      io.to("admin").emit("new-order", order);
    }
    res.status(201).json(order);
  } catch (error: any) {
    if (error.message && (error.message.includes("promo") || error.message.includes("Promo") || error.message.includes("Minimum") || error.message === "Cart is empty")) {
      res.status(400).json({ message: error.message });
      return;
    }
    console.error("Order creation error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    // For now, this returns all orders. Admin endpoint.
    const orders = await OrderService.getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user!.id;
    const orders = await OrderService.getUserOrders(userId);
    res.json(orders);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user!;
    const order = await OrderService.getOrderById(req.params.id as string, user.id, user.role);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.json(order);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ message: "status is required" });
      return;
    }
    const order = await OrderService.updateOrderStatus(req.params.id as string, status);
    const io = getIO();
    if (io) {
      io.to(`user_${order.userId}`).emit("order-updated", order);
      io.to("admin").emit("order-updated", order);
    }
    res.json(order);
  } catch (error: any) {
    if (error.message === "DELIVERY_DISTANCE_REQUIRED") {
      res.status(400).json({ message: "DELIVERY_DISTANCE_REQUIRED" });
      return;
    }
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderDistance = async (req: Request, res: Response) => {
  try {
    const { distance } = req.body;
    if (typeof distance !== 'number') {
      res.status(400).json({ message: "distance (number) is required" });
      return;
    }
    const order = await OrderService.updateDeliveryDistance(req.params.id as string, distance);
    const io = getIO();
    if (io) {
      io.to(`user_${order.userId}`).emit("order-updated", order);
      io.to("admin").emit("order-updated", order);
    }
    res.json(order);
  } catch (error: any) {
    if (error.message === "DISTANCE_LOCKED") {
      res.status(400).json({ message: "DISTANCE_LOCKED" });
      return;
    }
    res.status(500).json({ error: error.message });
  }
};
