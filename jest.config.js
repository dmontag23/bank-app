/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["**/*.{ts,tsx}", "!**/tests/**", "!**/types/**"],
  // Tests can only be run one at a time because the test query client is
  // created globally.
  // TODO: Look at perhaps created the test query client for each test in order
  // to remove this restriction
  maxWorkers: 1,
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    // Force module uuid to resolve with the CJS entry point, because Jest does not support package.json.exports.
    // See https://github.com/uuidjs/uuid/issues/451
    uuid: require.resolve("uuid")
  },
  preset: "react-native",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/tests/e2e"],
  transformIgnorePatterns: [
    "node_modules/(?!(@react-native|react-native|react-native-vector-icons|@react-native-community/datetimepicker|@react-navigation)/)"
  ]
};
