import { requireAdmin } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { ProductModel } from "@/lib/models/Product";
import { OrderModel } from "@/lib/models/Order";
import { ok, handleApiError } from "@/lib/utils/response";

const RESERVED_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "PACKED"];

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const [products, reservedAgg, soldAgg] = await Promise.all([
      ProductModel.find().select("name sku stock lowStockThreshold status").populate("category", "name").lean(),
      OrderModel.aggregate([
        { $match: { orderStatus: { $in: RESERVED_STATUSES } } },
        { $unwind: "$items" },
        { $group: { _id: "$items.productId", reserved: { $sum: "$items.quantity" } } },
      ]),
      OrderModel.aggregate([
        { $match: { orderStatus: { $nin: ["CANCELLED", "PAYMENT_FAILED"] } } },
        { $unwind: "$items" },
        { $group: { _id: "$items.productId", sold: { $sum: "$items.quantity" } } },
      ]),
    ]);

    const reservedMap = new Map(reservedAgg.map((r) => [r._id.toString(), r.reserved]));
    const soldMap = new Map(soldAgg.map((s) => [s._id.toString(), s.sold]));

    const inventory = products.map((p) => {
      const stock = p.stock;
      const status = stock <= 0 ? "OUT_OF_STOCK" : stock <= p.lowStockThreshold ? "LOW_STOCK" : "IN_STOCK";
      return {
        productId: p._id,
        name: p.name,
        sku: p.sku,
        category: (p.category as { name?: string } | null)?.name,
        stock,
        reserved: reservedMap.get(p._id.toString()) || 0,
        sold: soldMap.get(p._id.toString()) || 0,
        lowStockThreshold: p.lowStockThreshold,
        status,
      };
    });

    return ok({ inventory });
  } catch (err) {
    return handleApiError(err);
  }
}
