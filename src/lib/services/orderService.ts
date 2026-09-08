import { connectDB } from "@/lib/db/connect";
import { OrderModel, ORDER_STATUSES, type Order } from "@/lib/models/Order";
import { ProductModel } from "@/lib/models/Product";
import { AddressModel } from "@/lib/models/Address";
import { SettingsModel } from "@/lib/models/Settings";
import { PaymentModel } from "@/lib/models/Payment";
import { getCart, clearCart } from "@/lib/services/cartService";
import { incrementCouponUsage } from "@/lib/services/couponService";
import { ApiError } from "@/lib/utils/response";
import crypto from "crypto";

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `TS${timestamp}${random}`;
}

async function buildOrderDraft(userId: string, addressId: string) {
  await connectDB();

  const cartView = await getCart({ userId, guestId: null });
  if (cartView.items.length === 0) throw new ApiError("Your cart is empty.", 400);

  const unavailable = cartView.items.filter((i) => i.unavailable);
  if (unavailable.length > 0) {
    throw new ApiError(
      `${unavailable.map((i) => i.name).join(", ")} ${unavailable.length > 1 ? "are" : "is"} no longer available. Please remove ${unavailable.length > 1 ? "them" : "it"} from your cart.`,
      409
    );
  }

  const address = await AddressModel.findOne({ _id: addressId, userId });
  if (!address) throw new ApiError("Please select a valid delivery address.", 400);

  const products = await ProductModel.find({ _id: { $in: cartView.items.map((i) => i.productId) } }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const items = cartView.items.map((line) => {
    const product = productMap.get(line.productId)!;
    return {
      productId: product._id,
      productName: product.name,
      slug: product.slug,
      sku: product.sku,
      image: product.images[0] || "",
      mrp: product.mrp,
      price: product.price,
      quantity: line.quantity,
      discount: (product.mrp - product.price) * line.quantity,
      finalPrice: product.price * line.quantity,
    };
  });

  const addressSnapshot = {
    fullName: address.fullName,
    mobile: address.mobile,
    house: address.house,
    street: address.street,
    area: address.area,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    landmark: address.landmark,
    type: address.type,
  };

  return {
    items,
    addressSnapshot,
    subtotal: cartView.subtotal,
    discount: cartView.productDiscount,
    couponCode: cartView.couponCode,
    couponDiscount: cartView.couponDiscount,
    shipping: cartView.shipping,
    total: cartView.total,
  };
}

async function atomicDecrementStock(items: { productId: unknown; quantity: number }[]) {
  const applied: { productId: unknown; quantity: number }[] = [];

  for (const item of items) {
    const result = await ProductModel.updateOne(
      { _id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );
    if (result.modifiedCount === 1) {
      applied.push(item);
    } else {
      for (const done of applied) {
        await ProductModel.updateOne({ _id: done.productId }, { $inc: { stock: done.quantity } });
      }
      const product = await ProductModel.findById(item.productId).select("name stock");
      return { success: false as const, productName: product?.name || "An item" };
    }
  }

  return { success: true as const };
}

async function restoreStock(items: { productId: unknown; quantity: number }[]) {
  for (const item of items) {
    await ProductModel.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
  }
}

export async function createCodOrder(userId: string, addressId: string) {
  await connectDB();
  const draft = await buildOrderDraft(userId, addressId);

  const settings = await SettingsModel.findOne({ key: "singleton" }).lean();
  if (settings && !settings.codEnabled) throw new ApiError("Cash on Delivery is currently unavailable.", 400);
  if (settings?.codMaxOrderAmount && draft.total > settings.codMaxOrderAmount) {
    throw new ApiError(`Cash on Delivery is available for orders up to ₹${settings.codMaxOrderAmount}.`, 400);
  }

  const stockResult = await atomicDecrementStock(draft.items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
  if (!stockResult.success) {
    throw new ApiError(`${stockResult.productName} just went out of stock. Please update your cart.`, 409);
  }

  const order = await OrderModel.create({
    orderNumber: generateOrderNumber(),
    userId,
    ...draft,
    paymentMethod: "COD",
    paymentStatus: "PENDING",
    orderStatus: "CONFIRMED",
    timeline: [
      { status: "PENDING", at: new Date() },
      { status: "CONFIRMED", at: new Date(), note: "Order confirmed — pay on delivery" },
    ],
    deliveryEstimate: "3-5 business days",
  });

  await PaymentModel.create({ orderId: order._id, userId, amount: draft.total, method: "COD", status: "PENDING" });
  if (draft.couponCode) await incrementCouponUsage(draft.couponCode);
  await clearCart({ userId, guestId: null });

  return order;
}

export async function createPendingRazorpayOrder(userId: string, addressId: string) {
  await connectDB();
  const draft = await buildOrderDraft(userId, addressId);

  const settings = await SettingsModel.findOne({ key: "singleton" }).lean();
  if (settings && !settings.razorpayEnabled) throw new ApiError("Online payment is currently unavailable.", 400);

  const order = await OrderModel.create({
    orderNumber: generateOrderNumber(),
    userId,
    ...draft,
    paymentMethod: "RAZORPAY",
    paymentStatus: "PENDING",
    orderStatus: "PENDING",
    timeline: [{ status: "PENDING", at: new Date() }],
    deliveryEstimate: "3-5 business days",
  });

  return order;
}

const RETRYABLE_ORDER_STATUSES = ["PENDING", "PAYMENT_FAILED"];

export async function prepareRazorpayRetry(userId: string, orderId: string) {
  await connectDB();
  const order = await OrderModel.findOne({ _id: orderId, userId });
  if (!order) throw new ApiError("Order not found.", 404);

  if (order.paymentMethod !== "RAZORPAY") throw new ApiError("This order was not placed with online payment.", 400);
  if (order.paymentStatus === "PAID") throw new ApiError("This order has already been paid for.", 400);
  if (!RETRYABLE_ORDER_STATUSES.includes(order.orderStatus)) {
    throw new ApiError(`This order can no longer be paid online (already ${order.orderStatus.toLowerCase()}).`, 400);
  }

  for (const item of order.items) {
    const product = await ProductModel.findById(item.productId).select("name stock status");
    if (!product || product.status !== "ACTIVE" || product.stock < item.quantity) {
      throw new ApiError(
        `${product?.name || "An item"} in this order is no longer available in the required quantity. Please cancel this order and place a new one.`,
        409
      );
    }
  }

  order.paymentStatus = "PENDING";
  if (order.orderStatus === "PAYMENT_FAILED") {
    order.orderStatus = "PENDING";
    order.timeline.push({ status: "PENDING", at: new Date(), note: "Retrying payment" });
  }
  await order.save();

  return order;
}

export async function attachRazorpayOrderId(orderId: string, razorpayOrderId: string) {
  await connectDB();
  await OrderModel.findByIdAndUpdate(orderId, { razorpayOrderId });
}

export async function markOrderPaymentFailed(orderId: string, reason: string) {
  await connectDB();
  await OrderModel.findByIdAndUpdate(orderId, {
    paymentStatus: "FAILED",
    orderStatus: "PAYMENT_FAILED",
    $push: { timeline: { status: "PAYMENT_FAILED", at: new Date(), note: reason } },
  });
}

export async function confirmRazorpayOrderPayment(order: Order & { _id: string }, razorpayPaymentId: string, razorpaySignature: string, razorpayOrderId: string) {
  await connectDB();

  const stockResult = await atomicDecrementStock(order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
  if (!stockResult.success) {
    console.warn(`[razorpay] Stock shortfall confirming paid order ${order.orderNumber}: ${stockResult.productName}`);
  }

  await OrderModel.findByIdAndUpdate(order._id, {
    paymentStatus: "PAID",
    orderStatus: "CONFIRMED",
    razorpayOrderId,
    razorpayPaymentId,
    $push: { timeline: { status: "CONFIRMED", at: new Date(), note: "Payment received via Razorpay" } },
  });

  await PaymentModel.create({
    orderId: order._id,
    userId: order.userId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    amount: order.total,
    method: "RAZORPAY",
    status: "PAID",
  });

  if (order.couponCode) await incrementCouponUsage(order.couponCode);
  await clearCart({ userId: order.userId.toString(), guestId: null });
}

export async function getOrderById(userId: string, orderId: string, isAdmin = false) {
  await connectDB();
  const filter = isAdmin ? { _id: orderId } : { _id: orderId, userId };
  const order = await OrderModel.findOne(filter).lean();
  if (!order) throw new ApiError("Order not found.", 404);
  return order;
}

export async function listUserOrders(userId: string, status?: string) {
  await connectDB();
  const filter: Record<string, unknown> = { userId };
  if (status && status !== "all") filter.orderStatus = status;
  return OrderModel.find(filter).sort({ createdAt: -1 }).lean();
}

const CANCELLABLE_BEFORE = ["PENDING", "CONFIRMED", "PROCESSING"];

export async function cancelOrder(userId: string, orderId: string, reason: string, isAdmin = false) {
  await connectDB();
  const settings = await SettingsModel.findOne({ key: "singleton" }).lean();
  const cutoffStatus = settings?.cancellationWindowStatus || "PACKED";
  const cutoffIndex = ORDER_STATUSES.indexOf(cutoffStatus as (typeof ORDER_STATUSES)[number]);

  const filter = isAdmin ? { _id: orderId } : { _id: orderId, userId };
  const order = await OrderModel.findOne(filter);
  if (!order) throw new ApiError("Order not found.", 404);

  const currentIndex = ORDER_STATUSES.indexOf(order.orderStatus as (typeof ORDER_STATUSES)[number]);
  if (!isAdmin && !CANCELLABLE_BEFORE.includes(order.orderStatus) && currentIndex >= cutoffIndex) {
    throw new ApiError(`This order can no longer be cancelled (already ${order.orderStatus.toLowerCase()}).`, 400);
  }
  if (["DELIVERED", "CANCELLED"].includes(order.orderStatus)) {
    throw new ApiError(`This order is already ${order.orderStatus.toLowerCase()}.`, 400);
  }

  if (!order.stockRestored) {
    await restoreStock(order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
    order.stockRestored = true;
  }

  order.orderStatus = "CANCELLED";
  order.cancelledAt = new Date();
  order.cancellationReason = reason;
  order.timeline.push({ status: "CANCELLED", at: new Date(), note: reason });

  if (order.paymentStatus === "PAID") order.paymentStatus = "REFUNDED";

  await order.save();
  return order;
}

export async function updateOrderStatus(orderId: string, status: (typeof ORDER_STATUSES)[number], note?: string) {
  await connectDB();
  const order = await OrderModel.findById(orderId);
  if (!order) throw new ApiError("Order not found.", 404);

  order.orderStatus = status;
  order.timeline.push({ status, at: new Date(), note });

  // Cash is collected at the door, so a delivered COD order is now paid in full.
  if (status === "DELIVERED" && order.paymentMethod === "COD" && order.paymentStatus === "PENDING") {
    order.paymentStatus = "PAID";
    await PaymentModel.updateOne({ orderId: order._id, method: "COD" }, { status: "PAID" });
  }

  await order.save();
  return order;
}

export async function listAllOrdersForAdmin(filters: { status?: string; paymentMethod?: string; q?: string } = {}) {
  await connectDB();
  const query: Record<string, unknown> = {};
  if (filters.status && filters.status !== "all") query.orderStatus = filters.status;
  if (filters.paymentMethod && filters.paymentMethod !== "all") query.paymentMethod = filters.paymentMethod;
  if (filters.q) query.orderNumber = { $regex: filters.q, $options: "i" };

  return OrderModel.find(query).sort({ createdAt: -1 }).populate("userId", "name email").lean();
}
