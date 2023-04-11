import AsyncStorage from "@react-native-async-storage/async-storage";
import {renderHook, waitFor} from "@testing-library/react-native";

import useStoreTransactionCategoryMap from "./useStoreTransactionCategoryMap";

import {TanstackQueryTestWrapper, testQueryClient} from "../tests/mocks/utils";
import {
  TransactionCategory,
  TransactionIDToCategoryMapping
} from "../types/transaction";

describe("useStoreTransactionCategoryMap", () => {
  test("does not store anything when called with an empty map", async () => {
    const {result} = renderHook(() => useStoreTransactionCategoryMap(), {
      wrapper: TanstackQueryTestWrapper
    });
    result.current.mutate({});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({});
    expect(AsyncStorage.multiSet).not.toBeCalled();
  });

  test("does not update the cache on success when called with an empty map", async () => {
    const {result} = renderHook(() => useStoreTransactionCategoryMap(), {
      wrapper: TanstackQueryTestWrapper
    });
    result.current.mutate({});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      testQueryClient.getQueryData(["transactionCategoryMapping"])
    ).toBeUndefined();
  });

  test("stores transaction map correctly", async () => {
    const testData: TransactionIDToCategoryMapping = {
      "id-1": TransactionCategory.BILLS,
      "id-2": TransactionCategory.UNKNOWN
    };

    const {result} = renderHook(() => useStoreTransactionCategoryMap(), {
      wrapper: TanstackQueryTestWrapper
    });
    result.current.mutate(testData);

    const expectedDataInAsyncStorage = [
      ["id-1", TransactionCategory.BILLS],
      ["id-2", TransactionCategory.UNKNOWN]
    ];
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(testData);
    expect(AsyncStorage.multiSet).toBeCalledTimes(1);
    expect(AsyncStorage.multiSet).toBeCalledWith(expectedDataInAsyncStorage);
    expect(await AsyncStorage.multiGet(Object.keys(testData))).toEqual(
      expectedDataInAsyncStorage
    );
  });

  test("optimistically updates the cache on a successful storage call with previously cached data", async () => {
    // put some test data in the cache
    const previouslyCachedTransactions: TransactionIDToCategoryMapping = {
      "id-1": TransactionCategory.BILLS,
      "id-2": TransactionCategory.EATING_OUT
    };
    const queryKey = ["transactionCategoryMapping", "id-1", "id-2"];
    testQueryClient.setQueryData<TransactionIDToCategoryMapping>(
      queryKey,
      () => previouslyCachedTransactions
    );

    const testData: TransactionIDToCategoryMapping = {
      "id-1": TransactionCategory.ENTERTAINMENT,
      "id-2": TransactionCategory.SAVINGS
    };

    const {result} = renderHook(() => useStoreTransactionCategoryMap(), {
      wrapper: TanstackQueryTestWrapper
    });
    result.current.mutate(testData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(testQueryClient.getQueryData(queryKey)).toEqual(testData);
    expect(testQueryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
  });

  test("optimistically updates the cache on a successful storage call with no cached data", async () => {
    const queryKey = ["transactionCategoryMapping", "id-1", "id-2"];
    const testData: TransactionIDToCategoryMapping = {
      "id-1": TransactionCategory.ENTERTAINMENT,
      "id-2": TransactionCategory.SAVINGS
    };

    const {result} = renderHook(() => useStoreTransactionCategoryMap(), {
      wrapper: TanstackQueryTestWrapper
    });
    result.current.mutate(testData);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(testQueryClient.getQueryData(queryKey)).toEqual(testData);
    expect(testQueryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
  });

  test("rolls back an optimistic update on a failed storage call with previously cache data", async () => {
    // setup mock for async storage
    const mockAsyncStorageMultiSet =
      AsyncStorage.multiSet as jest.MockedFunction<
        typeof AsyncStorage.multiSet
      >;
    mockAsyncStorageMultiSet.mockImplementationOnce(() =>
      Promise.reject("Cannot connect to async storage")
    );

    // put some test data in the cache
    const previouslyCachedTransactions: TransactionIDToCategoryMapping = {
      "id-1": TransactionCategory.BILLS,
      "id-2": TransactionCategory.EATING_OUT
    };
    const queryKey = ["transactionCategoryMapping", "id-1", "id-2"];
    testQueryClient.setQueryData<TransactionIDToCategoryMapping>(
      queryKey,
      () => previouslyCachedTransactions
    );
    const testData: TransactionIDToCategoryMapping = {
      "id-1": TransactionCategory.ENTERTAINMENT,
      "id-2": TransactionCategory.SAVINGS
    };

    const {result} = renderHook(() => useStoreTransactionCategoryMap(), {
      wrapper: TanstackQueryTestWrapper
    });
    result.current.mutate(testData);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(testQueryClient.getQueryData(queryKey)).toEqual(
      previouslyCachedTransactions
    );
    expect(testQueryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
  });

  test("rolls back an optimistic update on a failed storage call with no cached data", async () => {
    // setup mock for async storage
    const mockAsyncStorageMultiSet =
      AsyncStorage.multiSet as jest.MockedFunction<
        typeof AsyncStorage.multiSet
      >;
    mockAsyncStorageMultiSet.mockImplementationOnce(() =>
      Promise.reject("Cannot connect to async storage")
    );

    const queryKey = ["transactionCategoryMapping", "id-1", "id-2"];
    const testData: TransactionIDToCategoryMapping = {
      "id-1": TransactionCategory.ENTERTAINMENT,
      "id-2": TransactionCategory.SAVINGS
    };

    const {result} = renderHook(() => useStoreTransactionCategoryMap(), {
      wrapper: TanstackQueryTestWrapper
    });
    result.current.mutate(testData);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(testQueryClient.getQueryData(queryKey)).toBeUndefined();
  });

  test("correctly cancels existing queries", async () => {
    const {result} = renderHook(() => useStoreTransactionCategoryMap(), {
      wrapper: TanstackQueryTestWrapper
    });

    expect(testQueryClient.isFetching()).toEqual(0);

    // setup a query that takes 5 seconds to complete
    testQueryClient.fetchQuery({
      queryKey: ["transactionCategoryMapping"],
      queryFn: ({signal}) =>
        // TODO: might want to move the function below into a helper function
        // Might also not want to test this functionality with real timers and somehow
        // use mocked timers instead. See https://github.com/facebook/jest/issues/2157.
        new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => resolve, 5000);
          const listener = () => {
            clearTimeout(timer);
            reject("Aborted the query");
          };
          signal?.addEventListener("abort", listener);
        })
    });

    expect(testQueryClient.isFetching()).toEqual(1);

    result.current.mutate({"id-1": TransactionCategory.BILLS});
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(testQueryClient.isFetching()).toEqual(0);
  });
});
