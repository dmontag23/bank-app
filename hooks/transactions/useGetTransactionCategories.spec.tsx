import React, {ReactNode} from "react";
import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useGetTransactionCategories from "./useGetTransactionCategories";

import ErrorContext, {defaultErrorContext} from "../../store/error-context";

describe("useGetTransactionCategories", () => {
  test("returns an empty array when called with no stored categories", async () => {
    const {result} = renderHook(() => useGetTransactionCategories());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([]);
    expect(AsyncStorage.getItem).toBeCalledTimes(1);
    expect(AsyncStorage.getItem).toBeCalledWith("categories");
  });

  test("returns stored categories", async () => {
    const categories = ["Cardi B's Demands", "Boo"];
    await AsyncStorage.setItem("categories", JSON.stringify(categories));

    // setup error context mocks
    const mockRemoveError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, removeError: mockRemoveError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useGetTransactionCategories(), {
      customWrapper
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(categories);
    expect(AsyncStorage.getItem).toBeCalledTimes(1);
    expect(AsyncStorage.getItem).toBeCalledWith("categories");
    expect(mockRemoveError).toBeCalledTimes(1);
    expect(mockRemoveError).toBeCalledWith("useGetTransactionCategories");
  });

  test("returns error on failed call to storage", async () => {
    // setup mock for async storage
    (
      AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>
    ).mockRejectedValueOnce("Cannot connect to async storage");

    // setup error context mocks
    const mockAddError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, addError: mockAddError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useGetTransactionCategories(), {
      customWrapper
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe("Cannot connect to async storage");
    expect(mockAddError).toBeCalledTimes(1);
    expect(mockAddError).toBeCalledWith({
      id: "useGetTransactionCategories",
      error: "AsyncStorage - Get transaction categories",
      errorMessage:
        'There was a problem getting the transaction categories from AsyncStorage: "Cannot connect to async storage"'
    });
  });
});
