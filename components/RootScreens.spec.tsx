import React from "react";
import {render, stackNavigationObject} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import {NavigationContainer} from "@react-navigation/native";

import ThirdPartyConnections from "./AuthScreens/ThirdPartyConnections";
import LoggedInScreens from "./LoggedInScreens";
import RootScreens from "./RootScreens";
import CenteredLoadingSpinner from "./ui/CenteredLoadingSpinner";

import TruelayerAuthContext from "../store/truelayer-auth-context";

jest.mock("./AuthScreens/ThirdPartyConnections");
jest.mock("./AuthScreens/Truelayer/TruelayerAuthValidation");
jest.mock("./AuthScreens/Truelayer/TruelayerWebAuth");
jest.mock("./LoggedInScreens");
jest.mock("./ui/CenteredLoadingSpinner");

describe("RootScreens component", () => {
  test("renders loading spinner if auth token is loading", async () => {
    render(
      <TruelayerAuthContext.Provider
        value={{isLoading: true, authToken: "", refreshToken: ""}}>
        <NavigationContainer>
          <RootScreens />
        </NavigationContainer>
      </TruelayerAuthContext.Provider>
    );

    expect(CenteredLoadingSpinner).toBeCalledTimes(1);
    expect(CenteredLoadingSpinner).toBeCalledWith({}, {});
  });

  test("renders auth screens if not loading and there is no truelayer auth token", async () => {
    render(
      <TruelayerAuthContext.Provider
        value={{isLoading: false, authToken: "", refreshToken: ""}}>
        <NavigationContainer>
          <RootScreens />
        </NavigationContainer>
      </TruelayerAuthContext.Provider>
    );

    expect(ThirdPartyConnections).toBeCalledTimes(1);
    expect(ThirdPartyConnections).toBeCalledWith(
      {
        navigation: stackNavigationObject,
        route: expect.objectContaining({name: "AppViews", params: undefined})
      },
      {}
    );
  });

  test("renders logged in screens if not loading and truelayer auth token is present", async () => {
    render(
      <TruelayerAuthContext.Provider
        value={{isLoading: false, authToken: "dummy-token", refreshToken: ""}}>
        <NavigationContainer>
          <RootScreens />
        </NavigationContainer>
      </TruelayerAuthContext.Provider>
    );

    expect(LoggedInScreens).toBeCalledTimes(1);
    expect(LoggedInScreens).toBeCalledWith(
      {
        navigation: stackNavigationObject,
        route: expect.objectContaining({name: "AppViews", params: undefined})
      },
      {}
    );
  });

  // TODO: Not sure if it's possible to add a unit tests for TruelayerWebAuth and TruelayerAuthValidation
  // screens here as there is no way to navigate to them from the RootScreens component.
});
