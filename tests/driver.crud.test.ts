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

const DRIVER_USER_ID = "65f1a2b3c4d5e6f7a8b9c0d2";

describe("Driver CRUD", () => {
  beforeAll(connectTestDB);
  afterAll(closeTestDB);
  afterEach(clearTestDB);

  beforeEach(async () => {
    // Admin user (the authenticated user via mock)
    await User.create({
      _id: TEST_USER_ID,
      fullName: "Admin User",
      email: "admin@test.com",
      password: "adminpassword",
      phoneNumber: "+2347065183060",
      role: "admin",
    });

    // Driver user to be onboarded
    await User.create({
      _id: DRIVER_USER_ID,
      fullName: "Driver One",
      email: "driver@test.com",
      password: "driverpassword",
      phoneNumber: "+2347065183061",
      role: "driver",
      isVerified: true,
    });
  });

  it("should create a driver profile", async () => {
    const res = await request(app)
      .post("/api/v1/drivers")
      .send({
        userId: DRIVER_USER_ID,
        licenseNumber: "DL-12345",
        licenseExpiry: "2028-12-31",
        vehicleType: "car",
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.driverProfile.licenseNumber).toBe("DL-12345");
    expect(res.body.data.driverProfile.isAvailable).toBe(true);
  });

  it("should reject creating profile for non-driver user", async () => {
    const res = await request(app)
      .post("/api/v1/drivers")
      .send({
        userId: TEST_USER_ID,
        licenseNumber: "DL-99999",
        licenseExpiry: "2028-12-31",
        vehicleType: "car",
      });

    expect(res.status).toBe(400);
  });

  it("should reject duplicate driver profile", async () => {
    await DriverProfile.create({
      user: DRIVER_USER_ID,
      licenseNumber: "DL-12345",
      licenseExpiry: new Date("2028-12-31"),
      vehicleType: "car",
    });

    const res = await request(app)
      .post("/api/v1/drivers")
      .send({
        userId: DRIVER_USER_ID,
        licenseNumber: "DL-67890",
        licenseExpiry: "2028-12-31",
        vehicleType: "van",
      });

    expect(res.status).toBe(409);
  });

  it("should get all drivers", async () => {
    await DriverProfile.create({
      user: DRIVER_USER_ID,
      licenseNumber: "DL-12345",
      licenseExpiry: new Date("2028-12-31"),
      vehicleType: "car",
    });

    const res = await request(app).get("/api/v1/drivers");

    expect(res.status).toBe(200);
    expect(res.body.data.drivers).toHaveLength(1);
    expect(res.body.data.total).toBe(1);
  });

  it("should get a single driver profile", async () => {
    const profile = await DriverProfile.create({
      user: DRIVER_USER_ID,
      licenseNumber: "DL-12345",
      licenseExpiry: new Date("2028-12-31"),
      vehicleType: "car",
    });

    const res = await request(app).get(
      `/api/v1/drivers/${String(profile._id)}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data.driverProfile.licenseNumber).toBe("DL-12345");
  });

  it("should update a driver profile", async () => {
    const profile = await DriverProfile.create({
      user: DRIVER_USER_ID,
      licenseNumber: "DL-12345",
      licenseExpiry: new Date("2028-12-31"),
      vehicleType: "car",
    });

    const res = await request(app)
      .patch(`/api/v1/drivers/${String(profile._id)}`)
      .send({ vehicleType: "van" });

    expect(res.status).toBe(200);
    expect(res.body.data.driverProfile.vehicleType).toBe("van");
  });

  it("should soft-delete a driver profile", async () => {
    const profile = await DriverProfile.create({
      user: DRIVER_USER_ID,
      licenseNumber: "DL-12345",
      licenseExpiry: new Date("2028-12-31"),
      vehicleType: "car",
    });

    const res = await request(app).delete(
      `/api/v1/drivers/${String(profile._id)}`,
    );

    expect(res.status).toBe(200);

    // Should not appear in find queries due to pre-find hook
    const found = await DriverProfile.findById(profile._id);
    expect(found).toBeNull();
  });
});
