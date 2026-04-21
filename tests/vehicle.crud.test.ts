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
import Vehicle from "../models/vehicleModel.js";

const DRIVER_USER_ID = "65f1a2b3c4d5e6f7a8b9c0d2";

describe("Vehicle CRUD", () => {
  let driverProfileId: string;

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

    const profile = await DriverProfile.create({
      user: DRIVER_USER_ID,
      licenseNumber: "DL-12345",
      licenseExpiry: new Date("2028-12-31"),
      vehicleType: "car",
    });

    driverProfileId = String(profile._id);
  });

  it("should create a vehicle", async () => {
    const res = await request(app)
      .post("/api/v1/vehicles")
      .send({
        driverProfileId,
        plateNumber: "LAG-123AB",
        make: "Toyota",
        vehicleModel: "Camry",
        year: 2022,
        color: "White",
        type: "car",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.vehicle.plateNumber).toBe("LAG-123AB");
  });

  it("should get vehicles for a driver", async () => {
    await Vehicle.create({
      driver: driverProfileId,
      plateNumber: "LAG-123AB",
      make: "Toyota",
      vehicleModel: "Camry",
      year: 2022,
      color: "White",
      type: "car",
    });

    const res = await request(app).get(
      `/api/v1/vehicles/driver/${driverProfileId}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(1);
  });

  it("should get a single vehicle", async () => {
    const vehicle = await Vehicle.create({
      driver: driverProfileId,
      plateNumber: "LAG-123AB",
      make: "Toyota",
      vehicleModel: "Camry",
      year: 2022,
      color: "White",
      type: "car",
    });

    const res = await request(app).get(
      `/api/v1/vehicles/${String(vehicle._id)}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.data.vehicle.plateNumber).toBe("LAG-123AB");
  });

  it("should update a vehicle", async () => {
    const vehicle = await Vehicle.create({
      driver: driverProfileId,
      plateNumber: "LAG-123AB",
      make: "Toyota",
      vehicleModel: "Camry",
      year: 2022,
      color: "White",
      type: "car",
    });

    const res = await request(app)
      .patch(`/api/v1/vehicles/${String(vehicle._id)}`)
      .send({ color: "Black" });

    expect(res.status).toBe(200);
    expect(res.body.data.vehicle.color).toBe("Black");
  });

  it("should soft-delete a vehicle", async () => {
    const vehicle = await Vehicle.create({
      driver: driverProfileId,
      plateNumber: "LAG-123AB",
      make: "Toyota",
      vehicleModel: "Camry",
      year: 2022,
      color: "White",
      type: "car",
    });

    const res = await request(app).delete(
      `/api/v1/vehicles/${String(vehicle._id)}`,
    );

    expect(res.status).toBe(200);

    // Should not appear in find queries due to pre-find hook
    const found = await Vehicle.findById(vehicle._id);
    expect(found).toBeNull();
  });
});
