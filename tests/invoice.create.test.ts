process.env.NODE_ENV = "test";
process.env.RESEND_API_KEY = "test-key";
process.env.RESEND_FROM_EMAIL = "test@example.com";

import { jest } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";
import User from "../models/userModel.js";
import Shipment from "../models/shipmentModel.js";
import Invoice from "../models/invoiceModel.js";

jest.setTimeout(40000);

describe("Create Invoice Endpoint", () => {
  let shipmentId: string;
  let shipmentCode: string;

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
      password: "examplepassword",
      confirmPassword: "examplepassword",
      phoneNumber: "+2347065183062",
      role: "customer",
    });

    const shipment = await Shipment.create({
      shipmentCode: `PU-${Date.now()}`,
      user: new mongoose.Types.ObjectId(String(user._id)),
      status: "PENDING",
      pickupAddress: "12 Allen Avenue, Ikeja",
      dropoffAddress: "45 Admiralty Way, Lekki",
      packageType: "Documents",
      weight: 2,
      price: 5000,
      currency: "NGN",
      invoiceGenerated: false,
      invoiceNumber: null,
    });

    shipmentId = String(shipment._id);
    shipmentCode = shipment.shipmentCode;
  });

  it("should create an invoice successfully", async () => {
    const response = await request(app).post(
      `/api/v1/invoices/shipments/${shipmentId}`
    );

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.data.invoice.invoiceNumber).toBe(`INV-${shipmentCode}`);
    expect(response.body.data.invoice.amount).toBe(5000);

    const invoice = await Invoice.findOne({ shipment: shipmentId });
    expect(invoice).not.toBeNull();
    expect(invoice?.customerSnapshot).toMatchObject({
      fullName: "Wisdom Shaibu",
      email: "wisdom@test.com",
    });
  });

  it("should return the existing invoice without duplication", async () => {
    const firstResponse = await request(app).post(
      `/api/v1/invoices/shipments/${shipmentId}`
    );
    const secondResponse = await request(app).post(
      `/api/v1/invoices/shipments/${shipmentId}`
    );

    expect(firstResponse.status).toBe(201);
    expect(secondResponse.status).toBe(200);
    expect(secondResponse.body.data.invoice.invoiceNumber).toBe(
      firstResponse.body.data.invoice.invoiceNumber
    );

    const invoices = await Invoice.find({ shipment: shipmentId });
    expect(invoices.length).toBe(1);
  });

  it("should reject an invalid shipment id", async () => {
    const response = await request(app).post(
      "/api/v1/invoices/shipments/not-a-valid-id"
    );

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Invalid shipment ID");
  });
});
