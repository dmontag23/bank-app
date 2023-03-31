/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  collectCoverage: false,
  collectCoverageFrom: ["**/*.{ts,tsx}", "!**/types/**"],
  globalSetup: "<rootDir>/tests/globalSetup.ts",
  globalTeardown: "<rootDir>/tests/globalTeardown.ts",
  maxWorkers: 1,
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  preset: "react-native",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/tests/e2e"]
};
