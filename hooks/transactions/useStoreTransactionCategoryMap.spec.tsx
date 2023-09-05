import React, {ReactNode} from "react";
import {
  createQueryClient,
  renderHook,
  waitFor
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useStoreTransactionCategoryMap from "./useStoreTransactionCategoryMap";

import ErrorContext, {defaultErrorContext} from "../../store/error-context";
import {
  TransactionCategory,
  TransactionIDToCategoryMapping
} from "../../types/transaction";

describe("useStoreTransactionCategoryMap", () => {
  test("does not store anything when called with an empty map", async () => {
    // setup error context mocks
    const mockRemoveError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, removeError: mockRemoveError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useStoreTransactionCategoryMap(), {
      customWrapper
    });
    result.current.mutate({});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({});
    expect(AsyncStorage.multiSet).not.toBeCalled();

    expect(mockRemoveError).toBeCalledTimes(1);
    expect(mockRemoveError).toBeCalledWith("useStoreTransactionCategoryMap");
  });

  test("stores transaction map correctly", async () => {
    const queryClient = createQueryClient();

    // put some test data in the cache
    const previouslyCachedTransactions: TransactionIDToCategoryMapping = {
      "id-1": TransactionCategory.BILLS,
      "id-2": TransactionCategory.EATING_OUT
    };
    const queryKey = ["transactionCategoryMapping", "id-1", "id-2"];
    queryClient.setQueryData<TransactionIDToCategoryMapping>(
      queryKey,
      () => previouslyCachedTransactions
    );

    const testData: TransactionIDToCategoryMapping = {
      "id-1": TransactionCategory.SAVINGS,
      "id-2": TransactionCategory.UNKNOWN
    };

    const {result} = renderHook(() => useStoreTransactionCategoryMap(), {
      queryClient
    });
    result.current.mutate(testData);

    const expectedDataInAsyncStorage = [
      ["truelayer-id-1", TransactionCategory.SAVINGS],
      ["truelayer-id-2", TransactionCategory.UNKNOWN]
    ];
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(testData);
    expect(AsyncStorage.multiSet).toBeCalledTimes(1);
    expect(AsyncStorage.multiSet).toBeCalledWith(expectedDataInAsyncStorage);
    expect(
      await AsyncStorage.multiGet(
        Object.keys(testData).map(key => `truelayer-${key}`)
      )
    ).toEqual(expectedDataInAsyncStorage);
    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
  });

  test("errors correctly on failed storage call", async () => {
    const queryClient = createQueryClient();

    // setup mock for async storage
    const mockAsyncStorageMultiSet =
      AsyncStorage.multiSet as jest.MockedFunction<
        typeof AsyncStorage.multiSet
      >;
    mockAsyncStorageMultiSet.mockImplementation(() =>
      Promise.reject("Cannot connect to async storage")
    );

    // put some test data in the cache
    const previouslyCachedTransactions: TransactionIDToCategoryMapping = {
      "id-1": TransactionCategory.BILLS,
      "id-2": TransactionCategory.EATING_OUT
    };
    const queryKey = ["transactionCategoryMapping", "id-1", "id-2"];
    queryClient.setQueryData<TransactionIDToCategoryMapping>(
      queryKey,
      () => previouslyCachedTransactions
    );

    const testData: TransactionIDToCategoryMapping = {
      "id-1": TransactionCategory.ENTERTAINMENT,
      "id-2": TransactionCategory.SAVINGS
    };

    // setup error context mocks
    const mockAddError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, addError: mockAddError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useStoreTransactionCategoryMap(), {
      queryClient,
      customWrapper
    });
    result.current.mutate(testData);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe("Cannot connect to async storage");
    expect(queryClient.getQueryData(queryKey)).toEqual(
      previouslyCachedTransactions
    );
    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);

    expect(mockAddError).toBeCalledTimes(1);
    expect(mockAddError).toBeCalledWith({
      id: "useStoreTransactionCategoryMap",
      error: "AsyncStorage - Store transaction category map",
      errorMessage:
        'There was a problem storing the transaction category map in AsyncStorage: "Cannot connect to async storage"'
    });
  });
});
