import prisma from "../config/prisma";

export const getCart = async (userId: string) => {
  return prisma.cart.findFirst({
    where: { userId },
    include: { items: { include: { menuItem: true } } }
  });
};

export const addToCart = async (userId: string, menuItemId: string, quantity: number) => {
  let cart = await prisma.cart.findFirst({ 
    where: { userId },
    include: { items: { include: { menuItem: true } } }
  });
  
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId }, include: { items: { include: { menuItem: true } } } });
  }

  const menuItem = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
  if (!menuItem) throw new Error("Menu item not found");

  if (cart.items && cart.items.length > 0) {
    const existingRestaurantId = cart.items[0].menuItem.restaurantId;
    if (existingRestaurantId !== menuItem.restaurantId) {
      throw new Error("DIFFERENT_RESTAURANT");
    }
  }

  const existingItem = cart.items.find(i => i.menuItemId === menuItemId);

  if (existingItem) {
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity }
    });
  } else {
    return prisma.cartItem.create({
      data: { cartId: cart.id, menuItemId, quantity }
    });
  }
};

export const removeFromCart = async (userId: string, menuItemId: string) => {
  const cart = await prisma.cart.findFirst({ where: { userId } });
  if (!cart) return null;

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, menuItemId }
  });

  if (existingItem) {
    return prisma.cartItem.delete({
      where: { id: existingItem.id }
    });
  }
  return null;
};

export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findFirst({ where: { userId } });
  if (!cart) return null;
  return prisma.cartItem.deleteMany({
    where: { cartId: cart.id }
  });
};
