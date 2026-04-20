const { MongoMemoryServer } = require("mongodb-memory-server");

module.exports = async function () {
  // Pre-download the MongoDB binary before any test suite runs.
  // This avoids the download happening inside a beforeAll hook where
  // Jest's testTimeout (60s) would kill a large (~780MB) download.
  console.log("\n[globalSetup] Pre-downloading MongoDB binary...");
  const mongod = await MongoMemoryServer.create();
  await mongod.stop({ doCleanup: true });
  console.log("[globalSetup] MongoDB binary ready.\n");
};
