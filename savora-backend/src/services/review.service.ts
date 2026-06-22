import prisma from "../config/prisma";

export const createReview = async (
  userId: string,
  orderId: string,
  rating: number,
  comment?: string
) => {
  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // Check order exists, belongs to user, and is delivered
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
  });

  if (!order) {
    throw new Error("Order not found or does not belong to you");
  }

  if (order.status !== "DELIVERED") {
    throw new Error("You can only review delivered orders");
  }

  // Check for duplicate review
  const existing = await prisma.review.findUnique({
    where: { orderId },
  });

  if (existing) {
    throw new Error("You have already reviewed this order");
  }

  return prisma.review.create({
    data: {
      orderId,
      userId,
      restaurantId: order.restaurantId,
      rating,
      comment,
    },
    include: { user: { select: { name: true } } },
  });
};

export const getReviewsByRestaurant = async (restaurantId: string) => {
  return prisma.review.findMany({
    where: { restaurantId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const getAverageRating = async (restaurantId: string) => {
  const result = await prisma.review.aggregate({
    where: { restaurantId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    average: result._avg.rating ? Math.round(result._avg.rating * 10) / 10 : 0,
    count: result._count.rating,
  };
};
