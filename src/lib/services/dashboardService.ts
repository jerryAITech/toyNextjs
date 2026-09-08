import { connectDB } from "@/lib/db/connect";
import { OrderModel } from "@/lib/models/Order";
import { ProductModel } from "@/lib/models/Product";
import { UserModel } from "@/lib/models/User";

export function resolveDateRange(range: string, from?: string, to?: string) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case "today":
      return { start: startOfToday, end: now };
    case "yesterday": {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 1);
      return { start, end: startOfToday };
    }
    case "7d": {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 6);
      return { start, end: now };
    }
    case "30d": {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 29);
      return { start, end: now };
    }
    case "month":
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
    case "custom":
      return { start: from ? new Date(from) : startOfToday, end: to ? new Date(to) : now };
    default:
      return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29), end: now };
  }
}

const REVENUE_COUNTED_STATUSES = ["CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

export async function getDashboardStats(start: Date, end: Date) {
  await connectDB();

  const dateFilter = { createdAt: { $gte: start, $lte: end } };
  const revenueFilter = { ...dateFilter, orderStatus: { $in: REVENUE_COUNTED_STATUSES } };

  const [totalUsers, totalProducts, totalOrders, revenueAgg, pendingOrders, deliveredOrders, lowStockProducts, statusBreakdown, dailySales, topProducts, topCategories] =
    await Promise.all([
      UserModel.countDocuments({ role: "USER" }),
      ProductModel.countDocuments(),
      OrderModel.countDocuments(dateFilter),
      OrderModel.aggregate([{ $match: revenueFilter }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      OrderModel.countDocuments({ ...dateFilter, orderStatus: "PENDING" }),
      OrderModel.countDocuments({ ...dateFilter, orderStatus: "DELIVERED" }),
      ProductModel.countDocuments({ $expr: { $lte: ["$stock", "$lowStockThreshold"] } }),
      OrderModel.aggregate([{ $match: dateFilter }, { $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
      OrderModel.aggregate([
        { $match: revenueFilter },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      OrderModel.aggregate([
        { $match: revenueFilter },
        { $unwind: "$items" },
        { $group: { _id: "$items.productName", quantity: { $sum: "$items.quantity" }, revenue: { $sum: "$items.finalPrice" } } },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
      OrderModel.aggregate([
        { $match: revenueFilter },
        { $unwind: "$items" },
        { $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        { $lookup: { from: "categories", localField: "product.category", foreignField: "_id", as: "category" } },
        { $unwind: "$category" },
        { $group: { _id: "$category.name", revenue: { $sum: "$items.finalPrice" } } },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
    ]);

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: revenueAgg[0]?.total || 0,
    pendingOrders,
    deliveredOrders,
    lowStockProducts,
    statusBreakdown: statusBreakdown.map((s) => ({ status: s._id, count: s.count })),
    dailySales: dailySales.map((d) => ({ date: d._id, revenue: d.revenue, orders: d.orders })),
    topProducts: topProducts.map((p) => ({ name: p._id, quantity: p.quantity, revenue: p.revenue })),
    topCategories: topCategories.map((c) => ({ name: c._id, revenue: c.revenue })),
  };
}
