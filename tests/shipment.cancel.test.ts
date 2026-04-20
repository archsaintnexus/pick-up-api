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

describe("Cancel Shipment", () => {
  let shipmentId: string;

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

    const shipment = await Shipment.create({
      shipmentCode: `PU-${Date.now()}`,
      user: TEST_USER_ID,
      status: "PENDING",
      pickupAddress: "Ikeja",
      dropoffAddress: "Lekki",
      packageType: "Documents",
      weight: 2,
      price: 5000,
      currency: "NGN",
    });

    shipmentId = String(shipment._id);
  });

  it("should cancel shipment", async () => {
    const res = await request(app)
      .patch(`/api/v1/shipments/${shipmentId}/cancel`)
      .send({ reason: "Changed mind" });

    expect(res.status).toBe(200);
    expect(res.body.data.shipment.status).toBe("CANCELLED");
  });
});