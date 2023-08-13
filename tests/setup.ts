import "@testing-library/jest-native/extend-expect";
import {afterEach, beforeEach, jest} from "@jest/globals";
import MockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

import {testQueryClient} from "./mocks/utils";

// included following https://reactnavigation.org/docs/testing/
import "react-native-gesture-handler/jestSetup";

jest.mock("@react-native-async-storage/async-storage", () => MockAsyncStorage);

// this is needed for the WebView component
// see https://github.com/react-native-webview/react-native-webview/issues/2934#issuecomment-1524101977
jest.mock("react-native-webview", () => jest.fn());

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
