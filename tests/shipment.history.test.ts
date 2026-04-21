process.env.NODE_ENV = "test";

import request from "supertest";
import app from "../app.js";
import {
  connectTestDB,
  closeTestDB,
  clearTestDB,
  TEST_USER_ID,
} from "./setup.js";
import User from "../models/userModel.js";
import Shipment from "../models/shipmentModel.js";

describe("Shipment History", () => {
  beforeAll(connectTestDB);
  afterAll(closeTestDB);
  afterEach(clearTestDB);

  beforeEach(async () => {
    await User.create({
      _id: TEST_USER_ID,
      fullName: "Wisdom Shaibu",
      email: "wisdom@test.com",
      password: "examplepassword",
      confirmPassword: "examplepassword",
      phoneNumber: "+2347065183062",
      role: "customer",
    });

    const shipmentBase = {
      user: TEST_USER_ID,
      pickupAddress: "Ikeja",
      dropoffAddress: "Lekki",
      packageType: "Documents",
      weight: 2,
      price: 5000,
      currency: "NGN",
      vehicleType: "car",
      recipientName: "Jane Doe",
      recipientPhone: "+2348012345678",
      pickupDate: new Date(Date.now() + 86400000),
      timeWindow: "9:00 AM - 12:00 PM",
    };

    await Shipment.create([
      { ...shipmentBase, shipmentCode: "PU-1", status: "PENDING" },
      { ...shipmentBase, shipmentCode: "PU-2", status: "CANCELLED" },
    ]);
  });

  it("should fetch history", async () => {
    const res = await request(app).get(
      `/api/v1/shipments/history/${TEST_USER_ID}`
    );

    expect(res.status).toBe(200);
    expect(res.body.data.shipments.length).toBe(2);
  });
});