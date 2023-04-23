import {renderHook, waitFor} from "@testing-library/react-native";

import useGetTransactionCategoryMap from "./useGetTransactionCategoryMap";
import useStoreTransactionCategoryMap from "./useStoreTransactionCategoryMap";
import useTransactions from "./useTransactions";

import {EATING_OUT_CARD_TRANSACTION} from "../../tests/mocks/data/transactions";
import {TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS} from "../../tests/mocks/trueLayer/dataAPI/data/cardData";
import {TransactionCategory} from "../../types/transaction";
import {
  mapTrueLayerCategoryToInternalCategory,
  mapTrueLayerTransactionToInternalTransaction
} from "../integrations/truelayer/trueLayerMappings";
import useTrueLayerTransactionsFromAcct from "../integrations/truelayer/useTrueLayerTransactionsFromAcct";

jest.mock("../integrations/truelayer/trueLayerMappings");
jest.mock("../integrations/truelayer/useTrueLayerTransactionsFromAcct");
jest.mock("./useGetTransactionCategoryMap");
jest.mock("./useStoreTransactionCategoryMap");

describe("useTransactions", () => {
  test("returns a loading status if loading truelayer transactions", async () => {
    // setup mocks
    const mockUseTrueLayerTransactionsFromAcct =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useTrueLayerTransactionsFromAcct as jest.MockedFunction<any>;
    mockUseTrueLayerTransactionsFromAcct.mockImplementationOnce(() => ({
      isLoading: true,
      isSuccess: false,
      data: undefined
    }));
    const mockUseGetTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useGetTransactionCategoryMap as jest.MockedFunction<any>;
    mockUseGetTransactionCategoryMap.mockImplementationOnce(() => ({
      isLoading: true,
      isSuccess: false,
      data: undefined
    }));
    const mockUseStoreTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useStoreTransactionCategoryMap as jest.MockedFunction<any>;
    const updateStore = jest.fn();
    mockUseStoreTransactionCategoryMap.mockImplementationOnce(() => ({
      mutate: updateStore
    }));

    // run hook
    const {result} = renderHook(() => useTransactions("dummy"));

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.transactions).toEqual([]);
    expect(useTrueLayerTransactionsFromAcct).toBeCalledTimes(1);
    expect(useTrueLayerTransactionsFromAcct).toBeCalledWith("dummy");
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
      useTrueLayerTransactionsFromAcct as jest.MockedFunction<any>;
    mockUseTrueLayerTransactionsFromAcct.mockImplementationOnce(() => ({
      isLoading: false,
      isSuccess: true,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    }));
    const mockUseGetTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useGetTransactionCategoryMap as jest.MockedFunction<any>;
    mockUseGetTransactionCategoryMap.mockImplementationOnce(() => ({
      isLoading: true,
      isSuccess: false,
      data: undefined
    }));
    const mockUseStoreTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useStoreTransactionCategoryMap as jest.MockedFunction<any>;
    const updateStore = jest.fn();
    mockUseStoreTransactionCategoryMap.mockImplementationOnce(() => ({
      mutate: updateStore
    }));

    // run hook
    const {result} = renderHook(() => useTransactions("dummy"));

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.transactions).toEqual([]);
    expect(useTrueLayerTransactionsFromAcct).toBeCalledTimes(1);
    expect(useTrueLayerTransactionsFromAcct).toBeCalledWith("dummy");
    expect(useGetTransactionCategoryMap).toBeCalledTimes(1);
    expect(useGetTransactionCategoryMap).toBeCalledWith({
      transactionIds: ["truelayer-1234094-shocking-chipotle"],
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
      useTrueLayerTransactionsFromAcct as jest.MockedFunction<any>;
    mockUseTrueLayerTransactionsFromAcct.mockImplementationOnce(() => ({
      isLoading: false,
      isSuccess: true,
      data: []
    }));
    const mockUseGetTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useGetTransactionCategoryMap as jest.MockedFunction<any>;
    mockUseGetTransactionCategoryMap.mockImplementationOnce(() => ({
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
    mockUseStoreTransactionCategoryMap.mockImplementationOnce(() => ({
      mutate: updateStore
    }));

    // run hook
    const {result} = renderHook(() => useTransactions("dummy"));

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([]);
    expect(useTrueLayerTransactionsFromAcct).toBeCalledTimes(1);
    expect(useTrueLayerTransactionsFromAcct).toBeCalledWith("dummy");
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
      useTrueLayerTransactionsFromAcct as jest.MockedFunction<any>;
    mockUseTrueLayerTransactionsFromAcct.mockImplementationOnce(() => ({
      isLoading: false,
      isSuccess: true,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    }));
    const mockUseGetTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useGetTransactionCategoryMap as jest.MockedFunction<any>;
    mockUseGetTransactionCategoryMap.mockImplementationOnce(() => ({
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
    mockUseStoreTransactionCategoryMap.mockImplementationOnce(() => ({
      mutate: updateStore
    }));
    const mockMapTrueLayerCategoryToInternalCategory =
      mapTrueLayerCategoryToInternalCategory as jest.MockedFunction<
        typeof mapTrueLayerCategoryToInternalCategory
      >;
    mockMapTrueLayerCategoryToInternalCategory.mockImplementationOnce(
      () => TransactionCategory.EATING_OUT
    );
    const mockMapTrueLayerTransactionToInternalTransaction =
      mapTrueLayerTransactionToInternalTransaction as jest.MockedFunction<
        typeof mapTrueLayerTransactionToInternalTransaction
      >;
    mockMapTrueLayerTransactionToInternalTransaction.mockImplementationOnce(
      () => EATING_OUT_CARD_TRANSACTION
    );

    // run hook
    const {result} = renderHook(() => useTransactions("dummy"));

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([EATING_OUT_CARD_TRANSACTION]);
    expect(useTrueLayerTransactionsFromAcct).toBeCalledTimes(1);
    expect(useTrueLayerTransactionsFromAcct).toBeCalledWith("dummy");
    expect(useGetTransactionCategoryMap).toBeCalledTimes(1);
    expect(useGetTransactionCategoryMap).toBeCalledWith({
      transactionIds: ["truelayer-1234094-shocking-chipotle"],
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
      "truelayer-1234094-shocking-chipotle": TransactionCategory.EATING_OUT
    });
  });

  test("uses category from storage", async () => {
    // setup mocks
    const mockUseTrueLayerTransactionsFromAcct =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useTrueLayerTransactionsFromAcct as jest.MockedFunction<any>;
    mockUseTrueLayerTransactionsFromAcct.mockImplementationOnce(() => ({
      isLoading: false,
      isSuccess: true,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    }));
    const mockUseGetTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useGetTransactionCategoryMap as jest.MockedFunction<any>;
    mockUseGetTransactionCategoryMap.mockImplementationOnce(() => ({
      isLoading: false,
      isSuccess: true,
      data: {
        "truelayer-1234094-shocking-chipotle": TransactionCategory.EATING_OUT
      }
    }));
    const mockUseStoreTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useStoreTransactionCategoryMap as jest.MockedFunction<any>;
    const updateStore = jest.fn();
    mockUseStoreTransactionCategoryMap.mockImplementationOnce(() => ({
      mutate: updateStore
    }));
    const mockMapTrueLayerTransactionToInternalTransaction =
      mapTrueLayerTransactionToInternalTransaction as jest.MockedFunction<
        typeof mapTrueLayerTransactionToInternalTransaction
      >;
    mockMapTrueLayerTransactionToInternalTransaction.mockImplementationOnce(
      () => EATING_OUT_CARD_TRANSACTION
    );

    // run hook
    const {result} = renderHook(() => useTransactions("dummy"));

    // assertions
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toEqual([EATING_OUT_CARD_TRANSACTION]);
    expect(useTrueLayerTransactionsFromAcct).toBeCalledTimes(1);
    expect(useTrueLayerTransactionsFromAcct).toBeCalledWith("dummy");
    expect(useGetTransactionCategoryMap).toBeCalledTimes(1);
    expect(useGetTransactionCategoryMap).toBeCalledWith({
      transactionIds: ["truelayer-1234094-shocking-chipotle"],
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
