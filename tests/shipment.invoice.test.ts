process.env.NODE_ENV = "test";
process.env.RESEND_API_KEY = "test-key";
process.env.RESEND_FROM_EMAIL = "test@example.com";

import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";
import User from "../models/userModel.js";
import Shipment from "../models/shipmentModel.js";
import Invoice from "../models/invoiceModel.js";

describe("Generate Invoice Endpoint", () => {
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
      invoiceGenerated: false,
      invoiceNumber: null,
    });

    shipmentId = String(shipment._id);
  });

  it("should generate an invoice successfully", async () => {
    const response = await request(app).get(
      `/api/v1/shipments/${shipmentId}/invoice`
    );

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.invoice).toBeDefined();
    expect(response.body.data.invoice.invoiceNumber).toBeDefined();
    expect(response.body.data.invoice.amount).toBe(5000);
    expect(response.body.data.invoice.currency).toBe("NGN");

    const updatedShipment = await Shipment.findById(shipmentId);
    expect(updatedShipment).not.toBeNull();
    expect(updatedShipment?.invoiceGenerated).toBe(true);
    expect(updatedShipment?.invoiceNumber).toBeDefined();

    const savedInvoice = await Invoice.findOne({ shipment: shipmentId });
    expect(savedInvoice).not.toBeNull();
    expect(savedInvoice?.invoiceNumber).toBeDefined();
    expect(savedInvoice?.customerSnapshot).toMatchObject({
      fullName: "Wisdom Shaibu",
      email: "wisdom@test.com",
      companyName: null,
      companyAddress: null,
    });
    expect(savedInvoice?.shipmentSnapshot).toMatchObject({
      shipmentCode: updatedShipment?.shipmentCode,
      pickupAddress: "12 Allen Avenue, Ikeja",
      dropoffAddress: "45 Admiralty Way, Lekki",
      packageType: "Documents",
      weight: 2,
    });
  });

  it("should return the existing invoice if already generated", async () => {
    const firstResponse = await request(app).get(
      `/api/v1/shipments/${shipmentId}/invoice`
    );

    const secondResponse = await request(app).get(
      `/api/v1/shipments/${shipmentId}/invoice`
    );

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);

    expect(secondResponse.body.data.invoice.invoiceNumber).toBe(
      firstResponse.body.data.invoice.invoiceNumber
    );

    const invoices = await Invoice.find({ shipment: shipmentId });
    expect(invoices.length).toBe(1);
  });

  it("should fail if shipment does not exist", async () => {
    const fakeShipmentId = new mongoose.Types.ObjectId().toString();

    const response = await request(app).get(
      `/api/v1/shipments/${fakeShipmentId}/invoice`
    );

    expect(response.status).toBe(404);
    expect(response.body.status).toBe("fail");
    expect(response.body.message).toBe("Shipment not found");
  });
});
