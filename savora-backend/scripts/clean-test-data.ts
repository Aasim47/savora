import prisma from "../src/config/prisma";

async function main() {
  console.log("=== STARTING DATABASE CLEANUP ===");

  // 1. Delete all OrderItems
  const deletedOrderItems = await prisma.orderItem.deleteMany({});
  console.log(`✓ Deleted ${deletedOrderItems.count} OrderItems.`);

  // 2. Delete all Reviews
  const deletedReviews = await prisma.review.deleteMany({});
  console.log(`✓ Deleted ${deletedReviews.count} Reviews.`);

  // 3. Delete all Orders
  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`✓ Deleted ${deletedOrders.count} Orders.`);

  // 4. Reset PromoCode usage counts
  const updatedPromos = await prisma.promoCode.updateMany({
    data: {
      usedCount: 0,
    },
  });
  console.log(`✓ Reset usage count on ${updatedPromos.count} PromoCodes.`);

  // 5. Delete all CartItems
  const deletedCartItems = await prisma.cartItem.deleteMany({});
  console.log(`✓ Deleted ${deletedCartItems.count} CartItems.`);

  // 6. Delete all Carts
  const deletedCarts = await prisma.cart.deleteMany({});
  console.log(`✓ Deleted ${deletedCarts.count} Carts.`);

  // 7. Delete all non-admin users (CUSTOMERS)
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      role: {
        not: "ADMIN",
      },
    },
  });
  console.log(`✓ Deleted ${deletedUsers.count} non-admin Users.`);

  // 8. Verify remaining users
  const remainingUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  // Verify restaurants and menu items are safe
  const restaurantCount = await prisma.restaurant.count();
  const categoryCount = await prisma.category.count();
  const menuItemCount = await prisma.menuItem.count();

  console.log("\n=== CLEANUP COMPLETED SUCCESSFULLY ===");
  console.log("Remaining Admins in Database:");
  console.table(remainingUsers);
  console.log(`Restaurants preserved: ${restaurantCount}`);
  console.log(`Categories preserved: ${categoryCount}`);
  console.log(`Menu Items preserved: ${menuItemCount}`);
}

main()
  .catch((e) => {
    console.error("Cleanup failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
