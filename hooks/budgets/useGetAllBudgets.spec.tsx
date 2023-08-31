import React, {ReactNode} from "react";
import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useGetAllBudgets from "./useGetAllBudgets";

import ErrorContext, {defaultErrorContext} from "../../store/error-context";
import {
  BUDGET_NO_NAME_OR_ITEMS,
  BUDGET_WITH_NO_ITEMS
} from "../../tests/mocks/data/budgets";
import {TransactionCategory} from "../../types/transaction";

describe("useGetAllBudgets", () => {
  test("returns an empty list if there are no stored items", async () => {
    const {result} = renderHook(() => useGetAllBudgets());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([]);
  });

  test("returns an empty list if there are no stored budgets", async () => {
    // setup AsyncStorage with mock data
    await AsyncStorage.setItem("id-2", TransactionCategory.BILLS);

    const {result} = renderHook(() => useGetAllBudgets());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([]);
  });

  test("returns list of stored budgets", async () => {
    // setup AsyncStorage with mock data
    await AsyncStorage.multiSet([
      [
        `budget-${BUDGET_WITH_NO_ITEMS.id}`,
        JSON.stringify(BUDGET_WITH_NO_ITEMS)
      ],
      [
        `budget-${BUDGET_NO_NAME_OR_ITEMS.id}`,
        JSON.stringify(BUDGET_NO_NAME_OR_ITEMS)
      ]
    ]);

    // setup error context mocks
    const mockRemoveError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, removeError: mockRemoveError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useGetAllBudgets(), {customWrapper});

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([
      BUDGET_WITH_NO_ITEMS,
      BUDGET_NO_NAME_OR_ITEMS
    ]);

    expect(mockRemoveError).toBeCalledTimes(1);
    expect(mockRemoveError).toBeCalledWith("useGetAllBudgets");
  });

  test("returns error on failed call to getAllKeys", async () => {
    // setup mock for async storage
    const mockAsyncStorageGetAllKeys =
      AsyncStorage.getAllKeys as jest.MockedFunction<
        typeof AsyncStorage.getAllKeys
      >;
    mockAsyncStorageGetAllKeys.mockImplementationOnce(() =>
      Promise.reject("Cannot connect to async storage - get all keys")
    );

    // setup error context mocks
    const mockAddError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, addError: mockAddError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useGetAllBudgets(), {customWrapper});

    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() =>
      expect(result.current.error).toBe(
        "Cannot connect to async storage - get all keys"
      )
    );

    expect(mockAddError).toBeCalledTimes(1);
    expect(mockAddError).toBeCalledWith({
      id: "useGetAllBudgets",
      error: "AsyncStorage - Get All Budgets",
      errorMessage:
        'There was a problem getting all budgets from AsyncStorage: "Cannot connect to async storage - get all keys"'
    });
  });

  test("returns error on failed call to multiGet", async () => {
    // setup mock for async storage
    const mockAsyncStorageMultiGet =
      AsyncStorage.multiGet as jest.MockedFunction<
        typeof AsyncStorage.multiGet
      >;
    mockAsyncStorageMultiGet.mockImplementationOnce(() =>
      Promise.reject("Cannot connect to async storage - multi get")
    );

    // setup error context mocks
    const mockAddError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, addError: mockAddError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useGetAllBudgets(), {customWrapper});

    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() =>
      expect(result.current.error).toBe(
        "Cannot connect to async storage - multi get"
      )
    );

    expect(mockAddError).toBeCalledTimes(1);
    expect(mockAddError).toBeCalledWith({
      id: "useGetAllBudgets",
      error: "AsyncStorage - Get All Budgets",
      errorMessage:
        'There was a problem getting all budgets from AsyncStorage: "Cannot connect to async storage - multi get"'
    });
  });
});
