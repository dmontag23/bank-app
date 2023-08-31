import React from "react";
import {AppState} from "react-native";
import {render, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import {focusManager} from "@tanstack/react-query";

import App from "./App";
import AuthScreens from "./components/AuthScreens/AuthScreens";
import ErrorModal from "./components/errors/ErrorModal";
import LoggedInScreens from "./components/LoggedInScreens";
import CenteredLoadingSpinner from "./components/ui/CenteredLoadingSpinner";
import Toasts from "./components/ui/Toasts";
import TruelayerAuthContext from "./store/truelayer-auth-context";

jest.mock("./components/AuthScreens/AuthScreens");
jest.mock("./components/errors/ErrorModal");
jest.mock("./components/LoggedInScreens");
jest.mock("./components/ui/CenteredLoadingSpinner");
jest.mock("./components/ui/Toasts");

describe("App component", () => {
  test("renders loading spinner when loading truelayer auth context", () => {
    render(
      <TruelayerAuthContext.Provider
        value={{isLoading: true, authToken: "", refreshToken: ""}}>
        <App />
      </TruelayerAuthContext.Provider>
    );

    expect(CenteredLoadingSpinner).toBeCalledTimes(1);
    expect(CenteredLoadingSpinner).toBeCalledWith({}, {});
  });

  test("renders logged in screens with truelayer auth token", async () => {
    render(
      <TruelayerAuthContext.Provider
        value={{isLoading: false, authToken: "dummy-token", refreshToken: ""}}>
        <App />
      </TruelayerAuthContext.Provider>
    );

    await waitFor(() => expect(LoggedInScreens).toBeCalledTimes(1));
    expect(LoggedInScreens).toBeCalledWith({}, {});
    expect(Toasts).toBeCalledTimes(1);
    expect(Toasts).toBeCalledWith({}, {});
    expect(ErrorModal).toBeCalledTimes(1);
    expect(ErrorModal).toBeCalledWith({}, {});
  });

  test("renders auth screens without truelayer auth token", async () => {
    render(
      <TruelayerAuthContext.Provider
        value={{isLoading: false, authToken: "", refreshToken: ""}}>
        <App />
      </TruelayerAuthContext.Provider>
    );

    await waitFor(() => expect(AuthScreens).toBeCalledTimes(1));
    expect(AuthScreens).toBeCalledWith({}, {});
    expect(Toasts).toBeCalledTimes(1);
    expect(Toasts).toBeCalledWith({}, {});
    expect(ErrorModal).toBeCalledTimes(1);
    expect(ErrorModal).toBeCalledWith({}, {});
  });

  test("re-fetches queries when the user returns to the app on ios", async () => {
    const appStateSpy = jest.spyOn(AppState, "addEventListener");
    const focusManagerSpy = jest.spyOn(focusManager, "setFocused");

    render(
      <TruelayerAuthContext.Provider
        value={{isLoading: false, authToken: "", refreshToken: ""}}>
        <App />
      </TruelayerAuthContext.Provider>
    );

    waitFor(() => expect(appStateSpy).toBeCalledTimes(1));
    const onAppStateChange = appStateSpy.mock.calls[0][1];

    onAppStateChange("active");

    expect(focusManagerSpy).toBeCalledTimes(1);
    expect(focusManagerSpy).toBeCalledWith(true);
  });

  test("does not re-fetch queries when the user returns to the app on web", async () => {
    jest.doMock("react-native/Libraries/Utilities/Platform", () => ({
      OS: "web"
    }));

    const appStateSpy = jest.spyOn(AppState, "addEventListener");
    const focusManagerSpy = jest.spyOn(focusManager, "setFocused");

    render(
      <TruelayerAuthContext.Provider
        value={{isLoading: false, authToken: "", refreshToken: ""}}>
        <App />
      </TruelayerAuthContext.Provider>
    );

    waitFor(() => expect(appStateSpy).toBeCalledTimes(1));
    const onAppStateChange = appStateSpy.mock.calls[0][1];

    onAppStateChange("active");

    expect(focusManagerSpy).toBeCalledTimes(0);

    jest.dontMock("react-native/Libraries/Utilities/Platform");
  });
});
