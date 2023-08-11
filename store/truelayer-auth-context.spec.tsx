import React, {useContext} from "react";
import {Text} from "react-native-paper";
import {describe, expect, jest, test} from "@jest/globals";
import {render, renderHook, screen} from "@testing-library/react-native";

import TruelayerAuthContext, {
  TruelayerAuthContextProvider
} from "./truelayer-auth-context";

import useGetTruelayerTokens from "../hooks/integrations/truelayer/useGetTruelayerTokens";
import {
  ComponentTestWrapper,
  TanstackQueryTestWrapper
} from "../tests/mocks/utils";

jest.mock("../hooks/integrations/truelayer/useGetTruelayerTokens");

describe("TruelayerAuthContext", () => {
  test("defaults values correctly", () => {
    const {result} = renderHook(() => useContext(TruelayerAuthContext), {
      wrapper: TanstackQueryTestWrapper
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.authToken).toBe("");
    expect(result.current.refreshToken).toBe("");
  });

  test("TruelayerAuthContextProvider with no token values is defaulted correctly", () => {
    (useGetTruelayerTokens as jest.MockedFunction<any>).mockImplementation(
      () => ({
        data: undefined,
        isLoading: true
      })
    );

    render(
      <TruelayerAuthContextProvider>
        <TruelayerAuthContext.Consumer>
          {values => <Text>{JSON.stringify(values)}</Text>}
        </TruelayerAuthContext.Consumer>
      </TruelayerAuthContextProvider>,
      {wrapper: ComponentTestWrapper}
    );

    const expectedResult = {
      isLoading: true,
      authToken: "",
      refreshToken: ""
    };
    expect(screen.getByText(JSON.stringify(expectedResult))).toBeVisible();
  });

  test("TruelayerAuthContextProvider with token values is set correctly", () => {
    (useGetTruelayerTokens as jest.MockedFunction<any>).mockImplementation(
      () => ({
        data: {
          authToken: "test-auth-token",
          refreshToken: "test-refresh-token"
        },
        isLoading: false
      })
    );

    render(
      <TruelayerAuthContextProvider>
        <TruelayerAuthContext.Consumer>
          {values => <Text>{JSON.stringify(values)}</Text>}
        </TruelayerAuthContext.Consumer>
      </TruelayerAuthContextProvider>,
      {wrapper: ComponentTestWrapper}
    );

    const expectedResult = {
      isLoading: false,
      authToken: "test-auth-token",
      refreshToken: "test-refresh-token"
    };
    expect(screen.getByText(JSON.stringify(expectedResult))).toBeVisible();
  });
});
