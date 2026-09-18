import { connectDB } from "@/lib/db/connect";
import { OrderModel } from "@/lib/models/Order";
import { ProductModel } from "@/lib/models/Product";
import { UserModel } from "@/lib/models/User";
import { PaymentModel } from "@/lib/models/Payment";

type Range = { start: Date; end: Date };

export async function salesReport({ start, end }: Range) {
  await connectDB();
  const orders = await OrderModel.find({ createdAt: { $gte: start, $lte: end } }).sort({ createdAt: -1 }).lean();
  return orders.map((o) => ({
    orderNumber: o.orderNumber,
    date: o.createdAt.toISOString().slice(0, 10),
    items: o.items.length,
    subtotal: o.subtotal,
    discount: o.discount + o.couponDiscount,
    shipping: o.shipping,
    total: o.total,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
  }));
}

export async function orderReport({ start, end }: Range) {
  await connectDB();
  const orders = await OrderModel.find({ createdAt: { $gte: start, $lte: end } })
    .sort({ createdAt: -1 })
    .populate("userId", "name email")
    .lean();
  return orders.map((o) => ({
    orderNumber: o.orderNumber,
    date: o.createdAt.toISOString().slice(0, 10),
    customer: (o.userId as { name?: string } | null)?.name || `${o.addressSnapshot.fullName} (Guest)`,
    email: (o.userId as { email?: string } | null)?.email || o.guestEmail || "",
    total: o.total,
    status: o.orderStatus,
    paymentMethod: o.paymentMethod,
  }));
}

export async function productReport({ start, end }: Range) {
  await connectDB();
  const rows = await OrderModel.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, orderStatus: { $nin: ["CANCELLED", "PAYMENT_FAILED"] } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        name: { $first: "$items.productName" },
        sku: { $first: "$items.sku" },
        unitsSold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.finalPrice" },
      },
    },
    { $sort: { revenue: -1 } },
  ]);
  return rows.map((r) => ({ product: r.name, sku: r.sku, unitsSold: r.unitsSold, revenue: r.revenue }));
}

export async function categoryReport({ start, end }: Range) {
  await connectDB();
  const rows = await OrderModel.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, orderStatus: { $nin: ["CANCELLED", "PAYMENT_FAILED"] } } },
    { $unwind: "$items" },
    { $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "product" } },
    { $unwind: "$product" },
    { $lookup: { from: "categories", localField: "product.category", foreignField: "_id", as: "category" } },
    { $unwind: "$category" },
    {
      $group: {
        _id: "$category.name",
        unitsSold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.finalPrice" },
      },
    },
    { $sort: { revenue: -1 } },
  ]);
  return rows.map((r) => ({ category: r._id, unitsSold: r.unitsSold, revenue: r.revenue }));
}

export async function userReport({ start, end }: Range) {
  await connectDB();
  const users = await UserModel.find({ createdAt: { $gte: start, $lte: end }, role: "USER" }).sort({ createdAt: -1 }).lean();
  const orderCounts = await OrderModel.aggregate([{ $group: { _id: "$userId", count: { $sum: 1 }, spent: { $sum: "$total" } } }]);
  const map = new Map(orderCounts.map((o) => [o._id.toString(), o]));

  return users.map((u) => ({
    name: u.name,
    email: u.email,
    joined: u.createdAt.toISOString().slice(0, 10),
    status: u.status,
    orders: map.get(u._id.toString())?.count || 0,
    totalSpent: map.get(u._id.toString())?.spent || 0,
  }));
}

export async function paymentReport({ start, end }: Range) {
  await connectDB();
  const payments = await PaymentModel.find({ createdAt: { $gte: start, $lte: end } })
    .sort({ createdAt: -1 })
    .populate("orderId", "orderNumber")
    .lean();

  return payments.map((p) => ({
    orderNumber: (p.orderId as { orderNumber?: string } | null)?.orderNumber || "",
    date: p.createdAt.toISOString().slice(0, 10),
    method: p.method,
    status: p.status,
    amount: p.amount,
    razorpayPaymentId: p.razorpayPaymentId || "",
  }));
}

export const REPORT_RUNNERS = {
  sales: salesReport,
  orders: orderReport,
  products: productReport,
  categories: categoryReport,
  users: userReport,
  payments: paymentReport,
};

export type ReportType = keyof typeof REPORT_RUNNERS;
