import React from "react";
import {describe, expect, jest, test} from "@jest/globals";
import {render, waitFor} from "@testing-library/react-native";

import App from "./App";
import AuthScreens from "./components/AuthScreens/AuthScreens";
import LoggedInScreens from "./components/LoggedInScreens";
import CenteredLoadingSpinner from "./components/ui/CenteredLoadingSpinner";
import TruelayerAuthContext from "./store/truelayer-auth-context";

jest.mock("./components/AuthScreens/AuthScreens");
jest.mock("./components/LoggedInScreens");
jest.mock("./components/ui/CenteredLoadingSpinner");

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
  });
});
