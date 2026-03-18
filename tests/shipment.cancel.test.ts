process.env.NODE_ENV = "test";
process.env.RESEND_API_KEY = "test-key";
process.env.RESEND_FROM_EMAIL = "test@example.com";

import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";
import User from "../models/userModel.js";
import Shipment from "../models/shipmentModel.js";

describe("Cancel Shipment Endpoint", () => {
  let userId: string;
  let shipmentId: string;

  beforeAll(async () => {
    await connectTestDB();
  },30000);

  afterAll(async () => {
    await closeTestDB();
  },30000);

  afterEach(async () => {
    await clearTestDB();
  },30000);

  beforeEach(async () => {
    const user = await User.create({
      fullName: "Wisdom Shaibu",
      email: "wisdom@test.com",
      password: "examplepassword",
      confirmPassword: "examplepassword",
      phoneNumber: "+2347065183062",
      role: "customer",
    });

    userId = String(user._id);

    const shipment = await Shipment.create({
      shipmentCode: `PU-${Date.now()}`,
      user: new mongoose.Types.ObjectId(userId),
      status: "PENDING",
      pickupAddress: "12 Allen Avenue, Ikeja",
      dropoffAddress: "45 Admiralty Way, Lekki",
      packageType: "Documents",
      weight: 2,
      price: 5000,
      currency: "NGN",
    });

    shipmentId = String(shipment._id);
  });

  it("should cancel a shipment successfully", async () => {
    const response = await request(app)
      .patch(`/api/v1/shipments/${shipmentId}/cancel`)
      .send({
        reason: "Customer changed mind",
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.shipment.status).toBe("CANCELLED");
    expect(response.body.data.shipment.cancelReason).toBe("Customer changed mind");
  });

  it("should fail if shipment is already cancelled", async () => {
    await Shipment.findByIdAndUpdate(shipmentId, {
      status: "CANCELLED",
      cancelReason: "Already cancelled",
      cancelledAt: new Date(),
    });

    const response = await request(app)
      .patch(`/api/v1/shipments/${shipmentId}/cancel`)
      .send({
        reason: "Customer changed mind",
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Shipment cannot be cancelled at this stage");
  });

  it("should fail if shipment does not exist", async () => {
    const fakeShipmentId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .patch(`/api/v1/shipments/${fakeShipmentId}/cancel`)
      .send({
        reason: "Customer changed mind",
      });

    expect(response.status).toBe(404);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Shipment not found");
  });
});