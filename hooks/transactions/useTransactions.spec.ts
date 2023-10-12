import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import useGetTransactionCategoryMap from "./useGetTransactionCategoryMap";
import useStoreTransactionCategoryMap from "./useStoreTransactionCategoryMap";
import useTransactions from "./useTransactions";

import {EATING_OUT_CARD_TRANSACTION} from "../../tests/mocks/data/transactions";
import {TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS} from "../../tests/mocks/trueLayer/dataAPI/data/cardTransactionData";
import {TransactionCategory} from "../../types/transaction";
import {
  mapTrueLayerCategoryToInternalCategory,
  mapTrueLayerTransactionToInternalTransaction
} from "../integrations/truelayer/trueLayerMappings";
import useGetAllTruelayerCards from "../integrations/truelayer/useGetAllTruelayerCards";
import useGetAllTruelayerTransactions from "../integrations/truelayer/useGetAllTruelayerTransactions";

jest.mock("../integrations/truelayer/trueLayerMappings");
jest.mock("../integrations/truelayer/useGetAllTruelayerCards");
jest.mock("../integrations/truelayer/useGetAllTruelayerTransactions");
jest.mock("./useGetTransactionCategoryMap");
jest.mock("./useStoreTransactionCategoryMap");

describe("useTransactions", () => {
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
      isSuccess: false,
      data: []
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      isSuccess: false,
      data: []
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useStoreTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      mutate: jest.fn()
    });

    renderHook(() =>
      useTransactions({
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
      isSuccess: true,
      data: []
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: true,
      data: []
    });

    const updateStore = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useStoreTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      mutate: updateStore
    });

    // run hook
    const {result} = renderHook(() => useTransactions());

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.transactions).toEqual([]);
    expect(useGetAllTruelayerCards).toBeCalledTimes(1);
    expect(useGetAllTruelayerCards).toBeCalledWith({enabled: true});
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith({
      cardIds: [],
      dateRange: undefined,
      enabled: false
    });
    expect(useGetTransactionCategoryMap).toBeCalledTimes(1);
    expect(useGetTransactionCategoryMap).toBeCalledWith({
      transactionIds: [],
      enabled: true
    });
    expect(useStoreTransactionCategoryMap).toBeCalledTimes(1);
    expect(useStoreTransactionCategoryMap).toBeCalledWith();
    expect(mapTrueLayerCategoryToInternalCategory).not.toBeCalled();
    expect(mapTrueLayerTransactionToInternalTransaction).not.toBeCalled();
    expect(updateStore).not.toBeCalled();
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
      isSuccess: false,
      data: []
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      isSuccess: false,
      data: []
    });

    const updateStore = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useStoreTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      mutate: updateStore
    });

    // run hook
    const {result} = renderHook(() => useTransactions());

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.transactions).toEqual([]);
    expect(useGetAllTruelayerCards).toBeCalledTimes(1);
    expect(useGetAllTruelayerCards).toBeCalledWith({enabled: true});
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith({
      cardIds: ["card-1"],
      dateRange: undefined,
      enabled: true
    });
    expect(useGetTransactionCategoryMap).toBeCalledTimes(1);
    expect(useGetTransactionCategoryMap).toBeCalledWith({
      transactionIds: [],
      enabled: false
    });
    expect(useStoreTransactionCategoryMap).toBeCalledTimes(1);
    expect(useStoreTransactionCategoryMap).toBeCalledWith();
    expect(mapTrueLayerCategoryToInternalCategory).not.toBeCalled();
    expect(mapTrueLayerTransactionToInternalTransaction).not.toBeCalled();
    expect(updateStore).not.toBeCalled();
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
      isSuccess: true,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      isSuccess: false,
      data: []
    });

    const updateStore = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useStoreTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      mutate: updateStore
    });

    // run hook
    const {result} = renderHook(() => useTransactions());

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.transactions).toEqual([]);
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith({
      cardIds: ["card-1"],
      dateRange: undefined,
      enabled: true
    });
    expect(useGetTransactionCategoryMap).toBeCalledTimes(1);
    expect(useGetTransactionCategoryMap).toBeCalledWith({
      transactionIds: ["1234094-shocking-chipotle"],
      enabled: true
    });
    expect(useStoreTransactionCategoryMap).toBeCalledTimes(1);
    expect(useStoreTransactionCategoryMap).toBeCalledWith();
    expect(mapTrueLayerCategoryToInternalCategory).not.toBeCalled();
    expect(mapTrueLayerTransactionToInternalTransaction).not.toBeCalled();
    expect(updateStore).not.toBeCalled();
  });

  test("returns an empty list when there are no truelayer transactions", async () => {
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
      isSuccess: true,
      data: []
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: true,
      data: {}
    });

    const updateStore = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useStoreTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      mutate: updateStore
    });

    // run hook
    const {result} = renderHook(() => useTransactions());

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([]);
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith({
      cardIds: ["card-1"],
      dateRange: undefined,
      enabled: true
    });
    expect(useGetTransactionCategoryMap).toBeCalledTimes(1);
    expect(useGetTransactionCategoryMap).toBeCalledWith({
      transactionIds: [],
      enabled: true
    });
    expect(useStoreTransactionCategoryMap).toBeCalledTimes(1);
    expect(useStoreTransactionCategoryMap).toBeCalledWith();
    expect(mapTrueLayerCategoryToInternalCategory).not.toBeCalled();
    expect(mapTrueLayerTransactionToInternalTransaction).not.toBeCalled();
    expect(updateStore).not.toBeCalled();
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
      isSuccess: true,
      data: []
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: true,
      data: {}
    });

    const updateStore = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useStoreTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      mutate: updateStore
    });

    // run hook
    const {result} = renderHook(() => useTransactions());

    // assertions
    expect(result.current.isLoading).toBe(false);
    expect(result.current.transactions).toEqual([]);
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith({
      cardIds: ["card-1"],
      dateRange: undefined,
      enabled: false
    });
    expect(useGetTransactionCategoryMap).toBeCalledTimes(1);
    expect(useGetTransactionCategoryMap).toBeCalledWith({
      transactionIds: [],
      enabled: true
    });
    expect(useStoreTransactionCategoryMap).toBeCalledTimes(1);
    expect(useStoreTransactionCategoryMap).toBeCalledWith();
    expect(mapTrueLayerCategoryToInternalCategory).not.toBeCalled();
    expect(mapTrueLayerTransactionToInternalTransaction).not.toBeCalled();
    expect(updateStore).not.toBeCalled();
  });

  test("correctly maps truelayer transaction to default category", async () => {
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
      isSuccess: true,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: true,
      data: {}
    });

    const updateStore = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useStoreTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      mutate: updateStore
    });

    (
      mapTrueLayerCategoryToInternalCategory as jest.MockedFunction<
        typeof mapTrueLayerCategoryToInternalCategory
      >
    ).mockReturnValueOnce(TransactionCategory.EATING_OUT);

    (
      mapTrueLayerTransactionToInternalTransaction as jest.MockedFunction<
        typeof mapTrueLayerTransactionToInternalTransaction
      >
    ).mockReturnValueOnce(EATING_OUT_CARD_TRANSACTION);

    // run hook
    const {result} = renderHook(() => useTransactions());

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([EATING_OUT_CARD_TRANSACTION]);
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith({
      cardIds: ["card-1"],
      dateRange: undefined,
      enabled: true
    });
    expect(useGetTransactionCategoryMap).toBeCalledTimes(1);
    expect(useGetTransactionCategoryMap).toBeCalledWith({
      transactionIds: ["1234094-shocking-chipotle"],
      enabled: true
    });
    expect(useStoreTransactionCategoryMap).toBeCalledTimes(1);
    expect(useStoreTransactionCategoryMap).toBeCalledWith();
    expect(mapTrueLayerCategoryToInternalCategory).toBeCalledTimes(1);
    expect(mapTrueLayerCategoryToInternalCategory).toBeCalledWith(
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS.transaction_classification
    );
    expect(mapTrueLayerTransactionToInternalTransaction).toBeCalledTimes(1);
    expect(mapTrueLayerTransactionToInternalTransaction).toBeCalledWith(
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
      TransactionCategory.EATING_OUT
    );
    expect(updateStore).toBeCalledTimes(1);
    expect(updateStore).toBeCalledWith({
      "1234094-shocking-chipotle": TransactionCategory.EATING_OUT
    });
  });

  test("uses category from storage", async () => {
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
      isSuccess: true,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: true,
      data: {"1234094-shocking-chipotle": TransactionCategory.EATING_OUT}
    });

    const updateStore = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useStoreTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      mutate: updateStore
    });

    (
      mapTrueLayerTransactionToInternalTransaction as jest.MockedFunction<
        typeof mapTrueLayerTransactionToInternalTransaction
      >
    ).mockReturnValueOnce(EATING_OUT_CARD_TRANSACTION);

    // run hook
    const {result} = renderHook(() => useTransactions());

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([EATING_OUT_CARD_TRANSACTION]);
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith({
      cardIds: ["card-1"],
      dateRange: undefined,
      enabled: true
    });
    expect(useGetTransactionCategoryMap).toBeCalledTimes(1);
    expect(useGetTransactionCategoryMap).toBeCalledWith({
      transactionIds: ["1234094-shocking-chipotle"],
      enabled: true
    });
    expect(useStoreTransactionCategoryMap).toBeCalledTimes(1);
    expect(useStoreTransactionCategoryMap).toBeCalledWith();
    expect(mapTrueLayerCategoryToInternalCategory).not.toBeCalled();
    expect(mapTrueLayerTransactionToInternalTransaction).toBeCalledTimes(1);
    expect(mapTrueLayerTransactionToInternalTransaction).toBeCalledWith(
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
      TransactionCategory.EATING_OUT
    );
    expect(updateStore).not.toBeCalled();
  });

  test("refetch all data", async () => {
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
      isSuccess: true,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: true,
      data: {"1234094-shocking-chipotle": TransactionCategory.EATING_OUT}
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useStoreTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      mutate: () => {}
    });

    // run hook
    const {result} = renderHook(() => useTransactions());

    result.current.refetch();

    // assertions
    expect(mockCardRefetch).toBeCalledTimes(1);
    expect(mockCardRefetch).toBeCalledWith();
  });

  test("can disable queries", async () => {
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
      isSuccess: false,
      data: []
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      isSuccess: false,
      data: []
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useStoreTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      mutate: jest.fn()
    });

    renderHook(() =>
      useTransactions({
        enabled: false
      })
    );

    expect(useGetAllTruelayerCards).toBeCalledTimes(1);
    expect(useGetAllTruelayerCards).toBeCalledWith({
      enabled: false
    });
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith({
      cardIds: [],
      dateRange: undefined,
      enabled: false
    });
  });
});
