import prisma from "../src/config/prisma";

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  const ordersCount = await prisma.order.count();
  const orderItemsCount = await prisma.orderItem.count();
  const reviewsCount = await prisma.review.count();
  const cartsCount = await prisma.cart.count();

  console.log("=== CURRENT DATABASE STATE ===");
  console.log(`Total Users: ${users.length}`);
  console.table(users);
  console.log(`Total Orders: ${ordersCount}`);
  console.log(`Total OrderItems: ${orderItemsCount}`);
  console.log(`Total Reviews: ${reviewsCount}`);
  console.log(`Total Carts: ${cartsCount}`);
}

main()
  .catch((e) => {
    console.error("Error inspecting database:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
