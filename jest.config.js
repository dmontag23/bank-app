/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["**/*.{ts,tsx}", "!**/tests/**", "!**/types/**"],
  globalSetup: "<rootDir>/tests/globalSetup.ts",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    // Force module uuid to resolve with the CJS entry point, because Jest does not support package.json.exports.
    // See https://github.com/uuidjs/uuid/issues/451
    uuid: require.resolve("uuid"),
    // added the line below to use absolute imports from the root directory
    // e.g. to import all the custom render, renderHook, etc functions from
    // the react native testing library
    "testing-library/extension": "<rootDir>/tests/utils"
  },
  preset: "react-native",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/tests/e2e"],
  transformIgnorePatterns: [
    "node_modules/(?!(@react-native|react-native|react-native-vector-icons|@react-native-community/datetimepicker|@react-navigation)/)"
  ]
};
