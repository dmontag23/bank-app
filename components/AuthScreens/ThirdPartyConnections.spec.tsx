import React, {ReactNode} from "react";
import {render, renderHook, screen} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";
import {NavigationContainer, useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";

import ThirdPartyConnections from "./ThirdPartyConnections";

import TruelayerAuthContext from "../../store/truelayer-auth-context";
import {TruelayerAuthStackParamList} from "../../types/screens";

describe("ThirdPartyConnections component", () => {
  test("does not render button with truelayer auth token", () => {
    const customWrapper = (children: ReactNode) => (
      <NavigationContainer>{children}</NavigationContainer>
    );

    const {result} = renderHook(
      () =>
        useNavigation<
          StackNavigationProp<
            TruelayerAuthStackParamList,
            "ThirdPartyConnections"
          >
        >(),
      {customWrapper}
    );

    render(
      <TruelayerAuthContext.Provider
        value={{isLoading: false, authToken: "dummy-token", refreshToken: ""}}>
        <ThirdPartyConnections
          route={{key: "", name: "ThirdPartyConnections"}}
          navigation={result.current}
        />
      </TruelayerAuthContext.Provider>
    );

    expect(
      screen.getByText("Please connect to the following services")
    ).toBeVisible();
    expect(screen.queryByText("Connect to Truelayer")).toBeNull();
  });

  test("renders button without truelayer auth token", () => {
    const customWrapper = (children: ReactNode) => (
      <NavigationContainer>{children}</NavigationContainer>
    );

    const {result} = renderHook(
      () =>
        useNavigation<
          StackNavigationProp<
            TruelayerAuthStackParamList,
            "ThirdPartyConnections"
          >
        >(),
      {customWrapper}
    );

    render(
      <TruelayerAuthContext.Provider
        value={{isLoading: false, authToken: "", refreshToken: ""}}>
        <ThirdPartyConnections
          route={{key: "", name: "ThirdPartyConnections"}}
          navigation={result.current}
        />
      </TruelayerAuthContext.Provider>
    );

    expect(
      screen.getByText("Please connect to the following services")
    ).toBeVisible();
    expect(screen.getByText("Connect to Truelayer")).toBeVisible();
  });
});
