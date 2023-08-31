import React, {ReactNode} from "react";
import {
  createQueryClient,
  renderHook,
  waitFor
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useStoreTruelayerTokens from "./useStoreTruelayerTokens";

import ErrorContext, {defaultErrorContext} from "../../../store/error-context";

describe("useStoreTruelayerTokens", () => {
  test("stores token correctly", async () => {
    const queryClient = createQueryClient();

    // put some test data in the cache
    const previouslyCachedAuthAndRefreshToken = {
      authToken: "auth-token-1",
      refreshToken: "refresh-token-1"
    };
    const queryKey = ["truelayerTokens"];
    queryClient.setQueryData(
      queryKey,
      () => previouslyCachedAuthAndRefreshToken
    );

    // setup error context mocks
    const mockRemoveError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, removeError: mockRemoveError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useStoreTruelayerTokens(), {
      queryClient,
      customWrapper
    });

    const newTokens = {
      authToken: "auth-token-2",
      refreshToken: "refresh-token-2"
    };
    result.current.mutate(newTokens);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(newTokens);
    expect(AsyncStorage.multiSet).toBeCalledTimes(1);
    expect(AsyncStorage.multiSet).toBeCalledWith([
      ["truelayer-auth-token", newTokens.authToken],
      ["truelayer-refresh-token", newTokens.refreshToken]
    ]);
    expect(await AsyncStorage.getItem("truelayer-auth-token")).toEqual(
      newTokens.authToken
    );
    expect(await AsyncStorage.getItem("truelayer-refresh-token")).toEqual(
      newTokens.refreshToken
    );
    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);

    expect(mockRemoveError).toBeCalledTimes(1);
    expect(mockRemoveError).toBeCalledWith("useStoreTruelayerTokens");
  });

  test("errors on failed storage call", async () => {
    const queryClient = createQueryClient();

    // setup mock for async storage
    (
      AsyncStorage.multiSet as jest.MockedFunction<typeof AsyncStorage.multiSet>
    ).mockImplementation(() =>
      Promise.reject("Cannot connect to async storage")
    );

    // put some test data in the cache
    const previouslyCachedAuthAndRefreshToken = {
      authToken: "auth-token-1",
      refreshToken: "refresh-token-1"
    };
    const queryKey = ["truelayerTokens"];
    queryClient.setQueryData(
      queryKey,
      () => previouslyCachedAuthAndRefreshToken
    );

    // setup error context mocks
    const mockAddError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, addError: mockAddError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useStoreTruelayerTokens(), {
      queryClient,
      customWrapper
    });
    result.current.mutate({authToken: "", refreshToken: ""});

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe("Cannot connect to async storage");
    expect(queryClient.getQueryData(queryKey)).toEqual(
      previouslyCachedAuthAndRefreshToken
    );
    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);

    expect(mockAddError).toBeCalledTimes(1);
    expect(mockAddError).toBeCalledWith({
      id: "useStoreTruelayerTokens",
      error: "AsyncStorage - Store tokens",
      errorMessage:
        'There was a problem storing the Truelayer auth and refresh tokens in AsyncStorage: "Cannot connect to async storage"'
    });
  });
});
