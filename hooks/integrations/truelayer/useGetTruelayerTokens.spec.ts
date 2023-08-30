import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useGetTruelayerTokens from "./useGetTruelayerTokens";

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

    const {result} = renderHook(() => useGetTruelayerTokens());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      authToken: dummyAuthToken,
      refreshToken: dummyRefreshToken
    });
    expect(result.current.error).toBeNull();
  });

  test("returns error on failed call to storage", async () => {
    // setup mock for async storage
    (
      AsyncStorage.multiGet as jest.MockedFunction<typeof AsyncStorage.multiGet>
    ).mockImplementation(() =>
      Promise.reject("Cannot connect to async storage")
    );

    const {result} = renderHook(() => useGetTruelayerTokens());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe("Cannot connect to async storage");
  });
});
