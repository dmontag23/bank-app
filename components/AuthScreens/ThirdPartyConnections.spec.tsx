import React from "react";
import {describe, expect, test} from "@jest/globals";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {render, renderHook, screen} from "@testing-library/react-native";

import ThirdPartyConnections from "./ThirdPartyConnections";

import TruelayerAuthContext from "../../store/truelayer-auth-context";
import {
  ComponentTestWrapper,
  TanstackQueryTestWrapper
} from "../../tests/mocks/utils";
import {TruelayerAuthStackParamList} from "../../types/screens";

describe("ThirdPartyConnections component", () => {
  test("does not render button with truelayer auth token", () => {
    // setup route and navigation object to use component
    const {result} = renderHook(
      () =>
        useNavigation<
          StackNavigationProp<
            TruelayerAuthStackParamList,
            "ThirdPartyConnections"
          >
        >(),
      {
        wrapper: TanstackQueryTestWrapper
      }
    );

    render(
      <TruelayerAuthContext.Provider
        value={{isLoading: false, authToken: "dummy-token", refreshToken: ""}}>
        <ThirdPartyConnections
          route={{key: "", name: "ThirdPartyConnections"}}
          navigation={result.current}
        />
      </TruelayerAuthContext.Provider>,
      {
        wrapper: ComponentTestWrapper
      }
    );

    expect(
      screen.getByText("Please connect to the following services")
    ).toBeVisible();
    expect(screen.queryByText("Connect to Truelayer")).toBeNull();
  });

  test("renders button without truelayer auth token", () => {
    // setup route and navigation object to use component
    const {result: navigation} = renderHook(
      () =>
        useNavigation<
          StackNavigationProp<
            TruelayerAuthStackParamList,
            "ThirdPartyConnections"
          >
        >(),
      {
        wrapper: TanstackQueryTestWrapper
      }
    );

    render(
      <TruelayerAuthContext.Provider
        value={{isLoading: false, authToken: "", refreshToken: ""}}>
        <ThirdPartyConnections
          route={{key: "", name: "ThirdPartyConnections"}}
          navigation={navigation.current}
        />
      </TruelayerAuthContext.Provider>,
      {
        wrapper: ComponentTestWrapper
      }
    );

    expect(
      screen.getByText("Please connect to the following services")
    ).toBeVisible();
    expect(screen.getByText("Connect to Truelayer")).toBeVisible();
  });
});
