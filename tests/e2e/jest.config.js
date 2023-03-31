/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  rootDir: "../..",
  testMatch: ["<rootDir>/tests/e2e/**/*.test.ts"],
  preset: "react-native",
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: "<rootDir>/tests/e2e/globalSetup.ts",
  globalTeardown: "<rootDir>/tests/e2e/globalTeardown.ts",
  reporters: ["detox/runners/jest/reporter"],
  testEnvironment: "detox/runners/jest/testEnvironment",
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  verbose: true
};
