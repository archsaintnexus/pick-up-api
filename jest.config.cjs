module.exports = {
  preset: "ts-jest/presets/default-esm",
  globalSetup: "<rootDir>/tests/globalSetup.cjs",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  extensionsToTreatAsEsm: [".ts"],
  testTimeout: 60000,
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    ".*Queues/emailQueue.*": "<rootDir>/tests/__mocks__/emailQueue.ts",
    ".*services/redis.*": "<rootDir>/tests/__mocks__/redis.ts",
    ".*middleware/protector.*": "<rootDir>/tests/__mocks__/protector.ts",
    ".*stripeService.*": "<rootDir>/tests/__mocks__/stripeService.ts",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  clearMocks: true,
};
