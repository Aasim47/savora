import prisma from "../config/prisma";
import { DiscountType } from "@prisma/client";

export const createPromoCode = async (data: {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  expiresAt?: string;
  restaurantId?: string;
}) => {
  return prisma.promoCode.create({
    data: {
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderAmount: data.minOrderAmount || null,
      maxUses: data.maxUses || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      restaurantId: data.restaurantId || null,
    },
  });
};

export const getPromoCodes = async () => {
  return prisma.promoCode.findMany({
    include: { restaurant: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const deletePromoCode = async (id: string) => {
  return prisma.promoCode.delete({ where: { id } });
};

export const validatePromoCode = async (code: string, orderAmount: number, currentRestaurantId?: string) => {
  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!promo) {
    throw new Error("Invalid promo code");
  }

  if (!promo.isActive) {
    throw new Error("This promo code is no longer active");
  }

  if (promo.restaurantId && promo.restaurantId !== currentRestaurantId) {
    throw new Error("This promo code is not valid for this restaurant");
  }

  if (promo.expiresAt && new Date() > promo.expiresAt) {
    throw new Error("This promo code has expired");
  }

  if (promo.maxUses && promo.usedCount >= promo.maxUses) {
    throw new Error("This promo code has reached its usage limit");
  }

  if (promo.minOrderAmount && orderAmount < promo.minOrderAmount) {
    throw new Error(`Minimum order amount is ₹${promo.minOrderAmount}`);
  }

  // Calculate discount
  let discount = 0;
  if (promo.discountType === "PERCENTAGE") {
    discount = Math.round((orderAmount * promo.discountValue) / 100);
  } else {
    discount = promo.discountValue;
  }

  // Discount cannot exceed order amount
  discount = Math.min(discount, orderAmount);

  return {
    promoId: promo.id,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discount,
  };
};

export const applyPromoCode = async (id: string) => {
  return prisma.promoCode.update({
    where: { id },
    data: { usedCount: { increment: 1 } },
  });
};
