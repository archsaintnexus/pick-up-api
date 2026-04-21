process.env.NODE_ENV = "test";
process.env.TEST_USER_ROLE = "admin";

import request from "supertest";
import app from "../app.js";
import {
  connectTestDB,
  closeTestDB,
  clearTestDB,
  TEST_USER_ID,
} from "./setup.js";
import User from "../models/userModel.js";
import DriverProfile from "../models/driverProfileModel.js";
import Shipment from "../models/shipmentModel.js";

const DRIVER_USER_ID = "65f1a2b3c4d5e6f7a8b9c0d2";

describe("Driver Performance Metrics", () => {
  beforeAll(connectTestDB);
  afterAll(closeTestDB);
  afterEach(clearTestDB);

  beforeEach(async () => {
    await User.create({
      _id: TEST_USER_ID,
      fullName: "Admin User",
      email: "admin@test.com",
      password: "adminpassword",
      phoneNumber: "+2347065183060",
      role: "admin",
    });

    await User.create({
      _id: DRIVER_USER_ID,
      fullName: "Driver User",
      email: "driver@test.com",
      password: "driverpassword",
      phoneNumber: "+2347065183061",
      role: "driver",
      isVerified: true,
    });

    await DriverProfile.create({
      user: DRIVER_USER_ID,
      licenseNumber: "DL-12345",
      licenseExpiry: new Date("2028-12-31"),
      vehicleType: "car",
    });

    // Seed shipments with various statuses
    const shipments = [
      { status: "DELIVERED", shipmentCode: "PU-001" },
      { status: "DELIVERED", shipmentCode: "PU-002" },
      { status: "DELIVERED", shipmentCode: "PU-003" },
      { status: "CANCELLED", shipmentCode: "PU-004" },
      { status: "IN_TRANSIT", shipmentCode: "PU-005" },
    ];

    for (const s of shipments) {
      await Shipment.create({
        shipmentCode: s.shipmentCode,
        user: TEST_USER_ID,
        assignedDriver: DRIVER_USER_ID,
        status: s.status,
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
      });
    }
  });

  it("should return correct performance metrics", async () => {
    const res = await request(app).get(
      `/api/v1/drivers/${DRIVER_USER_ID}/metrics`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data.metrics.totalAssigned).toBe(5);
    expect(res.body.data.metrics.delivered).toBe(3);
    expect(res.body.data.metrics.cancelled).toBe(1);
    expect(res.body.data.metrics.inTransit).toBe(1);
    expect(res.body.data.metrics.activeShipments).toBe(1);
  });

  it("should return zero metrics for driver with no shipments", async () => {
    const newDriverId = "65f1a2b3c4d5e6f7a8b9c0d3";
    await User.create({
      _id: newDriverId,
      fullName: "New Driver",
      email: "newdriver@test.com",
      password: "driverpassword",
      phoneNumber: "+2347065183062",
      role: "driver",
      isVerified: true,
    });

    const res = await request(app).get(
      `/api/v1/drivers/${newDriverId}/metrics`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data.metrics.totalAssigned).toBe(0);
    expect(res.body.data.metrics.delivered).toBe(0);
    expect(res.body.data.metrics.activeShipments).toBe(0);
  });
});
