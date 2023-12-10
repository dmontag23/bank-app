import {renderHook} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import useGetTransactionCategoryMap from "./useGetTransactionCategoryMap";
import useMapTransactionsToInternalTransactions from "./useMapTransactionsToInternalTransactions";

import {TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS} from "../../mock-server/trueLayer/data/cardTransactionData";
import {Source, Transaction} from "../../types/transaction";
import {CardTransaction} from "../../types/trueLayer/dataAPI/cards";

jest.mock("./useGetTransactionCategoryMap");

describe("useMapTransactionsToInternalTransactions", () => {
  test("returns loading state when loading transaction category map from storage", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      data: undefined
    });

    const mockMapFn = jest.fn<(transaction: unknown) => Transaction>();
    const {result} = renderHook(() =>
      useMapTransactionsToInternalTransactions({
        transactions: [],
        mapTransactionToInternalTransaction: mockMapFn
      })
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.transactions).toEqual([]);
    expect(useGetTransactionCategoryMap).toBeCalledTimes(1);
    expect(useGetTransactionCategoryMap).toBeCalledWith({
      transactionIds: [],
      source: Source.UNKNOWN,
      enabled: true
    });
    expect(mockMapFn).not.toBeCalled();
  });

  test("returns empty transaction list when given empty transaction list", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      data: {}
    });

    const mockMapFn = jest.fn<(transaction: unknown) => Transaction>();
    const {result} = renderHook(() =>
      useMapTransactionsToInternalTransactions({
        transactions: [],
        mapTransactionToInternalTransaction: mockMapFn
      })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.transactions).toEqual([]);
    expect(useGetTransactionCategoryMap).toBeCalledTimes(1);
    expect(useGetTransactionCategoryMap).toBeCalledWith({
      transactionIds: [],
      source: Source.UNKNOWN,
      enabled: true
    });
    expect(mockMapFn).not.toBeCalled();
  });

  test("returns transaction list without any transaction categories from storage to merge", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      data: undefined
    });

    const mockInternalTransaction: Transaction = {
      id: "id",
      name: "name",
      description: "description",
      amount: 0,
      category: "bills",
      timestamp: new Date(),
      source: Source.TRUELAYER
    };

    const mockMapFn = jest.fn(
      (_: CardTransaction): Transaction => mockInternalTransaction
    );
    const {result} = renderHook(() =>
      useMapTransactionsToInternalTransactions({
        transactions: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS],
        mapTransactionToInternalTransaction: mockMapFn
      })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.transactions).toEqual([mockInternalTransaction]);
    expect(mockMapFn).toBeCalledTimes(1);
    expect(mockMapFn).toBeCalledWith(
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
    );
    expect(useGetTransactionCategoryMap).toBeCalledTimes(1);
    expect(useGetTransactionCategoryMap).toBeCalledWith({
      transactionIds: ["id"],
      source: Source.TRUELAYER,
      enabled: true
    });
  });

  test("returns transaction list with merged transaction categories", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      data: {id: "Savings"}
    });

    const mockInternalTransaction: Transaction = {
      id: "id",
      name: "name",
      description: "description",
      amount: 0,
      category: "bills",
      timestamp: new Date(),
      source: Source.TRUELAYER
    };

    const mockMapFn = jest.fn(
      (_: CardTransaction): Transaction => mockInternalTransaction
    );
    const {result} = renderHook(() =>
      useMapTransactionsToInternalTransactions({
        transactions: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS],
        mapTransactionToInternalTransaction: mockMapFn
      })
    );

    expect(result.current.transactions).toEqual([
      {...mockInternalTransaction, category: "Savings"}
    ]);
  });

  test("can disable query", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      data: undefined
    });

    const mockInternalTransaction: Transaction = {
      id: "id",
      name: "name",
      description: "description",
      amount: 0,
      category: "bills",
      timestamp: new Date(),
      source: Source.TRUELAYER
    };

    const mockMapFn = jest.fn(
      (_: CardTransaction): Transaction => mockInternalTransaction
    );
    const {result} = renderHook(() =>
      useMapTransactionsToInternalTransactions({
        transactions: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS],
        mapTransactionToInternalTransaction: mockMapFn,
        enabled: false
      })
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.transactions).toEqual([mockInternalTransaction]);
    expect(useGetTransactionCategoryMap).toBeCalledTimes(1);
    expect(useGetTransactionCategoryMap).toBeCalledWith({
      transactionIds: ["id"],
      source: Source.TRUELAYER,
      enabled: false
    });
  });
});
