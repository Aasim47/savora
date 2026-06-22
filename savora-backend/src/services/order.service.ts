import prisma from "../config/prisma";
import { OrderStatus } from "@prisma/client";
import * as PromoService from "./promo.service";

export const createOrder = async (
  userId: string,
  deliveryAddress: string,
  customerName?: string,
  promoCode?: string,
  customerPhone?: string
) => {
  // Fetch cart
  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: { items: { include: { menuItem: true } } }
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const restaurantId = cart.items[0].menuItem.restaurantId;
  const itemsTotal = cart.items.reduce((total: number, item: any) => total + (item.quantity * item.menuItem.price), 0);

  // Fetch restaurant compliance info for snapshotting
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: {
      fssaiLicenseNumber: true,
      gstNumber: true,
      legalBusinessName: true,
      registeredAddress: true,
    }
  });

  // Handle promo code
  let discountAmount = 0;
  let promoCodeId: string | null = null;

  if (promoCode) {
    const promoResult = await PromoService.validatePromoCode(promoCode, itemsTotal, restaurantId);
    discountAmount = promoResult.discount;
    promoCodeId = promoResult.promoId;
  }

  const totalAmount = Math.max(0, itemsTotal - discountAmount);

  // Create order with compliance snapshot
  const order = await prisma.order.create({
    data: {
      userId,
      restaurantId,
      deliveryAddress,
      customerName,
      customerPhone,
      totalAmount,
      discountAmount,
      promoCodeId,
      restaurantFssaiNumber: restaurant?.fssaiLicenseNumber ?? null,
      restaurantGstNumber: restaurant?.gstNumber ?? null,
      restaurantLegalName: restaurant?.legalBusinessName ?? null,
      restaurantRegisteredAddress: restaurant?.registeredAddress ?? null,
      items: {
        create: cart.items.map((item: any) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.menuItem.price
        }))
      }
    }
  });

  // Increment promo usage
  if (promoCodeId) {
    await PromoService.applyPromoCode(promoCodeId);
  }

  // Clear the cart
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id }
  });

  return order;
};

export const getOrders = async () => {
  return prisma.order.findMany({
    include: { items: { include: { menuItem: true } }, restaurant: true, user: true, review: true },
    orderBy: { createdAt: 'desc' }
  });
};

export const getUserOrders = async (userId: string) => {
  return prisma.order.findMany({
    where: { userId },
    include: { items: { include: { menuItem: true } }, restaurant: true, review: true },
    orderBy: { createdAt: 'desc' }
  });
};

export const getOrderById = async (id: string, userId: string, role?: string) => {
  const whereClause = role === "ADMIN" ? { id } : { id, userId };
  return prisma.order.findFirst({
    where: whereClause,
    include: { items: { include: { menuItem: true } }, restaurant: true, user: true, review: true }
  });
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new Error("Order not found");

  if (status === "ACCEPTED" && order.deliveryDistance === null) {
    throw new Error("DELIVERY_DISTANCE_REQUIRED");
  }

  return prisma.order.update({
    where: { id },
    data: { status }
  });
};

export const updateDeliveryDistance = async (id: string, distance: number) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true }
  });
  
  if (!order) throw new Error("Order not found");

  if (order.status === "OUT_FOR_DELIVERY" || order.status === "DELIVERED" || order.status === "CANCELLED") {
    throw new Error("DISTANCE_LOCKED");
  }

  // Calculate the fee (First 2km free, then 10rs/km)
  const fee = distance <= 2 ? 0 : (distance - 2) * 10;
  
  // Recalculate total amount from items + new fee - discount
  const itemsTotal = order.items.reduce((total: number, item: any) => total + (item.quantity * item.unitPrice), 0);
  const newTotalAmount = itemsTotal + fee - (order.discountAmount || 0);

  return prisma.order.update({
    where: { id },
    data: { 
      deliveryDistance: distance,
      deliveryFee: fee,
      totalAmount: Math.max(0, newTotalAmount)
    }
  });
};
