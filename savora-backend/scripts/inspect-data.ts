import prisma from "../src/config/prisma";

async function main() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { name: { contains: "Arnapurna", mode: "insensitive" } },
    include: {
      categories: {
        include: { menuItems: true },
      },
    },
  });

  console.log("Restaurant:", restaurant?.name, restaurant?.id);
  restaurant?.categories.forEach((cat) => {
    console.log(`\nCategory: ${cat.name} (${cat.menuItems.length} items)`);
    cat.menuItems.forEach((m) => {
      console.log(` - ${m.name} | ${m.portionSize || "Standard"} | ₹${m.price}`);
    });
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
