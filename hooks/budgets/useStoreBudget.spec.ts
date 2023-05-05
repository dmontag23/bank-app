import AsyncStorage from "@react-native-async-storage/async-storage";
import {renderHook, waitFor} from "@testing-library/react-native";

import useStoreBudget from "./useStoreBudget";

import {
  BUDGET_WITH_NO_ITEMS,
  BUDGET_WITH_ONE_ITEM
} from "../../tests/mocks/data/budgets";
import {
  TanstackQueryTestWrapper,
  testQueryClient
} from "../../tests/mocks/utils";
import {Budget} from "../../types/budget";

describe("useStoreBudget", () => {
  test("stores a budget", async () => {
    // put some test data in the cache
    const previouslyCachedBudget = BUDGET_WITH_NO_ITEMS;
    const queryKey = ["budgets"];
    testQueryClient.setQueryData<Budget>(
      queryKey,
      () => previouslyCachedBudget
    );

    const {result} = renderHook(() => useStoreBudget(), {
      wrapper: TanstackQueryTestWrapper
    });
    result.current.mutate(BUDGET_WITH_ONE_ITEM);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(BUDGET_WITH_ONE_ITEM);
    expect(AsyncStorage.setItem).toBeCalledTimes(1);
    expect(AsyncStorage.setItem).toBeCalledWith(
      `budget-${BUDGET_WITH_ONE_ITEM.id}`,
      JSON.stringify(BUDGET_WITH_ONE_ITEM)
    );
    expect(
      await AsyncStorage.getItem(`budget-${BUDGET_WITH_ONE_ITEM.id}`)
    ).toEqual(JSON.stringify(BUDGET_WITH_ONE_ITEM));
    expect(testQueryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
  });

  test("errors on failed storage call", async () => {
    // setup mock for async storage
    const mockAsyncStorageStoreBudget =
      AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;
    mockAsyncStorageStoreBudget.mockImplementation(() =>
      Promise.reject("Cannot connect to async storage")
    );

    // put some test data in the cache
    const previouslyCachedBudget = BUDGET_WITH_NO_ITEMS;
    const queryKey = ["budgets"];
    testQueryClient.setQueryData<Budget>(
      queryKey,
      () => previouslyCachedBudget
    );

    const {result} = renderHook(() => useStoreBudget(), {
      wrapper: TanstackQueryTestWrapper
    });
    result.current.mutate(BUDGET_WITH_ONE_ITEM);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe("Cannot connect to async storage");
    expect(testQueryClient.getQueryData(queryKey)).toEqual(
      previouslyCachedBudget
    );
    expect(testQueryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
  });
});
