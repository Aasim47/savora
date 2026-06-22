import prisma from "../config/prisma";

export const getStats = async () => {
  const totalOrders = await prisma.order.count();
  
  const revenueResult = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: { not: "CANCELLED" } }
  });
  
  const totalRevenue = revenueResult._sum.totalAmount || 0;

  const totalRestaurants = await prisma.restaurant.count({
    where: { isActive: true }
  });

  const totalCustomers = await prisma.user.count({
    where: { role: "CUSTOMER" }
  });

  // Calculate last 7 days analytics
  const analytics = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(d);
    nextDay.setDate(d.getDate() + 1);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: d,
          lt: nextDay
        },
        status: { not: "CANCELLED" }
      },
      select: { totalAmount: true }
    });

    const dailyRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    analytics.push({
      date: d.toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
      revenue: dailyRevenue,
      orders: orders.length
    });
  }

  return {
    totalOrders,
    totalRevenue,
    totalRestaurants,
    totalCustomers,
    analytics
  };
};
