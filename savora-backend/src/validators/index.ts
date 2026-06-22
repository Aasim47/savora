import { z } from "zod";
import { Role, OrderStatus, DiscountType } from "@prisma/client";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const createRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200),
    description: z.string().max(2000).optional(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
    address: z.string().max(500).optional(),
    openingTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
    closingTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
    fssaiLicenseNumber: z.string().max(50).optional(),
    gstNumber: z.string().max(50).optional(),
    legalBusinessName: z.string().max(200).optional(),
    registeredAddress: z.string().max(500).optional(),
  }),
});

export const updateRestaurantSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createRestaurantSchema.shape.body.partial().extend({
    isActive: z.boolean().optional(),
  }),
});

export const restaurantIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const createCategorySchema = z.object({
  body: z.object({
    restaurantId: z.string().uuid(),
    name: z.string().min(2).max(100),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
  }),
});

export const categoryIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const createMenuItemSchema = z.object({
  body: z.object({
    restaurantId: z.string().uuid(),
    categoryId: z.string().uuid(),
    name: z.string().min(2).max(200),
    description: z.string().max(2000).optional(),
    portionSize: z.string().max(100).optional(),
    price: z.number().positive("Price must be positive"),
    imageUrl: z.string().url().optional(),
    available: z.boolean().optional(),
  }),
});

export const updateMenuItemSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createMenuItemSchema.shape.body.partial(),
});

export const menuItemIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const addToCartSchema = z.object({
  body: z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().int().positive("Quantity must be positive"),
  }),
});

export const removeFromCartSchema = z.object({
  body: z.object({ menuItemId: z.string().uuid() }),
});

export const createOrderSchema = z.object({
  body: z.object({
    deliveryAddress: z.string().min(10).max(500),
    customerName: z.string().max(100).optional(),
    customerPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
    promoCode: z.string().max(50).optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.nativeEnum(OrderStatus),
  }),
});

export const updateDeliveryDistanceSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    distance: z.number().min(0, "Distance cannot be negative"),
  }),
});

export const orderIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const createPromoCodeSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(50).toUpperCase(),
    discountType: z.nativeEnum(DiscountType),
    discountValue: z.number().positive("Discount value must be positive"),
    minOrderAmount: z.number().positive().optional(),
    maxUses: z.number().int().positive().optional(),
    expiresAt: z.string().datetime().optional(),
  }),
});

export const promoCodeIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const validatePromoCodeSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(50),
    orderAmount: z.number().positive("Order amount must be positive"),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema.shape.body>;
export type LoginInput = z.infer<typeof loginSchema.shape.body>;
export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema.shape.body>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema.shape.body>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema.shape.body>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema.shape.body>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema.shape.body>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema.shape.body>;
export type AddToCartInput = z.infer<typeof addToCartSchema.shape.body>;
export type CreateOrderInput = z.infer<typeof createOrderSchema.shape.body>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema.shape.body>;
export type UpdateDeliveryDistanceInput = z.infer<typeof updateDeliveryDistanceSchema.shape.body>;
export type CreatePromoCodeInput = z.infer<typeof createPromoCodeSchema.shape.body>;
export type ValidatePromoCodeInput = z.infer<typeof validatePromoCodeSchema.shape.body>;
export type PaginationParams = z.infer<typeof paginationSchema.shape.query>;