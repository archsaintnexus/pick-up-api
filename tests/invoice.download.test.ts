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

describe("Download Invoice Endpoint", () => {
  let shipmentId: string;

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
  });

  it("should download the invoice as a PDF", async () => {
    const response = await request(app).get(
      `/api/v1/invoices/shipments/${shipmentId}/download`
    );

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/pdf");
    expect(response.headers["content-disposition"]).toContain("attachment;");
    expect(response.headers["content-disposition"]).toContain("invoice-INV-");
    expect(response.body).toBeInstanceOf(Buffer);

    const invoices = await Invoice.find({ shipment: shipmentId });
    expect(invoices.length).toBe(1);
  });

  it("should reuse the same invoice on repeated download", async () => {
    const firstResponse = await request(app).get(
      `/api/v1/invoices/shipments/${shipmentId}/download`
    );
    const secondResponse = await request(app).get(
      `/api/v1/invoices/shipments/${shipmentId}/download`
    );

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);

    const invoices = await Invoice.find({ shipment: shipmentId });
    expect(invoices.length).toBe(1);
  });

  it("should reject an invalid shipment id", async () => {
    const response = await request(app).get(
      "/api/v1/invoices/shipments/not-a-valid-id/download"
    );

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Invalid shipment ID");
  });
});
