/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/tests/**",
    "!**/types/**",
    "!axiosConfig.ts"
  ],
  // Tests can only be run one at a time because the test query client is
  // created globally.
  // TODO: Look at perhaps created the test query client for each test in order
  // to remove this restriction
  maxWorkers: 1,
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  preset: "react-native",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/tests/e2e"]
};
