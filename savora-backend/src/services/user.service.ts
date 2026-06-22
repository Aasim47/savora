import prisma from "../config/prisma";

export const getUsers = async () => {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        include: { restaurant: true, items: { include: { menuItem: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) return null;

  const totalSpend = user.orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = user.orders.length;

  return { ...user, totalSpend, totalOrders };
};

export const updateUser = async (id: string, data: any) => {
  return prisma.user.update({
    where: { id },
    data
  });
};
