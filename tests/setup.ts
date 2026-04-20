import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Fixed ObjectId so the protector mock and DB seeds use the same value
export const TEST_USER_ID = "65f1a2b3c4d5e6f7a8b9c0d1";

let mongoServer: MongoMemoryServer;

export const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
};

export const closeTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    if (!collection) continue;
    await collection.deleteMany({});
  }
};
