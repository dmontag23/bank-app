import {
  createQueryClient,
  renderHook,
  waitFor
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useDeleteBudget from "./useDeleteBudget";

import {
  BUDGET_WITH_NO_ITEMS,
  BUDGET_WITH_ONE_ITEM
} from "../../tests/mocks/data/budgets";
import {Budget} from "../../types/budget";

describe("useDeleteBudget", () => {
  test("handles a budget with ID not in storage", async () => {
    const {result} = renderHook(() => useDeleteBudget());
    result.current.mutate("id-not-in-storage");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
    expect(AsyncStorage.removeItem).toBeCalledTimes(1);
    expect(AsyncStorage.removeItem).toBeCalledWith("budget-id-not-in-storage");
  });

  test("deletes a budget", async () => {
    const queryClient = createQueryClient();

    // put some test data in the cache
    const previouslyCachedBudget = BUDGET_WITH_NO_ITEMS;
    const queryKey = ["budgets"];
    queryClient.setQueryData<Budget>(queryKey, () => previouslyCachedBudget);

    // put test data in Async storage
    const testBudgetId = `budget-${BUDGET_WITH_ONE_ITEM.id}`;
    AsyncStorage.setItem(testBudgetId, JSON.stringify(BUDGET_WITH_ONE_ITEM));
    expect(await AsyncStorage.getItem(testBudgetId)).toEqual(
      JSON.stringify(BUDGET_WITH_ONE_ITEM)
    );

    const {result} = renderHook(() => useDeleteBudget(), {queryClient});
    result.current.mutate(BUDGET_WITH_ONE_ITEM.id);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
    expect(AsyncStorage.removeItem).toBeCalledTimes(1);
    expect(AsyncStorage.removeItem).toBeCalledWith(testBudgetId);
    expect(await AsyncStorage.getItem(testBudgetId)).toBeNull();
    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
  });

  test("errors on failed storage call", async () => {
    const queryClient = createQueryClient();

    // setup mock for async storage
    const mockAsyncStorageStoreBudget =
      AsyncStorage.removeItem as jest.MockedFunction<
        typeof AsyncStorage.removeItem
      >;
    mockAsyncStorageStoreBudget.mockImplementation(() =>
      Promise.reject("Cannot connect to async storage")
    );

    // put some test data in the cache
    const previouslyCachedBudget = BUDGET_WITH_NO_ITEMS;
    const queryKey = ["budgets"];
    queryClient.setQueryData<Budget>(queryKey, () => previouslyCachedBudget);

    const {result} = renderHook(() => useDeleteBudget(), {queryClient});
    result.current.mutate("dummy-id");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe("Cannot connect to async storage");
    expect(queryClient.getQueryData(queryKey)).toEqual(previouslyCachedBudget);
    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
  });
});
