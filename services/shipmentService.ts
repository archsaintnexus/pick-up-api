import Shipment from "../models/shipmentModel.js";
import User from "../models/userModel.js";
import ErrorClass from "../utils/ErrorClass.js";
import { generateShipmentId } from "../utils/shipmentId.js";

type PickupInput = {
  user: string;
  pickupAddress: string;
  dropoffAddress: string;
  packageType: string;
  weight: number;
  currency?: string;
};

type BulkPickupInput = {
  user: string;
  pickups: Omit<PickupInput, "user">[];
};

const BASE_PRICE = 2500;
const WEIGHT_RATE = 400;

const PACKAGE_MULTIPLIER: Record<string, number> = {
  document: 1,
  parcel: 1.15,
  fragile: 1.35,
  electronics: 1.5,
  bulk: 1.75,
};

export const estimatedShipmentPrice = (
  weight: number,
  packageType: string,
): number => {
  const key = packageType.trim().toLowerCase();
  const multiplier = PACKAGE_MULTIPLIER[key] ?? 1.2;
  return Math.round((BASE_PRICE + weight * WEIGHT_RATE) * multiplier);
};

export const createSinglePickup = async (payload: PickupInput) => {
  const user = await User.findById(payload.user);
  if (!user) {
    throw new ErrorClass("User not found", 404);
  }

  if (user.role === "driver") {
    throw new ErrorClass("Drivers cannot create pickups", 403);
  }

  if (user.role === "customer") {
    const existingPickup = await Shipment.findOne({
      user: payload.user,
      status: { $in: ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT"] },
    });

    if (existingPickup) {
      throw new ErrorClass("You already have an active pickup", 409);
    }
  }
  const shipment = await Shipment.create({
    shipmentCode: generateShipmentId(),
    user: payload.user,
    pickupAddress: payload.pickupAddress.trim(),
    dropoffAddress: payload.dropoffAddress.trim(),
    packageType: payload.packageType.trim(),
    weight: payload.weight,
    currency: payload.currency ?? "NGN",
    price: estimatedShipmentPrice(payload.weight, payload.packageType),
  });
  return shipment;
};

export const createBulkPickup = async (payload: BulkPickupInput) => {
  const { user, pickups } = payload;
  const foundUser = await User.findById(user);

  if (!foundUser) {
    throw new ErrorClass("User not found", 404);
  }

  if (foundUser.role !== "business" && foundUser.role !== "admin") {
    throw new ErrorClass(
      "Bulk pickup is only allowed for business accounts",
      403,
    );
  }
  const shipments = pickups.map((pickup) => ({
    shipmentCode: generateShipmentId(),
    user,
    pickupAddress: pickup.pickupAddress.trim(),
    dropoffAddress: pickup.dropoffAddress.trim(),
    packageType: pickup.packageType.trim(),
    weight: pickup.weight,
    currency: pickup.currency ?? "NGN",
    price: estimatedShipmentPrice(pickup.weight, pickup.packageType),
  }));

  const createShipments = await Shipment.insertMany(shipments);

  const totalPrice = createShipments.reduce(
    (sum, shipment) => sum + shipment.price,
    0,
  );
  return { shipments: createShipments, totalPrice };
};
