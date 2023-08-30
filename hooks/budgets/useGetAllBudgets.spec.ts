import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useGetAllBudgets from "./useGetAllBudgets";

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

    const {result} = renderHook(() => useGetAllBudgets());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([
      BUDGET_WITH_NO_ITEMS,
      BUDGET_NO_NAME_OR_ITEMS
    ]);
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

    const {result} = renderHook(() => useGetAllBudgets());

    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() =>
      expect(result.current.error).toBe(
        "Cannot connect to async storage - get all keys"
      )
    );
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

    const {result} = renderHook(() => useGetAllBudgets());

    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() =>
      expect(result.current.error).toBe(
        "Cannot connect to async storage - multi get"
      )
    );
  });
});
