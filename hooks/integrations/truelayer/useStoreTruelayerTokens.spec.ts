import {
  createQueryClient,
  renderHook,
  waitFor
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useStoreTruelayerTokens from "./useStoreTruelayerTokens";

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

    const {result} = renderHook(() => useStoreTruelayerTokens(), {queryClient});
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

    const {result} = renderHook(() => useStoreTruelayerTokens(), {queryClient});
    result.current.mutate({authToken: "", refreshToken: ""});

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe("Cannot connect to async storage");
    expect(queryClient.getQueryData(queryKey)).toEqual(
      previouslyCachedAuthAndRefreshToken
    );
    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
  });
});
