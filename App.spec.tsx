import React from "react";
import {AppState} from "react-native";
import {render, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import {focusManager} from "@tanstack/react-query";

import App from "./App";
import ErrorModal from "./components/errors/ErrorModal";
import RootScreens from "./components/RootScreens";
import Toasts from "./components/ui/Toasts";
import {INITIAL_CATEGORY_MAP} from "./constants";
import useStoreCategoryMap from "./hooks/transactions/useStoreCategoryMap";

jest.mock("./components/RootScreens");
jest.mock("./components/errors/ErrorModal");
jest.mock("./components/ui/CenteredLoadingSpinner");
jest.mock("./components/ui/Toasts");
jest.mock("./hooks/transactions/useStoreCategoryMap");

describe("App component", () => {
  test("renders root screens", async () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useStoreCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      mutate: jest.fn()
    });

    render(<App />);

    await waitFor(() => expect(RootScreens).toBeCalledTimes(1));
    expect(RootScreens).toBeCalledWith({}, {});
    expect(Toasts).toBeCalledTimes(1);
    expect(Toasts).toBeCalledWith({}, {});
    expect(ErrorModal).toBeCalledTimes(1);
    expect(ErrorModal).toBeCalledWith({}, {});
  });

  test("re-fetches queries when the user returns to the app on ios", () => {
    const appStateSpy = jest.spyOn(AppState, "addEventListener");
    const focusManagerSpy = jest.spyOn(focusManager, "setFocused");

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useStoreCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      mutate: jest.fn()
    });

    render(<App />);

    waitFor(() => expect(appStateSpy).toBeCalledTimes(1));
    const onAppStateChange = appStateSpy.mock.calls[0][1];

    onAppStateChange("active");

    expect(focusManagerSpy).toBeCalledTimes(1);
    expect(focusManagerSpy).toBeCalledWith(true);
  });

  test("does not re-fetch queries when the user returns to the app on web", () => {
    jest.doMock("react-native/Libraries/Utilities/Platform", () => ({
      OS: "web"
    }));

    const appStateSpy = jest.spyOn(AppState, "addEventListener");
    const focusManagerSpy = jest.spyOn(focusManager, "setFocused");

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useStoreCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      mutate: jest.fn()
    });

    render(<App />);

    waitFor(() => expect(appStateSpy).toBeCalledTimes(1));
    const onAppStateChange = appStateSpy.mock.calls[0][1];

    onAppStateChange("active");

    expect(focusManagerSpy).toBeCalledTimes(0);

    jest.dontMock("react-native/Libraries/Utilities/Platform");
  });

  test("stores initial transaction categories on load", async () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    const mockStoreTransactionCategory = jest.fn();
    (useStoreCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      mutate: mockStoreTransactionCategory
    });

    render(<App />);

    expect(mockStoreTransactionCategory).toBeCalledTimes(1);
    expect(mockStoreTransactionCategory).toBeCalledWith(INITIAL_CATEGORY_MAP);
    expect(useStoreCategoryMap).toBeCalledTimes(1);
    expect(useStoreCategoryMap).toBeCalledWith({
      showWarningOnDuplicateCategory: false
    });
  });
});
