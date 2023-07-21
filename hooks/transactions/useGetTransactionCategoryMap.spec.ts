import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {renderHook, waitFor} from "@testing-library/react-native";

import useGetTransactionCategoryMap from "./useGetTransactionCategoryMap";

import {TanstackQueryTestWrapper} from "../../tests/mocks/utils";
import {TransactionCategory} from "../../types/transaction";

describe("useGetTransactionCategoryMap", () => {
  test("returns an empty map when called with no transactions", async () => {
    const {result} = renderHook(
      () => useGetTransactionCategoryMap({transactionIds: []}),
      {
        wrapper: TanstackQueryTestWrapper
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({});
    expect(AsyncStorage.multiGet).toBeCalledTimes(1);
    expect(AsyncStorage.multiGet).toBeCalledWith([]);
  });

  test("returns a map where only some values are retrieved from storage", async () => {
    // setup AsyncStorage with mock data
    await AsyncStorage.setItem("id-2", TransactionCategory.BILLS);

    const {result} = renderHook(
      () => useGetTransactionCategoryMap({transactionIds: ["id-1", "id-2"]}),
      {
        wrapper: TanstackQueryTestWrapper
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({
      "id-1": null,
      "id-2": TransactionCategory.BILLS
    });
    expect(AsyncStorage.multiGet).toBeCalledTimes(1);
    expect(AsyncStorage.multiGet).toBeCalledWith(["id-1", "id-2"]);
  });

  test("does not fetch from storage when disabled", async () => {
    const {result} = renderHook(
      () => useGetTransactionCategoryMap({transactionIds: [], enabled: false}),
      {
        wrapper: TanstackQueryTestWrapper
      }
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

    const {result} = renderHook(
      () => useGetTransactionCategoryMap({transactionIds: []}),
      {
        wrapper: TanstackQueryTestWrapper
      }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe("Cannot connect to async storage");
  });
});
