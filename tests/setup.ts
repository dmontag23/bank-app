import "@testing-library/jest-native/extend-expect";
import MockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

import {testQueryClient} from "./mocks/utils";

jest.mock("@react-native-async-storage/async-storage", () => MockAsyncStorage);

afterEach(() => {
  jest.clearAllMocks();
  testQueryClient.clear();
  MockAsyncStorage.clear();
});
