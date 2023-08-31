import React, {useContext} from "react";
import {Text} from "react-native-paper";
import {render, renderHook, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import TruelayerAuthContext from "./truelayer-auth-context";

import useGetTruelayerTokens from "../hooks/integrations/truelayer/useGetTruelayerTokens";

jest.mock("../hooks/integrations/truelayer/useGetTruelayerTokens");

describe("TruelayerAuthContext", () => {
  test("defaults values correctly", () => {
    const {result} = renderHook(() => useContext(TruelayerAuthContext));

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
      <TruelayerAuthContext.Consumer>
        {values => <Text>{JSON.stringify(values)}</Text>}
      </TruelayerAuthContext.Consumer>
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
      <TruelayerAuthContext.Consumer>
        {values => <Text>{JSON.stringify(values)}</Text>}
      </TruelayerAuthContext.Consumer>
    );

    const expectedResult = {
      isLoading: false,
      authToken: "test-auth-token",
      refreshToken: "test-refresh-token"
    };
    expect(screen.getByText(JSON.stringify(expectedResult))).toBeVisible();
  });
});
