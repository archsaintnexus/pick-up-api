process.env.NODE_ENV = "test";
process.env.RESEND_API_KEY = "test-key";
process.env.RESEND_FROM_EMAIL = "test@example.com";

import request from "supertest";
import { jest } from "@jest/globals";
import app from "../app.js";
import mongoose from "mongoose";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";
import User from "../models/userModel.js";
import Shipment from "../models/shipmentModel.js";

jest.setTimeout(40000);

describe("Create Shipment Endpoint", () => {
  let userId: string;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  beforeEach(async () => {
    const user = await User.create({
      fullName: "Wisdom Shaibu",
      email: "wisdom@test.com",
      password: "examplepassword",
      role: "customer",
    });

    userId = String(user._id);
  });

  it("should create a shipment successfully", async () => {
    const pickupWindowStart = "2026-03-20T09:00:00.000Z";
    const pickupWindowEnd = "2026-03-20T12:00:00.000Z";

    const response = await request(app).post("/api/v1/shipments").send({
      userId,
      pickupAddress: "12 Allen Avenue, Ikeja",
      dropoffAddress: "45 Admiralty Way, Lekki",
      packageType: "Documents",
      pickupWindowStart,
      pickupWindowEnd,
      weight: 2,
      price: 5000,
    });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.data.shipment).toBeDefined();
    expect(response.body.data.shipment.shipmentCode).toMatch(/^PU-/);
    expect(response.body.data.shipment.status).toBe("PENDING");
    expect(response.body.data.shipment.currency).toBe("NGN");
    expect(response.body.data.shipment.user).toBe(userId);
    expect(response.body.data.shipment.pickupWindowStart).toBe(
      pickupWindowStart
    );
    expect(response.body.data.shipment.pickupWindowEnd).toBe(pickupWindowEnd);

    const savedShipment = await Shipment.findById(response.body.data.shipment._id);
    expect(savedShipment).not.toBeNull();
    expect(savedShipment?.pickupAddress).toBe("12 Allen Avenue, Ikeja");
  });

  it("should reject an invalid payload", async () => {
    const response = await request(app).post("/api/v1/shipments").send({
      userId,
      pickupAddress: "12 Allen Avenue, Ikeja",
      packageType: "Documents",
      weight: 2,
      price: 5000,
    });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toContain("dropoffAddress");
  });

  it("should reject incomplete pickup window fields", async () => {
    const response = await request(app).post("/api/v1/shipments").send({
      userId,
      pickupAddress: "12 Allen Avenue, Ikeja",
      dropoffAddress: "45 Admiralty Way, Lekki",
      packageType: "Documents",
      pickupWindowStart: "2026-03-20T09:00:00.000Z",
      weight: 2,
      price: 5000,
    });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe(
      "pickupWindowStart and pickupWindowEnd must both be provided together"
    );
  });

  it("should return 404 when the user does not exist", async () => {
    const response = await request(app).post("/api/v1/shipments").send({
      userId: new mongoose.Types.ObjectId().toString(),
      pickupAddress: "12 Allen Avenue, Ikeja",
      dropoffAddress: "45 Admiralty Way, Lekki",
      packageType: "Documents",
      weight: 2,
      price: 5000,
    });

    expect(response.status).toBe(404);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("User not found");
  });
});
