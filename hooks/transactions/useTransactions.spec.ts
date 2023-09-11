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
import useGetAllTruelayerTransactions from "../integrations/truelayer/useGetAllTruelayerTransactions";

jest.mock("../integrations/truelayer/trueLayerMappings");
jest.mock("../integrations/truelayer/useGetAllTruelayerTransactions");
jest.mock("./useGetTransactionCategoryMap");
jest.mock("./useStoreTransactionCategoryMap");

describe("useTransactions", () => {
  test("can pass in date range", async () => {
    const mockUseTrueLayerTransactionsFromAcct =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useGetAllTruelayerTransactions as jest.MockedFunction<any>;
    mockUseTrueLayerTransactionsFromAcct.mockImplementation(() => ({
      isLoading: true,
      isSuccess: false,
      data: []
    }));

    const mockUseGetTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useGetTransactionCategoryMap as jest.MockedFunction<any>;
    mockUseGetTransactionCategoryMap.mockImplementation(() => ({
      isLoading: true,
      isSuccess: false,
      data: []
    }));

    const mockUseStoreTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useStoreTransactionCategoryMap as jest.MockedFunction<any>;
    mockUseStoreTransactionCategoryMap.mockImplementation(() => ({
      mutate: jest.fn()
    }));

    renderHook(() =>
      useTransactions("dummy", {
        from: new Date("01-01-2022"),
        to: new Date("01-01-2023")
      })
    );

    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith("dummy", {
      from: new Date("01-01-2022"),
      to: new Date("01-01-2023")
    });
  });

  test("returns a loading status if loading truelayer transactions", async () => {
    // setup mocks
    const mockRefetch = jest.fn();
    const mockUseTrueLayerTransactionsFromAcct =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useGetAllTruelayerTransactions as jest.MockedFunction<any>;
    mockUseTrueLayerTransactionsFromAcct.mockImplementation(() => ({
      isLoading: true,
      isSuccess: false,
      data: [],
      refetch: mockRefetch
    }));
    const mockUseGetTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useGetTransactionCategoryMap as jest.MockedFunction<any>;
    mockUseGetTransactionCategoryMap.mockImplementation(() => ({
      isLoading: true,
      isSuccess: false,
      data: []
    }));

    const mockUseStoreTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useStoreTransactionCategoryMap as jest.MockedFunction<any>;
    const updateStore = jest.fn();
    mockUseStoreTransactionCategoryMap.mockImplementation(() => ({
      mutate: updateStore
    }));

    // run hook
    const {result} = renderHook(() => useTransactions("dummy"));

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.refetch).toBe(mockRefetch);
    expect(result.current.transactions).toEqual([]);
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith("dummy", undefined);
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
    const mockUseTrueLayerTransactionsFromAcct =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useGetAllTruelayerTransactions as jest.MockedFunction<any>;
    mockUseTrueLayerTransactionsFromAcct.mockImplementation(() => ({
      isLoading: false,
      isSuccess: true,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    }));
    const mockUseGetTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useGetTransactionCategoryMap as jest.MockedFunction<any>;
    mockUseGetTransactionCategoryMap.mockImplementation(() => ({
      isLoading: true,
      isSuccess: false,
      data: []
    }));
    const mockUseStoreTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useStoreTransactionCategoryMap as jest.MockedFunction<any>;
    const updateStore = jest.fn();
    mockUseStoreTransactionCategoryMap.mockImplementation(() => ({
      mutate: updateStore
    }));

    // run hook
    const {result} = renderHook(() => useTransactions("dummy"));

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.transactions).toEqual([]);
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith("dummy", undefined);
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
    const mockUseTrueLayerTransactionsFromAcct =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useGetAllTruelayerTransactions as jest.MockedFunction<any>;
    mockUseTrueLayerTransactionsFromAcct.mockImplementation(() => ({
      isLoading: false,
      isSuccess: true,
      data: []
    }));
    const mockUseGetTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useGetTransactionCategoryMap as jest.MockedFunction<any>;
    mockUseGetTransactionCategoryMap.mockImplementation(() => ({
      isLoading: false,
      isSuccess: true,
      data: {}
    }));
    const mockUseStoreTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useStoreTransactionCategoryMap as jest.MockedFunction<any>;
    const updateStore = jest.fn();
    mockUseStoreTransactionCategoryMap.mockImplementation(() => ({
      mutate: updateStore
    }));

    // run hook
    const {result} = renderHook(() => useTransactions("dummy"));

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([]);
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith("dummy", undefined);
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
    const mockUseTrueLayerTransactionsFromAcct =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useGetAllTruelayerTransactions as jest.MockedFunction<any>;
    mockUseTrueLayerTransactionsFromAcct.mockImplementation(() => ({
      isLoading: false,
      isSuccess: true,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    }));
    const mockUseGetTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useGetTransactionCategoryMap as jest.MockedFunction<any>;
    mockUseGetTransactionCategoryMap.mockImplementation(() => ({
      isLoading: false,
      isSuccess: true,
      data: {}
    }));
    const mockUseStoreTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useStoreTransactionCategoryMap as jest.MockedFunction<any>;
    const updateStore = jest.fn();
    mockUseStoreTransactionCategoryMap.mockImplementation(() => ({
      mutate: updateStore
    }));
    const mockMapTrueLayerCategoryToInternalCategory =
      mapTrueLayerCategoryToInternalCategory as jest.MockedFunction<
        typeof mapTrueLayerCategoryToInternalCategory
      >;
    mockMapTrueLayerCategoryToInternalCategory.mockImplementation(
      () => TransactionCategory.EATING_OUT
    );
    const mockMapTrueLayerTransactionToInternalTransaction =
      mapTrueLayerTransactionToInternalTransaction as jest.MockedFunction<
        typeof mapTrueLayerTransactionToInternalTransaction
      >;
    mockMapTrueLayerTransactionToInternalTransaction.mockImplementation(
      () => EATING_OUT_CARD_TRANSACTION
    );

    // run hook
    const {result} = renderHook(() => useTransactions("dummy"));

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([EATING_OUT_CARD_TRANSACTION]);
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith("dummy", undefined);
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
    const mockUseTrueLayerTransactionsFromAcct =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useGetAllTruelayerTransactions as jest.MockedFunction<any>;
    mockUseTrueLayerTransactionsFromAcct.mockImplementation(() => ({
      isLoading: false,
      isSuccess: true,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    }));
    const mockUseGetTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useGetTransactionCategoryMap as jest.MockedFunction<any>;
    mockUseGetTransactionCategoryMap.mockImplementation(() => ({
      isLoading: false,
      isSuccess: true,
      data: {"1234094-shocking-chipotle": TransactionCategory.EATING_OUT}
    }));
    const mockUseStoreTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useStoreTransactionCategoryMap as jest.MockedFunction<any>;
    const updateStore = jest.fn();
    mockUseStoreTransactionCategoryMap.mockImplementation(() => ({
      mutate: updateStore
    }));
    const mockMapTrueLayerTransactionToInternalTransaction =
      mapTrueLayerTransactionToInternalTransaction as jest.MockedFunction<
        typeof mapTrueLayerTransactionToInternalTransaction
      >;
    mockMapTrueLayerTransactionToInternalTransaction.mockImplementation(
      () => EATING_OUT_CARD_TRANSACTION
    );

    // run hook
    const {result} = renderHook(() => useTransactions("dummy"));

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([EATING_OUT_CARD_TRANSACTION]);
    expect(useGetAllTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllTruelayerTransactions).toBeCalledWith("dummy", undefined);
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
});
