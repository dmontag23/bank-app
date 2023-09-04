import React from "react";
import {AppState} from "react-native";
import {render, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import {focusManager} from "@tanstack/react-query";

import App from "./App";
import ErrorModal from "./components/errors/ErrorModal";
import RootScreens from "./components/RootScreens";
import Toasts from "./components/ui/Toasts";

jest.mock("./components/RootScreens");
jest.mock("./components/errors/ErrorModal");
jest.mock("./components/ui/CenteredLoadingSpinner");
jest.mock("./components/ui/Toasts");

describe("App component", () => {
  test("renders root screens", async () => {
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

    render(<App />);

    waitFor(() => expect(appStateSpy).toBeCalledTimes(1));
    const onAppStateChange = appStateSpy.mock.calls[0][1];

    onAppStateChange("active");

    expect(focusManagerSpy).toBeCalledTimes(0);

    jest.dontMock("react-native/Libraries/Utilities/Platform");
  });
});
