import prisma from "../config/prisma";

export const createCategory = async (data: any) => {
  return prisma.category.create({
    data
  });
};

export const getCategories = async () => {
  return prisma.category.findMany({
    include: { restaurant: true }
  });
};
export const deleteCategory = async (id: string) => {
  const orderCount = await prisma.orderItem.count({ where: { menuItem: { categoryId: id } } });
  if (orderCount > 0) {
    throw new Error("Cannot delete category with existing orders in its menu items.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({
      where: { menuItem: { categoryId: id } }
    });
    await tx.menuItem.deleteMany({
      where: { categoryId: id }
    });
    return tx.category.delete({
      where: { id }
    });
  });
};
