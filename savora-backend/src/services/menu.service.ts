import prisma from "../config/prisma";

export const createMenuItem = async (data: any) => {
  return prisma.menuItem.create({
    data
  });
};

export const getMenuItems = async () => {
  return prisma.menuItem.findMany({
    include: { restaurant: true, category: true }
  });
};

export const updateMenuItem = async (id: string, data: any) => {
  return prisma.menuItem.update({
    where: { id },
    data
  });
};

export const deleteMenuItem = async (id: string) => {
  const orderCount = await prisma.orderItem.count({ where: { menuItemId: id } });
  if (orderCount > 0) {
    throw new Error("Cannot delete menu item with existing orders. Please mark it as Unavailable instead.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({
      where: { menuItemId: id }
    });
    return tx.menuItem.delete({
      where: { id }
    });
  });
};
