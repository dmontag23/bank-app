import React, {ReactNode} from "react";
import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useGetTransactionCategoryMap from "./useGetTransactionCategoryMap";

import ErrorContext, {defaultErrorContext} from "../../store/error-context";
import {Source} from "../../types/transaction";

describe("useGetTransactionCategoryMap", () => {
  test("returns an empty map when called with no transactions", async () => {
    const {result} = renderHook(() =>
      useGetTransactionCategoryMap({
        transactionIds: [],
        source: Source.TRUELAYER
      })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({});
    expect(AsyncStorage.multiGet).toBeCalledTimes(1);
    expect(AsyncStorage.multiGet).toBeCalledWith([]);
  });

  test("returns a map where only some values are retrieved from storage", async () => {
    // setup AsyncStorage with mock data
    await AsyncStorage.setItem("truelayer-id-2", "Bills");

    // setup error context mocks
    const mockRemoveError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, removeError: mockRemoveError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(
      () =>
        useGetTransactionCategoryMap({
          transactionIds: ["id-1", "id-2"],
          source: Source.TRUELAYER
        }),
      {customWrapper}
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({
      "id-1": null,
      "id-2": "Bills"
    });
    expect(AsyncStorage.multiGet).toBeCalledTimes(1);
    expect(AsyncStorage.multiGet).toBeCalledWith([
      "truelayer-id-1",
      "truelayer-id-2"
    ]);

    expect(mockRemoveError).toBeCalledTimes(1);
    expect(mockRemoveError).toBeCalledWith("useGetTransactionCategoryMap");
  });

  test("does not fetch from storage when disabled", async () => {
    const {result} = renderHook(() =>
      useGetTransactionCategoryMap({
        transactionIds: [],
        source: Source.TRUELAYER,
        enabled: false
      })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.isFetching).toBe(false);
    expect(AsyncStorage.multiGet).not.toBeCalled();
  });

  test("returns error on failed call to storage", async () => {
    // setup mock for async storage
    const mockAsyncStorageMultiGet =
      AsyncStorage.multiGet as jest.MockedFunction<
        typeof AsyncStorage.multiGet
      >;
    mockAsyncStorageMultiGet.mockImplementation(() =>
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

    const {result} = renderHook(
      () =>
        useGetTransactionCategoryMap({
          transactionIds: [],
          source: Source.TRUELAYER
        }),
      {customWrapper}
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe("Cannot connect to async storage");

    expect(mockAddError).toBeCalledTimes(1);
    expect(mockAddError).toBeCalledWith({
      id: "useGetTransactionCategoryMap",
      error: "AsyncStorage - Get transaction category map",
      errorMessage:
        'There was a problem getting the transaction category map from AsyncStorage: "Cannot connect to async storage"'
    });
  });
});
