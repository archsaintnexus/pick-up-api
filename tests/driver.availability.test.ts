process.env.NODE_ENV = "test";
process.env.TEST_USER_ROLE = "driver";

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

describe("Driver Availability", () => {
  beforeAll(connectTestDB);
  afterAll(closeTestDB);
  afterEach(clearTestDB);

  beforeEach(async () => {
    await User.create({
      _id: TEST_USER_ID,
      fullName: "Driver User",
      email: "driver@test.com",
      password: "driverpassword",
      phoneNumber: "+2347065183061",
      role: "driver",
      isVerified: true,
    });

    await DriverProfile.create({
      user: TEST_USER_ID,
      licenseNumber: "DL-12345",
      licenseExpiry: new Date("2028-12-31"),
      vehicleType: "car",
      isAvailable: true,
    });
  });

  it("should update own availability to unavailable", async () => {
    const res = await request(app)
      .patch("/api/v1/drivers/me/availability")
      .send({ isAvailable: false });

    expect(res.status).toBe(200);
    expect(res.body.data.driverProfile.isAvailable).toBe(false);
  });

  it("should update own availability back to available", async () => {
    // First set to unavailable
    await request(app)
      .patch("/api/v1/drivers/me/availability")
      .send({ isAvailable: false });

    const res = await request(app)
      .patch("/api/v1/drivers/me/availability")
      .send({ isAvailable: true });

    expect(res.status).toBe(200);
    expect(res.body.data.driverProfile.isAvailable).toBe(true);
  });

  it("should get own profile", async () => {
    const res = await request(app).get("/api/v1/drivers/me");

    expect(res.status).toBe(200);
    expect(res.body.data.driverProfile.licenseNumber).toBe("DL-12345");
  });
});
