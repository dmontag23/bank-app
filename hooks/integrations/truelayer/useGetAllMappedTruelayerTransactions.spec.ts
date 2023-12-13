import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import {mapTrueLayerTransactionToInternalTransaction} from "./trueLayerMappings";
import useGetAllMappedTruelayerTransactions from "./useGetAllMappedTruelayerTransactions";
import useGetAllTruelayerCards from "./useGetAllTruelayerCards";
import useGetAllTruelayerTransactions from "./useGetAllTruelayerTransactions";

import {TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS} from "../../../mock-server/truelayer/data/cardTransactionData";
import {Category} from "../../../types/transaction";
import useMapTransactionsToInternalTransactions from "../../transactions/useMapTransactionsToInternalTransactions";

jest.mock("./trueLayerMappings");
jest.mock("./useGetAllTruelayerCards");
jest.mock("./useGetAllTruelayerTransactions");
jest.mock("../../transactions/useMapTransactionsToInternalTransactions");

describe("useGetAllMappedTruelayerTransactions", () => {
  test("can pass in date range", async () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetAllTruelayerCards as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: true,
      isRefetching: false,
      data: undefined,
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllTruelayerTransactions as jest.MockedFunction<any>
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
      useGetAllMappedTruelayerTransactions({
        dateRange: {
          from: new Date("01-01-2022"),
          to: new Date("01-01-2023")
        }
      })
    );

    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith({
      cardIds: [],
      dateRange: {
        from: new Date("01-01-2022"),
        to: new Date("01-01-2023")
      },
      enabled: false
    });
  });

  test("returns a loading status if loading truelayer cards", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetAllTruelayerCards as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: true,
      isRefetching: false,
      data: undefined,
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllTruelayerTransactions as jest.MockedFunction<any>
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
    const {result} = renderHook(() => useGetAllMappedTruelayerTransactions());

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.transactions).toEqual([]);
    expect(useGetAllTruelayerCards).toBeCalledTimes(1);
    expect(useGetAllTruelayerCards).toBeCalledWith();
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith({
      cardIds: [],
      dateRange: undefined,
      enabled: false
    });
    expect(useMapTransactionsToInternalTransactions).toBeCalledTimes(1);
    expect(useMapTransactionsToInternalTransactions).toBeCalledWith({
      transactions: [],
      mapTransactionToInternalTransaction:
        mapTrueLayerTransactionToInternalTransaction,
      enabled: false
    });
  });

  test("returns a loading status if loading truelayer transactions", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetAllTruelayerCards as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [{account_id: "card-1"}],
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllTruelayerTransactions as jest.MockedFunction<any>
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
    const {result} = renderHook(() => useGetAllMappedTruelayerTransactions());

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.transactions).toEqual([]);
    expect(useGetAllTruelayerCards).toBeCalledTimes(1);
    expect(useGetAllTruelayerCards).toBeCalledWith();
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith({
      cardIds: ["card-1"],
      dateRange: undefined,
      enabled: true
    });
    expect(useMapTransactionsToInternalTransactions).toBeCalledTimes(1);
    expect(useMapTransactionsToInternalTransactions).toBeCalledWith({
      transactions: [],
      mapTransactionToInternalTransaction:
        mapTrueLayerTransactionToInternalTransaction,
      enabled: false
    });
  });

  test("returns a loading status if loading the category map", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetAllTruelayerCards as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [{account_id: "card-1"}],
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
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
    const {result} = renderHook(() => useGetAllMappedTruelayerTransactions());

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.isRefetching).toBe(false);
    expect(result.current.transactions).toEqual([]);
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith({
      cardIds: ["card-1"],
      dateRange: undefined,
      enabled: true
    });
    expect(useMapTransactionsToInternalTransactions).toBeCalledTimes(1);
    expect(useMapTransactionsToInternalTransactions).toBeCalledWith({
      transactions: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS],
      mapTransactionToInternalTransaction:
        mapTrueLayerTransactionToInternalTransaction,
      enabled: true
    });
  });

  test("returns a refetching status if refetching trxs", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetAllTruelayerCards as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [{account_id: "card-1"}],
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: true,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useMapTransactionsToInternalTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      transactions: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    });

    // run hook
    const {result} = renderHook(() => useGetAllMappedTruelayerTransactions());

    // assertions
    await waitFor(() =>
      expect(result.current.transactions).toEqual([
        TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
      ])
    );
    expect(result.current.isRefetching).toBe(true);
  });

  test("returns an empty list when there are no transactions", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetAllTruelayerCards as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [{account_id: "card-1"}],
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllTruelayerTransactions as jest.MockedFunction<any>
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
    const {result} = renderHook(() => useGetAllMappedTruelayerTransactions());

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([]);
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith({
      cardIds: ["card-1"],
      dateRange: undefined,
      enabled: true
    });
    expect(useMapTransactionsToInternalTransactions).toBeCalledTimes(1);
    expect(useMapTransactionsToInternalTransactions).toBeCalledWith({
      transactions: [],
      mapTransactionToInternalTransaction:
        mapTrueLayerTransactionToInternalTransaction,
      enabled: false
    });
  });

  test("disables transaction data call if the cards are refetching", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetAllTruelayerCards as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: true,
      data: [{account_id: "card-1"}],
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useMapTransactionsToInternalTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      transactions: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    });

    // run hook
    const {result} = renderHook(() => useGetAllMappedTruelayerTransactions());

    // assertions
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRefetching).toBe(true);
    expect(result.current.transactions).toEqual([
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
    ]);
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith({
      cardIds: ["card-1"],
      dateRange: undefined,
      enabled: false
    });
    expect(useMapTransactionsToInternalTransactions).toBeCalledTimes(1);
    expect(useMapTransactionsToInternalTransactions).toBeCalledWith({
      transactions: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS],
      mapTransactionToInternalTransaction:
        mapTrueLayerTransactionToInternalTransaction,
      enabled: true
    });
  });

  test("uses transactions from mapping", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetAllTruelayerCards as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [{account_id: "card-1"}],
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
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
          ...TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
          category: Category.EATING_OUT
        }
      ]
    });

    // run hook
    const {result} = renderHook(() => useGetAllMappedTruelayerTransactions());

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([
      {
        ...TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
        category: Category.EATING_OUT
      }
    ]);
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith({
      cardIds: ["card-1"],
      dateRange: undefined,
      enabled: true
    });
    expect(useMapTransactionsToInternalTransactions).toBeCalledTimes(1);
    expect(useMapTransactionsToInternalTransactions).toBeCalledWith({
      transactions: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS],
      mapTransactionToInternalTransaction:
        mapTrueLayerTransactionToInternalTransaction,
      enabled: true
    });
  });

  test("refetches all data", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    const mockCardRefetch = jest.fn();
    (useGetAllTruelayerCards as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [{account_id: "card-1"}],
      refetch: mockCardRefetch
    });
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useMapTransactionsToInternalTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      transactions: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    });

    // run hook
    const {result} = renderHook(() => useGetAllMappedTruelayerTransactions());

    result.current.refetch();

    // assertions
    expect(mockCardRefetch).toBeCalledTimes(1);
    expect(mockCardRefetch).toBeCalledWith();
  });
});
