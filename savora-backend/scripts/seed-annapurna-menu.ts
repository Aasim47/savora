import prisma from "../src/config/prisma";

interface MenuItemDef {
  name: string;
  halfPrice?: number;
  fullPrice?: number;
  price?: number;
  portionSize?: string;
  description?: string;
}

interface CategoryDef {
  name: string;
  items: MenuItemDef[];
}

const menuData: CategoryDef[] = [
  {
    name: "Chinese Soups",
    items: [
      { name: "Veg Hot & Sour Soup", price: 80, portionSize: "Full" },
      { name: "Veg Manchow Soup", price: 80, portionSize: "Full" },
      { name: "Tomato Soup", price: 80, portionSize: "Full" },
      { name: "Mushroom Soup", price: 80, portionSize: "Full" },
      { name: "Sweet Corn Soup", price: 80, portionSize: "Full" },
      { name: "Chicken Hot & Sour Soup", price: 100, portionSize: "Full" },
      { name: "Chicken Manchow Soup", price: 100, portionSize: "Full" },
      { name: "Chicken Clear Soup", price: 100, portionSize: "Full" },
    ],
  },
  {
    name: "Chinese Veg Starters & Mains",
    items: [
      { name: "Veg Spring Roll", price: 140, portionSize: "Full" },
      { name: "Veg Roll", price: 70, portionSize: "Full" },
      { name: "Paneer Roll", price: 90, portionSize: "Full" },
      { name: "Veg Noodles", halfPrice: 80, fullPrice: 140 },
      { name: "Chilly Potato", price: 130, portionSize: "Full" },
      { name: "Chilly Gobi", price: 150, portionSize: "Full" },
      { name: "Gobi 65", price: 150, portionSize: "Full" },
      { name: "Gobi Manchurian", price: 150, portionSize: "Full" },
      { name: "Mushroom Chilly", halfPrice: 120, fullPrice: 220 },
      { name: "Mushroom 65", halfPrice: 120, fullPrice: 220 },
      { name: "Mushroom Manchurian", halfPrice: 120, fullPrice: 220 },
      { name: "Mushroom Salt 'n' Pepper", price: 200, portionSize: "Full" },
      { name: "Crispy Veg", price: 160, portionSize: "Full" },
      { name: "Paneer Pakoda", price: 200, portionSize: "Full" },
      { name: "Paneer Chilly", halfPrice: 130, fullPrice: 220 },
      { name: "Paneer 65", halfPrice: 130, fullPrice: 220 },
      { name: "Paneer Manchurian", halfPrice: 130, fullPrice: 220 },
      { name: "Paneer Fingers (Dry)", price: 200, portionSize: "Full" },
      { name: "Paneer Lollipop", price: 220, portionSize: "Full" },
      { name: "Baby Corn Chilly", halfPrice: 130, fullPrice: 220 },
      { name: "Baby Corn 65", halfPrice: 130, fullPrice: 220 },
      { name: "Crispy Baby Corn", price: 200, portionSize: "Full" },
      { name: "American Corn Fry", price: 180, portionSize: "Full" },
      { name: "Chana Chilly", price: 120, portionSize: "Full" },
      { name: "Chana Dry", price: 120, portionSize: "Full" },
      { name: "Green Peas Fry", price: 130, portionSize: "Full" },
    ],
  },
  {
    name: "Chinese Non-Veg",
    items: [
      { name: "Egg Chicken Roll", price: 80, portionSize: "Full" },
      { name: "Double Egg Chicken Roll", price: 90, portionSize: "Full" },
      { name: "Chicken Noodles", halfPrice: 90, fullPrice: 160 },
      { name: "Chicken Pakoda", halfPrice: 120, fullPrice: 200 },
      { name: "Chicken Lollipop", halfPrice: 120, fullPrice: 200 },
      { name: "Chicken Chilly", halfPrice: 120, fullPrice: 220 },
      { name: "Chicken 65", halfPrice: 120, fullPrice: 220 },
      { name: "Chicken Manchurian", halfPrice: 120, fullPrice: 220 },
      { name: "Chilly Chicken Boneless", price: 240, portionSize: "Full" },
      { name: "Chicken Majestic", price: 240, portionSize: "Full" },
      { name: "Chicken 555", price: 240, portionSize: "Full" },
      { name: "Chicken Drumstick", price: 240, portionSize: "Full" },
      { name: "Crispy Chicken", price: 250, portionSize: "Full" },
      { name: "Dragon Chicken", price: 260, portionSize: "Full" },
      { name: "Chicken Chips", price: 280, portionSize: "Full" },
      { name: "Ginger Garlic Chicken", price: 300, portionSize: "Full" },
      { name: "Prawns Chilly", price: 300, portionSize: "Full" },
      { name: "Prawns 65", price: 300, portionSize: "Full" },
      { name: "Prawns Manchurian", price: 300, portionSize: "Full" },
      { name: "Prawns Garlic", price: 320, portionSize: "Full" },
    ],
  },
  {
    name: "Indian Veg Curry",
    items: [
      { name: "Vegetable Mix", halfPrice: 100, fullPrice: 160 },
      { name: "Veg Kadai", price: 180, portionSize: "Full" },
      { name: "Veg Hyderabadi", price: 180, portionSize: "Full" },
      { name: "Aloo Gobi Masala", price: 140, portionSize: "Full" },
      { name: "Gobi Masala", price: 150, portionSize: "Full" },
      { name: "Veg Kofta", price: 180, portionSize: "Full" },
      { name: "Malai Kofta", price: 180, portionSize: "Full" },
      { name: "Paneer Tikka Masala", price: 280, portionSize: "Full" },
      { name: "Paneer Bharta", price: 280, portionSize: "Full" },
      { name: "Shahi Paneer", price: 280, portionSize: "Full" },
      { name: "Kaju Paneer", price: 300, portionSize: "Full" },
      { name: "Matar Paneer", halfPrice: 140, fullPrice: 250 },
      { name: "Palak Paneer", halfPrice: 150, fullPrice: 280 },
      { name: "Mushroom Masala", halfPrice: 130, fullPrice: 250 },
      { name: "Dal Fry", halfPrice: 60, fullPrice: 100 },
      { name: "Paneer Tadka", halfPrice: 120, fullPrice: 160 },
      { name: "Dal Tadka", halfPrice: 80, fullPrice: 120 },
      { name: "Chana Masala", halfPrice: 80, fullPrice: 140 },
      { name: "Veg Tadka", halfPrice: 80, fullPrice: 140 },
    ],
  },
  {
    name: "Indian Non-Veg Curry",
    items: [
      { name: "Egg Masala", price: 80, portionSize: "Full" },
      { name: "Egg Curry", price: 80, portionSize: "Full" },
      { name: "Egg Tadka", halfPrice: 70, fullPrice: 140 },
      { name: "Egg Kadai", price: 120, portionSize: "Full" },
      { name: "Egg Bhurji", halfPrice: 70, fullPrice: 120 },
      { name: "Egg Keema Masala", price: 140, portionSize: "Full" },
      { name: "Omlet", price: 60, portionSize: "Full" },
      { name: "Desi Chicken", price: 300, portionSize: "Full" },
      { name: "Afghani Chicken", price: 280, portionSize: "Full" },
      { name: "Butter Chicken Boneless", halfPrice: 150, fullPrice: 280 },
      { name: "Chicken Masala", halfPrice: 140, fullPrice: 240 },
      { name: "Chicken Kassa", halfPrice: 140, fullPrice: 240 },
      { name: "Chicken Curry", halfPrice: 130, fullPrice: 230 },
      { name: "Chicken Hyderabadi", price: 260, portionSize: "Full" },
      { name: "Chicken Do Pyaza", price: 260, portionSize: "Full" },
      { name: "Chicken Tikka Masala", price: 300, portionSize: "Full" },
      { name: "Mutton Masala", halfPrice: 240, fullPrice: 360 },
      { name: "Mutton Kassa", halfPrice: 240, fullPrice: 360 },
      { name: "Mutton Curry", halfPrice: 220, fullPrice: 330 },
      { name: "Mutton Rogan Josh", price: 380, portionSize: "Full" },
      { name: "Mutton Kadai", price: 380, portionSize: "Full" },
    ],
  },
  {
    name: "Sea Food",
    items: [
      { name: "Fish Curry", halfPrice: 60, fullPrice: 120 },
      { name: "Fish Masala", halfPrice: 60, fullPrice: 120 },
      { name: "Fish Fry", price: 100, portionSize: "Full" },
      { name: "Prawns Curry", halfPrice: 230, fullPrice: 340 },
      { name: "Prawns Masala", halfPrice: 230, fullPrice: 340 },
      { name: "Crab Fry", halfPrice: 200, fullPrice: 300 },
      { name: "Crab Masala", halfPrice: 220, fullPrice: 330 },
    ],
  },
  {
    name: "Biryani & Rice",
    items: [
      { name: "Jeera Rice", price: 100, portionSize: "Full" },
      { name: "Tomato Rice", price: 100, portionSize: "Full" },
      { name: "Lemon Rice", price: 100, portionSize: "Full" },
      { name: "Veg Fried Rice", halfPrice: 80, fullPrice: 120 },
      { name: "Egg Fried Rice", halfPrice: 90, fullPrice: 130 },
      { name: "Chicken Fried Rice", halfPrice: 100, fullPrice: 150 },
      { name: "Veg Mix Pulao", price: 160, portionSize: "Full" },
      { name: "Mix Veg Fried Rice", price: 150, portionSize: "Full" },
      { name: "Mixed Non Veg Fried Rice", price: 200, portionSize: "Full" },
      { name: "Prawns Fried Rice", price: 180, portionSize: "Full" },
      { name: "Veg Biryani", halfPrice: 120, fullPrice: 180 },
      { name: "Chicken Dum Biryani", halfPrice: 150, fullPrice: 220 },
      { name: "Chicken Fried Biryani", halfPrice: 150, fullPrice: 220 },
      { name: "Mutton Biryani", halfPrice: 240, fullPrice: 360 },
    ],
  },
  {
    name: "Meals",
    items: [
      { name: "Veg Meal", price: 80, portionSize: "Full" },
      { name: "Mushroom Meal", price: 120, portionSize: "Full" },
      { name: "Fish Meal", price: 130, portionSize: "Full" },
      { name: "Paneer Meal", price: 140, portionSize: "Full" },
      { name: "Chicken Meal", price: 150, portionSize: "Full" },
      { name: "Prawn Meal", price: 200, portionSize: "Full" },
      { name: "Mutton Meal", price: 240, portionSize: "Full" },
    ],
  },
  {
    name: "Breakfast, Breads & Sides",
    items: [
      { name: "Papad Fry", price: 20, portionSize: "Full" },
      { name: "Papad Dry", price: 20, portionSize: "Full" },
      { name: "Masala Papad", price: 30, portionSize: "Full" },
      { name: "Tawa Roti", price: 8, portionSize: "1 Pc" },
      { name: "Paratha", price: 20, portionSize: "1 Pc" },
      { name: "Lachchha Paratha", price: 35, portionSize: "1 Pc" },
      { name: "Cold Drink", price: 20, portionSize: "Can / Bottle" },
      { name: "Masala Cold Drink", price: 40, portionSize: "Glass" },
      { name: "Masala Soda", price: 40, portionSize: "Glass" },
      { name: "Green Salad", price: 60, portionSize: "Full" },
      { name: "Raitha Salad", price: 70, portionSize: "Full" },
      { name: "Onion Salad", price: 40, portionSize: "Full" },
      { name: "Dahi Salad", price: 50, portionSize: "Full" },
    ],
  },
];

async function main() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { name: { contains: "Arnapurna", mode: "insensitive" } },
  });

  if (!restaurant) {
    console.error("Restaurant 'Arnapurna Restaurant' not found in database!");
    process.exit(1);
  }

  console.log(`Found restaurant: ${restaurant.name} (${restaurant.id})`);

  // Remove old categories & menu items for this restaurant to ensure clean replacement
  await prisma.cartItem.deleteMany({
    where: { menuItem: { restaurantId: restaurant.id } },
  });
  await prisma.menuItem.deleteMany({
    where: { restaurantId: restaurant.id },
  });
  await prisma.category.deleteMany({
    where: { restaurantId: restaurant.id },
  });
  console.log("✓ Cleaned existing items for fresh bulk import.");

  let totalItemsCreated = 0;

  for (const cat of menuData) {
    const createdCategory = await prisma.category.create({
      data: {
        name: cat.name,
        restaurantId: restaurant.id,
      },
    });

    console.log(`\nCreated Category: ${createdCategory.name}`);

    for (const item of cat.items) {
      if (item.halfPrice !== undefined && item.fullPrice !== undefined) {
        // Create Half variant
        await prisma.menuItem.create({
          data: {
            name: item.name,
            portionSize: "Half",
            price: item.halfPrice,
            restaurantId: restaurant.id,
            categoryId: createdCategory.id,
            available: true,
          },
        });
        // Create Full variant
        await prisma.menuItem.create({
          data: {
            name: item.name,
            portionSize: "Full",
            price: item.fullPrice,
            restaurantId: restaurant.id,
            categoryId: createdCategory.id,
            available: true,
          },
        });
        totalItemsCreated += 2;
        console.log(`  + ${item.name} (Half: ₹${item.halfPrice}, Full: ₹${item.fullPrice})`);
      } else {
        await prisma.menuItem.create({
          data: {
            name: item.name,
            portionSize: item.portionSize || "Full",
            price: item.price || 0,
            restaurantId: restaurant.id,
            categoryId: createdCategory.id,
            available: true,
          },
        });
        totalItemsCreated += 1;
        console.log(`  + ${item.name} (${item.portionSize || "Full"}: ₹${item.price})`);
      }
    }
  }

  console.log(`\n🎉 Successfully seeded ${menuData.length} categories and ${totalItemsCreated} individual menu items!`);
}

main()
  .catch((e) => {
    console.error("Error seeding menu:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
