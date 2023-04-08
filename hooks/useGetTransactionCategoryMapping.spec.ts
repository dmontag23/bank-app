import AsyncStorage from "@react-native-async-storage/async-storage";
import {renderHook, waitFor} from "@testing-library/react-native";

import useGetTransactionCategoryMapping from "./useGetTransactionCategoryMapping";

import {tanstackQueryTestWrapper} from "../tests/mocks/utils";
import {TransactionCategory} from "../types/transaction";

describe("useGetTransactionCategoryMapping", () => {
  test("returns an empty map when called with no transactions", async () => {
    const {result} = renderHook(
      () => useGetTransactionCategoryMapping({transactionIds: []}),
      {
        wrapper: tanstackQueryTestWrapper
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
      () =>
        useGetTransactionCategoryMapping({transactionIds: ["id-1", "id-2"]}),
      {
        wrapper: tanstackQueryTestWrapper
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
      () =>
        useGetTransactionCategoryMapping({transactionIds: [], enabled: false}),
      {
        wrapper: tanstackQueryTestWrapper
      }
    );

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.isFetching).toBe(false);
    expect(AsyncStorage.multiGet).not.toBeCalled();
  });
});
