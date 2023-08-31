import React, {ReactNode} from "react";
import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useGetTruelayerTokens from "./useGetTruelayerTokens";

import ErrorContext, {defaultErrorContext} from "../../../store/error-context";

describe("useGetTruelayerTokens", () => {
  test("returns correct auth token with no refresh token", async () => {
    // setup AsyncStorage with correct data
    const dummyAuthToken = "auth-token";
    await AsyncStorage.setItem("truelayer-auth-token", dummyAuthToken);

    const {result} = renderHook(() => useGetTruelayerTokens());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      authToken: dummyAuthToken,
      refreshToken: null
    });
    expect(result.current.error).toBeNull();
  });

  test("returns correct refresh token with no auth token", async () => {
    // setup AsyncStorage with correct data
    const dummyRefreshToken = "refresh-token";
    await AsyncStorage.setItem("truelayer-refresh-token", dummyRefreshToken);

    const {result} = renderHook(() => useGetTruelayerTokens());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      authToken: null,
      refreshToken: dummyRefreshToken
    });
    expect(result.current.error).toBeNull();
  });

  test("returns correct auth and refresh tokens", async () => {
    // setup AsyncStorage with correct data
    const dummyAuthToken = "auth-token";
    const dummyRefreshToken = "refresh-token";
    await AsyncStorage.setItem("truelayer-auth-token", dummyAuthToken);
    await AsyncStorage.setItem("truelayer-refresh-token", dummyRefreshToken);

    // setup error context mocks
    const mockRemoveError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, removeError: mockRemoveError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useGetTruelayerTokens(), {customWrapper});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      authToken: dummyAuthToken,
      refreshToken: dummyRefreshToken
    });
    expect(result.current.error).toBeNull();

    expect(mockRemoveError).toBeCalledTimes(1);
    expect(mockRemoveError).toBeCalledWith("useGetTruelayerTokens");
  });

  test("returns error on failed call to storage", async () => {
    // setup mock for async storage
    (
      AsyncStorage.multiGet as jest.MockedFunction<typeof AsyncStorage.multiGet>
    ).mockImplementation(() =>
      Promise.reject("Cannot connect to async storage")
    );

    // setup error context mocks
    const mockAddError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, addError: mockAddError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useGetTruelayerTokens(), {customWrapper});

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe("Cannot connect to async storage");

    expect(mockAddError).toBeCalledTimes(1);
    expect(mockAddError).toBeCalledWith({
      id: "useGetTruelayerTokens",
      error: "AsyncStorage - Get tokens",
      errorMessage:
        'There was a problem getting the Truelayer auth and refresh tokens from AsyncStorage: "Cannot connect to async storage"'
    });
  });
});
