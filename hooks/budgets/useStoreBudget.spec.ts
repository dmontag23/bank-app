import {
  createQueryClient,
  renderHook,
  waitFor
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useStoreBudget from "./useStoreBudget";

import {
  BUDGET_WITH_NO_ITEMS,
  BUDGET_WITH_ONE_ITEM
} from "../../tests/mocks/data/budgets";
import {Budget} from "../../types/budget";

describe("useStoreBudget", () => {
  test("stores a budget", async () => {
    const queryClient = createQueryClient();

    // put some test data in the cache
    const previouslyCachedBudget = BUDGET_WITH_NO_ITEMS;
    const queryKey = ["budgets"];
    queryClient.setQueryData<Budget>(queryKey, () => previouslyCachedBudget);

    const {result} = renderHook(() => useStoreBudget(), {queryClient});
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
    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
  });

  test("errors on failed storage call", async () => {
    const queryClient = createQueryClient();

    // setup mock for async storage
    (
      AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>
    ).mockImplementation(() =>
      Promise.reject("Cannot connect to async storage")
    );

    // put some test data in the cache
    const previouslyCachedBudget = BUDGET_WITH_NO_ITEMS;
    const queryKey = ["budgets"];
    queryClient.setQueryData<Budget>(queryKey, () => previouslyCachedBudget);

    const {result} = renderHook(() => useStoreBudget(), {queryClient});
    result.current.mutate(BUDGET_WITH_ONE_ITEM);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe("Cannot connect to async storage");
    expect(queryClient.getQueryData(queryKey)).toEqual(previouslyCachedBudget);
    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
  });
});
