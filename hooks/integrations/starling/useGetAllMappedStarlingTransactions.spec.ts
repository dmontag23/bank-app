import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import {mapStarlingTransactionToInternalTransaction} from "./starlingMappings";
import useGetAllMappedStarlingTransactions from "./useGetAllMappedStarlingTransactions";
import useGetStarlingAccounts from "./useGetStarlingAccounts";
import useGetStarlingTransactions from "./useGetStarlingTransactions";

import {STARLING_FEED_ITEM_1} from "../../../mock-server/starling/data/feedData";
import {Category} from "../../../types/transaction";
import useMapTransactionsToInternalTransactions from "../../transactions/useMapTransactionsToInternalTransactions";

jest.mock("./starlingMappings");
jest.mock("./useGetStarlingAccounts");
jest.mock("./useGetStarlingTransactions");
jest.mock("../../transactions/useMapTransactionsToInternalTransactions");

describe("useGetAllMappedStarlingTransactions", () => {
  test("can pass in date range", async () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetStarlingAccounts as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: true,
      isRefetching: false,
      data: undefined,
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetStarlingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      isRefetching: false,
      data: []
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useMapTransactionsToInternalTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      transactions: []
    });

    renderHook(() =>
      useGetAllMappedStarlingTransactions({
        dateRange: {
          from: new Date("01-01-2022"),
          to: new Date("01-01-2023")
        }
      })
    );

    expect(useGetStarlingTransactions).toBeCalledTimes(1);
    expect(useGetStarlingTransactions).toBeCalledWith({
      ids: [],
      dateRange: {
        from: new Date("01-01-2022"),
        to: new Date("01-01-2023")
      },
      enabled: false
    });
  });

  test("returns a loading status if loading accounts", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetStarlingAccounts as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: true,
      isRefetching: false,
      data: undefined,
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetStarlingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: []
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useMapTransactionsToInternalTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      transactions: []
    });

    // run hook
    const {result} = renderHook(() => useGetAllMappedStarlingTransactions());

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.transactions).toEqual([]);
    expect(useGetStarlingAccounts).toBeCalledTimes(1);
    expect(useGetStarlingAccounts).toBeCalledWith();
    expect(useGetStarlingTransactions).toBeCalledTimes(1);
    expect(useGetStarlingTransactions).toBeCalledWith({
      ids: [],
      dateRange: undefined,
      enabled: false
    });
    expect(useMapTransactionsToInternalTransactions).toBeCalledTimes(1);
    expect(useMapTransactionsToInternalTransactions).toBeCalledWith({
      transactions: [],
      mapTransactionToInternalTransaction:
        mapStarlingTransactionToInternalTransaction,
      enabled: false
    });
  });

  test("returns a loading status if loading transactions", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetStarlingAccounts as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [{accountUid: "account-1", defaultCategory: "category-1"}],
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetStarlingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      isRefetching: false,
      data: []
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useMapTransactionsToInternalTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      transactions: []
    });

    // run hook
    const {result} = renderHook(() => useGetAllMappedStarlingTransactions());

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.transactions).toEqual([]);
    expect(useGetStarlingAccounts).toBeCalledTimes(1);
    expect(useGetStarlingAccounts).toBeCalledWith();
    expect(useGetStarlingTransactions).toBeCalledTimes(1);
    expect(useGetStarlingTransactions).toBeCalledWith({
      ids: [{accountId: "account-1", categoryId: "category-1"}],
      dateRange: undefined,
      enabled: true
    });
    expect(useMapTransactionsToInternalTransactions).toBeCalledTimes(1);
    expect(useMapTransactionsToInternalTransactions).toBeCalledWith({
      transactions: [],
      mapTransactionToInternalTransaction:
        mapStarlingTransactionToInternalTransaction,
      enabled: false
    });
  });

  test("returns a loading status if loading the category map", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetStarlingAccounts as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [{accountUid: "account-1", defaultCategory: "category-1"}],
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetStarlingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [STARLING_FEED_ITEM_1]
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useMapTransactionsToInternalTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      transactions: []
    });

    // run hook
    const {result} = renderHook(() => useGetAllMappedStarlingTransactions());

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.isRefetching).toBe(false);
    expect(result.current.transactions).toEqual([]);
    expect(useGetStarlingTransactions).toBeCalledTimes(1);
    expect(useGetStarlingTransactions).toBeCalledWith({
      ids: [{accountId: "account-1", categoryId: "category-1"}],
      dateRange: undefined,
      enabled: true
    });
    expect(useMapTransactionsToInternalTransactions).toBeCalledTimes(1);
    expect(useMapTransactionsToInternalTransactions).toBeCalledWith({
      transactions: [STARLING_FEED_ITEM_1],
      mapTransactionToInternalTransaction:
        mapStarlingTransactionToInternalTransaction,
      enabled: true
    });
  });

  test("returns an empty list when there are no transactions", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetStarlingAccounts as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [{accountUid: "account-1", defaultCategory: "category-1"}],
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetStarlingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: []
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useMapTransactionsToInternalTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      transactions: []
    });

    // run hook
    const {result} = renderHook(() => useGetAllMappedStarlingTransactions());

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([]);
    expect(useGetStarlingTransactions).toBeCalledTimes(1);
    expect(useGetStarlingTransactions).toBeCalledWith({
      ids: [{accountId: "account-1", categoryId: "category-1"}],
      dateRange: undefined,
      enabled: true
    });
    expect(useMapTransactionsToInternalTransactions).toBeCalledTimes(1);
    expect(useMapTransactionsToInternalTransactions).toBeCalledWith({
      transactions: [],
      mapTransactionToInternalTransaction:
        mapStarlingTransactionToInternalTransaction,
      enabled: false
    });
  });

  test("disables transaction data call if the accounts are refetching", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetStarlingAccounts as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: true,
      data: [{accountUid: "account-1", defaultCategory: "category-1"}],
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetStarlingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [STARLING_FEED_ITEM_1]
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useMapTransactionsToInternalTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      transactions: [STARLING_FEED_ITEM_1]
    });

    // run hook
    const {result} = renderHook(() => useGetAllMappedStarlingTransactions());

    // assertions
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRefetching).toBe(true);
    expect(result.current.transactions).toEqual([STARLING_FEED_ITEM_1]);
    expect(useGetStarlingTransactions).toBeCalledTimes(1);
    expect(useGetStarlingTransactions).toBeCalledWith({
      ids: [{accountId: "account-1", categoryId: "category-1"}],
      dateRange: undefined,
      enabled: false
    });
    expect(useMapTransactionsToInternalTransactions).toBeCalledTimes(1);
    expect(useMapTransactionsToInternalTransactions).toBeCalledWith({
      transactions: [STARLING_FEED_ITEM_1],
      mapTransactionToInternalTransaction:
        mapStarlingTransactionToInternalTransaction,
      enabled: true
    });
  });

  test("returns a refetching status if refetching the starling trxs", () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetStarlingAccounts as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [{accountUid: "account-1", defaultCategory: "category-1"}],
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetStarlingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: true,
      data: []
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useMapTransactionsToInternalTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      transactions: [STARLING_FEED_ITEM_1]
    });

    // run hook
    const {result} = renderHook(() => useGetAllMappedStarlingTransactions());

    // assertions
    expect(result.current.isRefetching).toBe(true);
    expect(result.current.transactions).toEqual([STARLING_FEED_ITEM_1]);
  });

  test("uses transactions from mapping", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetStarlingAccounts as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [{accountUid: "account-1", defaultCategory: "category-1"}],
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetStarlingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [STARLING_FEED_ITEM_1]
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useMapTransactionsToInternalTransactions as jest.MockedFunction<any>
    ).mockReturnValue({
      isLoading: false,
      transactions: [
        {
          ...STARLING_FEED_ITEM_1,
          category: Category.EATING_OUT
        }
      ]
    });

    // run hook
    const {result} = renderHook(() => useGetAllMappedStarlingTransactions());

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([
      {
        ...STARLING_FEED_ITEM_1,
        category: Category.EATING_OUT
      }
    ]);
    expect(useGetStarlingTransactions).toBeCalledTimes(1);
    expect(useGetStarlingTransactions).toBeCalledWith({
      ids: [{accountId: "account-1", categoryId: "category-1"}],
      dateRange: undefined,
      enabled: true
    });
    expect(useMapTransactionsToInternalTransactions).toBeCalledTimes(1);
    expect(useMapTransactionsToInternalTransactions).toBeCalledWith({
      transactions: [STARLING_FEED_ITEM_1],
      mapTransactionToInternalTransaction:
        mapStarlingTransactionToInternalTransaction,
      enabled: true
    });
  });

  test("refetches all data", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    const mockCardRefetch = jest.fn();
    (useGetStarlingAccounts as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [{accountUid: "account-1", defaultCategory: "category-1"}],
      refetch: mockCardRefetch
    });
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetStarlingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [STARLING_FEED_ITEM_1]
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useMapTransactionsToInternalTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      transactions: [STARLING_FEED_ITEM_1]
    });

    // run hook
    const {result} = renderHook(() => useGetAllMappedStarlingTransactions());

    result.current.refetch();

    // assertions
    expect(mockCardRefetch).toBeCalledTimes(1);
    expect(mockCardRefetch).toBeCalledWith();
  });
});
