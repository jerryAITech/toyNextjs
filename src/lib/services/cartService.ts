import { connectDB } from "@/lib/db/connect";
import { CartModel, type Cart } from "@/lib/models/Cart";
import { ProductModel } from "@/lib/models/Product";
import { ApiError } from "@/lib/utils/response";
import { validateAndApplyCoupon, computeCouponDiscount, type CartLineForCoupon } from "@/lib/services/couponService";
import { CouponModel } from "@/lib/models/Coupon";
import { SettingsModel } from "@/lib/models/Settings";
import type { HydratedDocument } from "mongoose";

type Owner = { userId: string | null; guestId: string | null };

async function getOrCreateCart(owner: Owner): Promise<HydratedDocument<Cart>> {
  await connectDB();
  const filter = owner.userId ? { ownerType: "USER", userId: owner.userId } : { ownerType: "GUEST", guestId: owner.guestId };
  let cart = await CartModel.findOne(filter);
  if (!cart) {
    cart = await CartModel.create({ ...filter, items: [] });
  }
  return cart;
}

export type CartLineView = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  brand: string;
  price: number;
  mrp: number;
  discountPercent: number;
  quantity: number;
  stock: number;
  isActive: boolean;
  lineTotal: number;
  unavailable: boolean;
};

export type CartView = {
  items: CartLineView[];
  removedItems: string[];
  subtotal: number;
  productDiscount: number;
  couponCode: string | null;
  couponDiscount: number;
  shipping: number;
  total: number;
  itemCount: number;
};

async function hydrateCart(cart: HydratedDocument<Cart>): Promise<CartView> {
  const productIds = cart.items.map((i) => i.productId);
  const products = await ProductModel.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const removedItems: string[] = [];
  const items: CartLineView[] = [];
  let mutated = false;

  for (const item of cart.items) {
    const product = productMap.get(item.productId.toString());
    if (!product) {
      removedItems.push(item.productId.toString());
      mutated = true;
      continue;
    }

    const unavailable = product.status !== "ACTIVE" || product.stock <= 0;

    if (!unavailable && item.quantity > product.stock) {
      item.quantity = product.stock;
      mutated = true;
    }

    items.push({
      productId: product._id.toString(),
      name: product.name,
      slug: product.slug,
      image: product.images[0] || "",
      brand: product.brand || "",
      price: product.price,
      mrp: product.mrp,
      discountPercent: product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0,
      quantity: item.quantity,
      stock: product.stock,
      isActive: product.status === "ACTIVE",
      lineTotal: product.price * item.quantity,
      unavailable,
    });
  }

  if (removedItems.length > 0) {
    cart.items = cart.items.filter((i) => !removedItems.includes(i.productId.toString())) as typeof cart.items;
    mutated = true;
  }

  if (mutated) await cart.save();

  const availableItems = items.filter((i) => !i.unavailable);
  const subtotal = availableItems.reduce((s, i) => s + i.lineTotal, 0);
  const productDiscount = availableItems.reduce((s, i) => s + (i.mrp - i.price) * i.quantity, 0);

  let couponDiscount = 0;
  let couponCode = cart.couponCode ?? null;

  if (couponCode) {
    try {
      const lines: CartLineForCoupon[] = availableItems.map((i) => {
        const product = productMap.get(i.productId)!;
        return { productId: i.productId, categoryId: product.category.toString(), price: i.price, quantity: i.quantity };
      });
      const result = await validateAndApplyCoupon(couponCode, cart.userId?.toString() ?? null, lines, subtotal);
      couponDiscount = result.discount;
    } catch {
      couponCode = null;
      cart.couponCode = null;
      await cart.save();
    }
  }

  const settings = await SettingsModel.findOne({ key: "singleton" }).lean();
  const shippingFee = settings?.shippingFee ?? 49;
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 999;
  const shipping = availableItems.length === 0 || subtotal - couponDiscount >= freeShippingThreshold ? 0 : shippingFee;

  const total = Math.max(0, subtotal - couponDiscount) + shipping;

  return {
    items,
    removedItems,
    subtotal,
    productDiscount,
    couponCode,
    couponDiscount,
    shipping,
    total,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
  };
}

export async function getCart(owner: Owner) {
  const cart = await getOrCreateCart(owner);
  return hydrateCart(cart);
}

export async function addToCart(owner: Owner, productId: string, quantity: number) {
  await connectDB();
  const product = await ProductModel.findById(productId);
  if (!product || product.status !== "ACTIVE") throw new ApiError("This product is not available.", 404);
  if (product.stock < quantity) throw new ApiError(`Only ${product.stock} left in stock.`, 409);

  const cart = await getOrCreateCart(owner);
  const existing = cart.items.find((i) => i.productId.toString() === productId);
  const nextQuantity = (existing?.quantity ?? 0) + quantity;

  if (nextQuantity > product.stock) throw new ApiError(`Only ${product.stock} left in stock.`, 409);

  if (existing) existing.quantity = nextQuantity;
  else cart.items.push({ productId: product._id, quantity });

  await cart.save();
  return hydrateCart(cart);
}

export async function updateCartItem(owner: Owner, productId: string, quantity: number) {
  await connectDB();
  const cart = await getOrCreateCart(owner);
  const item = cart.items.find((i) => i.productId.toString() === productId);
  if (!item) throw new ApiError("Item not found in cart.", 404);

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.productId.toString() !== productId) as typeof cart.items;
  } else {
    const product = await ProductModel.findById(productId);
    if (!product) throw new ApiError("Product not found.", 404);
    if (quantity > product.stock) throw new ApiError(`Only ${product.stock} left in stock.`, 409);
    item.quantity = quantity;
  }

  await cart.save();
  return hydrateCart(cart);
}

export async function removeFromCart(owner: Owner, productId: string) {
  await connectDB();
  const cart = await getOrCreateCart(owner);
  cart.items = cart.items.filter((i) => i.productId.toString() !== productId) as typeof cart.items;
  await cart.save();
  return hydrateCart(cart);
}

export async function applyCouponToCart(owner: Owner, code: string) {
  await connectDB();
  const cart = await getOrCreateCart(owner);
  if (cart.items.length === 0) throw new ApiError("Your cart is empty.", 400);

  const view = await hydrateCart(cart);
  const availableItems = view.items.filter((i) => !i.unavailable);
  const productIds = availableItems.map((i) => i.productId);
  const products = await ProductModel.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const lines: CartLineForCoupon[] = availableItems.map((i) => ({
    productId: i.productId,
    categoryId: productMap.get(i.productId)!.category.toString(),
    price: i.price,
    quantity: i.quantity,
  }));

  await validateAndApplyCoupon(code, cart.userId?.toString() ?? null, lines, view.subtotal);

  cart.couponCode = code.trim().toUpperCase();
  await cart.save();
  return hydrateCart(cart);
}

export type ApplicableCoupon = {
  code: string;
  description: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minimumCartValue: number;
  discount: number;
};

export async function getApplicableCoupons(owner: Owner): Promise<ApplicableCoupon[]> {
  await connectDB();
  const cart = await getOrCreateCart(owner);
  if (cart.items.length === 0) return [];

  const view = await hydrateCart(cart);
  const availableItems = view.items.filter((i) => !i.unavailable);
  if (availableItems.length === 0) return [];

  const productIds = availableItems.map((i) => i.productId);
  const products = await ProductModel.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const lines: CartLineForCoupon[] = availableItems.map((i) => ({
    productId: i.productId,
    categoryId: productMap.get(i.productId)!.category.toString(),
    price: i.price,
    quantity: i.quantity,
  }));

  const now = new Date();
  const coupons = await CouponModel.find({
    status: "ACTIVE",
    minimumCartValue: { $lte: view.subtotal },
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ],
  }).lean();

  const results: ApplicableCoupon[] = [];
  for (const coupon of coupons) {
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) continue;
    if (coupon.code === view.couponCode) continue;

    const discount = computeCouponDiscount(coupon, lines);
    if (discount <= 0) continue;

    results.push({
      code: coupon.code,
      description: coupon.description || "",
      type: coupon.type,
      value: coupon.value,
      minimumCartValue: coupon.minimumCartValue,
      discount,
    });
  }

  return results.sort((a, b) => b.discount - a.discount);
}

export async function removeCouponFromCart(owner: Owner) {
  await connectDB();
  const cart = await getOrCreateCart(owner);
  cart.couponCode = null;
  await cart.save();
  return hydrateCart(cart);
}

export async function clearCart(owner: Owner) {
  await connectDB();
  const cart = await getOrCreateCart(owner);
  cart.items = [] as unknown as typeof cart.items;
  cart.couponCode = null;
  await cart.save();
}
