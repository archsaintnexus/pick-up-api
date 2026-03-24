process.env.NODE_ENV = "test";
process.env.RESEND_API_KEY = "test-key";
process.env.RESEND_FROM_EMAIL = "test@example.com";

import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";
import User from "../models/userModel.js";
import Shipment from "../models/shipmentModel.js";

describe("Shipment History Endpoint", () => {
  let userId: string;

  beforeAll(async () => {
    await connectTestDB();
  },60000);

  afterAll(async () => {
    await closeTestDB();
  },60000);

  afterEach(async () => {
    await clearTestDB();
  },60000);

  beforeEach(async () => {
    const user = await User.create({
      fullName: "Wisdom Shaibu",
      email: "wisdom@test.com",
      password: "Password1",
      confirmPassword: "examplepassword",
      phoneNumber: "+2347065183062",
      role: "customer",
    });

    userId = String(user._id);

    await Shipment.create([
      {
        shipmentCode: "PU-1001",
        user: new mongoose.Types.ObjectId(userId),
        status: "PENDING",
        pickupAddress: "Ikeja",
        dropoffAddress: "Lekki",
        packageType: "Documents",
        weight: 1,
        price: 2000,
        currency: "NGN",
      },
      {
        shipmentCode: "PU-1002",
        user: new mongoose.Types.ObjectId(userId),
        status: "ASSIGNED",
        pickupAddress: "Yaba",
        dropoffAddress: "Victoria Island",
        packageType: "Electronics",
        weight: 3,
        price: 5000,
        currency: "NGN",
      },
      {
        shipmentCode: "PU-1003",
        user: new mongoose.Types.ObjectId(userId),
        status: "CANCELLED",
        pickupAddress: "Ajah",
        dropoffAddress: "Surulere",
        packageType: "Clothes",
        weight: 2,
        price: 3500,
        currency: "NGN",
      },
    ]);
  });

  it("should return shipment history for a user", async () => {
    const response = await request(app).get(
      `/api/v1/shipments/history/${userId}`
    );

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.shipments.length).toBe(3);
    expect(response.body.data.total).toBe(3);
  });

  it("should filter shipments by status", async () => {
    const response = await request(app).get(
      `/api/v1/shipments/history/${userId}?status=CANCELLED`
    );

    expect(response.status).toBe(200);
    expect(response.body.data.shipments.length).toBe(1);
    expect(response.body.data.shipments[0].status).toBe("CANCELLED");
  });

  it("should support pagination", async () => {
    const response = await request(app).get(
      `/api/v1/shipments/history/${userId}?page=1&limit=2`
    );

    expect(response.status).toBe(200);
    expect(response.body.data.shipments.length).toBe(2);
    expect(response.body.data.total).toBe(3);
  });

  it("should return empty array if user has no shipments", async () => {
    const newUser = await User.create({
      fullName: "Another User",
      email: "another@test.com",
      password: "examplepassword",
      confirmPassword: "examplepassword",
      phoneNumber: "+2347065183062",
      role: "customer",
    });

    const response = await request(app).get(
      `/api/v1/shipments/history/${newUser._id}`
    );

    expect(response.status).toBe(200);
    expect(response.body.data.shipments.length).toBe(0);
  });
});