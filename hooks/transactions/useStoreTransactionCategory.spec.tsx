import React, {ReactNode} from "react";
import {
  createQueryClient,
  renderHook,
  waitFor
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useStoreTransactionCategory from "./useStoreTransactionCategory";

import ErrorContext, {defaultErrorContext} from "../../store/error-context";
import ToastContext, {ToastType} from "../../store/toast-context";

jest.mock("uuid", () => ({
  v4: () => "unique-id"
}));

describe("useStoreTransactionCategory", () => {
  test("stores category correctly", async () => {
    // put some test data in the cache
    const queryClient = createQueryClient();
    const queryKey = ["transactionCategories"];
    queryClient.setQueryData<string[]>(queryKey, () => []);

    const mockRemoveError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, removeError: mockRemoveError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useStoreTransactionCategory(), {
      customWrapper,
      queryClient
    });
    result.current.mutate("New category");

    // check the category is stored correctly
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe("New category");
    expect(AsyncStorage.getItem).toBeCalledTimes(1);
    expect(AsyncStorage.getItem).toBeCalledWith("categories");
    expect(AsyncStorage.setItem).toBeCalledTimes(1);
    expect(AsyncStorage.setItem).toBeCalledWith(
      "categories",
      JSON.stringify(["New category"])
    );
    expect(await AsyncStorage.getItem("categories")).toBe(
      JSON.stringify(["New category"])
    );

    // check that any previous errors are removed
    expect(mockRemoveError).toBeCalledTimes(1);
    expect(mockRemoveError).toBeCalledWith("useStoreTransactionCategory");

    // check that the transactions categories query is invalidated
    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
  });

  test("category is appended to previous category list", async () => {
    await AsyncStorage.setItem("categories", JSON.stringify(["Cardi B"]));

    const {result} = renderHook(() => useStoreTransactionCategory());
    result.current.mutate("Lady Gaga");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe("Lady Gaga");
    expect(await AsyncStorage.getItem("categories")).toBe(
      JSON.stringify(["Cardi B", "Lady Gaga"])
    );
  });

  test("does not store an existing category", async () => {
    await AsyncStorage.setItem("categories", JSON.stringify(["Lady Gaga "]));

    const mockAddToast = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ToastContext.Provider
        value={{
          toasts: [],
          addToast: mockAddToast,
          clearToast: () => {},
          clearAllToasts: () => {}
        }}>
        {children}
      </ToastContext.Provider>
    );

    const {result} = renderHook(() => useStoreTransactionCategory(), {
      customWrapper
    });
    result.current.mutate("  LADY GAgA  ");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe("LADY GAgA");
    expect(await AsyncStorage.getItem("categories")).toBe(
      JSON.stringify(["Lady Gaga "])
    );
    expect(mockAddToast).toBeCalledTimes(1);
    expect(mockAddToast).toBeCalledWith({
      id: "unique-id",
      message: "LADY GAgA is already a category. Please choose a new name.",
      type: ToastType.WARNING
    });
  });

  test("errors on failed storage call", async () => {
    (
      AsyncStorage.multiSet as jest.MockedFunction<typeof AsyncStorage.multiSet>
    ).mockRejectedValueOnce("Cannot connect to async storage");

    // put some test data in the cache
    const queryClient = createQueryClient();
    const queryKey = ["transactionCategories"];
    const previousCachedCategories = ["Evanescence"];
    queryClient.setQueryData<string[]>(
      queryKey,
      () => previousCachedCategories
    );

    const mockAddError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, addError: mockAddError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useStoreTransactionCategory(), {
      queryClient,
      customWrapper
    });
    result.current.mutate("Within Temptation");

    // check the hook is in an error state
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe("Cannot connect to async storage");

    // check the cached data has not changed but has been invalidated
    expect(queryClient.getQueryData(queryKey)).toEqual(
      previousCachedCategories
    );
    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);

    // check the error has been added correctly
    expect(mockAddError).toBeCalledTimes(1);
    expect(mockAddError).toBeCalledWith({
      id: "useStoreTransactionCategory",
      error: "AsyncStorage - Store transaction category",
      errorMessage:
        'There was a problem storing the transaction category in AsyncStorage: "Cannot connect to async storage"'
    });
  });
});
