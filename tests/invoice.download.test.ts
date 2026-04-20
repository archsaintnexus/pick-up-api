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
import Invoice from "../models/invoiceModel.js";

describe("Download Invoice", () => {
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

  it("should download invoice", async () => {
    const res = await request(app).get(
      `/api/v1/invoices/shipments/${shipmentId}/download`
    );

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/pdf");

    const invoices = await Invoice.find({ shipment: shipmentId });
    expect(invoices.length).toBe(1);
  });
});