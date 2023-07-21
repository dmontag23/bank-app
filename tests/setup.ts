import "@testing-library/jest-native/extend-expect";
import {afterEach, beforeEach, jest} from "@jest/globals";
import MockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

import {testQueryClient} from "./mocks/utils";

jest.mock("@react-native-async-storage/async-storage", () => MockAsyncStorage);

// needed for animated components
// see https://github.com/jestjs/jest/issues/6434
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
  testQueryClient.clear();
  MockAsyncStorage.clear();
});
