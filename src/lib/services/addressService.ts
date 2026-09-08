import { connectDB } from "@/lib/db/connect";
import { AddressModel } from "@/lib/models/Address";
import { ApiError } from "@/lib/utils/response";
import type { AddressInput } from "@/lib/validation/address";

export async function listAddresses(userId: string) {
  await connectDB();
  return AddressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
}

export async function getAddress(userId: string, id: string) {
  await connectDB();
  const address = await AddressModel.findOne({ _id: id, userId });
  if (!address) throw new ApiError("Address not found.", 404);
  return address;
}

export async function createAddress(userId: string, input: AddressInput) {
  await connectDB();
  const count = await AddressModel.countDocuments({ userId });
  const isDefault = input.isDefault || count === 0;

  if (isDefault) await AddressModel.updateMany({ userId }, { isDefault: false });

  return AddressModel.create({ ...input, userId, isDefault });
}

export async function updateAddress(userId: string, id: string, input: Partial<AddressInput>) {
  await connectDB();
  const address = await AddressModel.findOne({ _id: id, userId });
  if (!address) throw new ApiError("Address not found.", 404);

  if (input.isDefault) await AddressModel.updateMany({ userId }, { isDefault: false });

  Object.assign(address, input);
  await address.save();
  return address;
}

export async function deleteAddress(userId: string, id: string) {
  await connectDB();
  const address = await AddressModel.findOneAndDelete({ _id: id, userId });
  if (!address) throw new ApiError("Address not found.", 404);

  if (address.isDefault) {
    const next = await AddressModel.findOne({ userId }).sort({ createdAt: -1 });
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }
}

export async function setDefaultAddress(userId: string, id: string) {
  await connectDB();
  const address = await AddressModel.findOne({ _id: id, userId });
  if (!address) throw new ApiError("Address not found.", 404);

  await AddressModel.updateMany({ userId }, { isDefault: false });
  address.isDefault = true;
  await address.save();
  return address;
}
