import prisma from "../config/prisma";
import { CreateRestaurantInput, UpdateRestaurantInput, PaginationParams, PaginatedResponse } from "../types";
import { NotFoundError, BadRequestError } from "../errors/AppError";

export const createRestaurant = async (data: CreateRestaurantInput) => {
  return prisma.restaurant.create({ data });
};

export const getRestaurants = async (
  params: PaginationParams,
  activeOnly: boolean = false
): Promise<PaginatedResponse<any>> => {
  const { page, limit } = params;
  const skip = (page - 1) * limit;

  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: { reviews: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.restaurant.count({ where: activeOnly ? { isActive: true } : undefined }),
  ]);

  return {
    data: restaurants,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getRestaurantById = async (id: string) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: { categories: true, menuItems: true },
  });
  if (!restaurant) throw new NotFoundError("Restaurant not found");
  return restaurant;
};

export const updateRestaurant = async (id: string, data: UpdateRestaurantInput) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) throw new NotFoundError("Restaurant not found");

  return prisma.restaurant.update({ where: { id }, data });
};

export const deleteRestaurant = async (id: string) => {
  const orderCount = await prisma.order.count({ where: { restaurantId: id } });
  if (orderCount > 0) {
    throw new BadRequestError("Cannot delete restaurant with existing orders");
  }

  return prisma.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({ where: { menuItem: { restaurantId: id } } });
    await tx.menuItem.deleteMany({ where: { restaurantId: id } });
    await tx.category.deleteMany({ where: { restaurantId: id } });
    return tx.restaurant.delete({ where: { id } });
  });
};