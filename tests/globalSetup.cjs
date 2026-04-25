const { MongoMemoryServer } = require("mongodb-memory-server");

module.exports = async function globalSetup() {
  console.log("\n[globalSetup] Pre-downloading MongoDB binary...");
  const mongod = await MongoMemoryServer.create({
    instance: { startupTimeout: 120000 },
  });
  await mongod.stop({ doCleanup: true });
  console.log("[globalSetup] MongoDB binary ready.\n");
};
