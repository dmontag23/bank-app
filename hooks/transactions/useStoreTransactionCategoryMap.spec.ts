import {
  createQueryClient,
  renderHook,
  waitFor
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useStoreTransactionCategoryMap from "./useStoreTransactionCategoryMap";

import {
  TransactionCategory,
  TransactionIDToCategoryMapping
} from "../../types/transaction";

describe("useStoreTransactionCategoryMap", () => {
  test("does not store anything when called with an empty map", async () => {
    const {result} = renderHook(() => useStoreTransactionCategoryMap());
    result.current.mutate({});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({});
    expect(AsyncStorage.multiSet).not.toBeCalled();
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
      ["id-1", TransactionCategory.SAVINGS],
      ["id-2", TransactionCategory.UNKNOWN]
    ];
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(testData);
    expect(AsyncStorage.multiSet).toBeCalledTimes(1);
    expect(AsyncStorage.multiSet).toBeCalledWith(expectedDataInAsyncStorage);
    expect(await AsyncStorage.multiGet(Object.keys(testData))).toEqual(
      expectedDataInAsyncStorage
    );
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

    const {result} = renderHook(() => useStoreTransactionCategoryMap(), {
      queryClient
    });
    result.current.mutate(testData);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe("Cannot connect to async storage");
    expect(queryClient.getQueryData(queryKey)).toEqual(
      previouslyCachedTransactions
    );
    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
  });
});
