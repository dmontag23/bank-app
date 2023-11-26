import React from "react";
import {render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import TransactionList from "./TransactionList";
import TransactionsScreen from "./TransactionsScreen";

import {INITIAL_CATEGORY_MAP} from "../../constants";
import useGetAllMappedTruelayerTransactions from "../../hooks/integrations/truelayer/useGetAllMappedTruelayerTransactions";
import useGetCategoryMap from "../../hooks/transactions/useGetCategoryMap";
import useOnFocus from "../../hooks/utils/useOnFocus";
import {EATING_OUT_CARD_TRANSACTION} from "../../tests/mocks/data/transactions";
import {Source, Transaction} from "../../types/transaction";
import LoadingSpinner from "../ui/LoadingSpinner";

jest.mock("./TransactionList");
jest.mock("../ui/LoadingSpinner");
jest.mock(
  "../../hooks/integrations/truelayer/useGetAllMappedTruelayerTransactions"
);
jest.mock("../../hooks/transactions/useGetCategoryMap");
jest.mock("../../hooks/utils/useOnFocus");

describe("TransactionsScreen component", () => {
  test("renders a loading spinner when loading transactions", () => {
    // setup mocks
    const mockRefetch = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllMappedTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      transactions: [],
      refetch: mockRefetch
    });

    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: undefined
    });

    render(<TransactionsScreen />);

    expect(LoadingSpinner).toBeCalledTimes(1);
    expect(LoadingSpinner).toBeCalledWith({}, {});
    expect(useOnFocus).toBeCalledTimes(1);
    expect(useOnFocus).toBeCalledWith(mockRefetch);
    expect(useGetAllMappedTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllMappedTruelayerTransactions).toBeCalledWith({
      enabled: false
    });
  });

  test("renders a loading spinner when loading the category map", () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllMappedTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      transactions: [
        EATING_OUT_CARD_TRANSACTION,
        {
          id: "id-2",
          name: "Savings transaction",
          description: "This is my second transaction",
          amount: 12.29,
          category: "Savings",
          timestamp: new Date("2023-01-01")
        }
      ],
      refetch: jest.fn()
    });

    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: true,
      data: undefined
    });

    render(<TransactionsScreen />);

    expect(LoadingSpinner).toBeCalledTimes(1);
    expect(LoadingSpinner).toBeCalledWith({}, {});
    expect(useGetCategoryMap).toBeCalledTimes(1);
    expect(useGetCategoryMap).toBeCalledWith();
  });

  test("renders transactions after loading", () => {
    // setup data
    const testTransactions: Transaction[] = [
      EATING_OUT_CARD_TRANSACTION,
      {
        id: "id-2",
        name: "Savings transaction",
        description: "This is my second transaction",
        amount: 12.29,
        category: "Savings",
        timestamp: new Date("2023-01-01"),
        source: Source.TRUELAYER
      }
    ];

    // setup mocks
    const mockRefetch = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllMappedTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      transactions: testTransactions,
      refetch: mockRefetch
    });

    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: undefined
    });

    render(<TransactionsScreen />);

    expect(screen.getByText("Transactions")).toBeVisible();
    expect(useOnFocus).toBeCalledTimes(1);
    expect(useOnFocus).toBeCalledWith(mockRefetch);
    expect(TransactionList).toBeCalledTimes(1);
    expect(TransactionList).toBeCalledWith(
      {transactions: testTransactions, categoryMap: {}},
      {}
    );
    expect(useGetAllMappedTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllMappedTruelayerTransactions).toBeCalledWith({
      enabled: false
    });
  });

  test("passes category map to the transaction list component", () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllMappedTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      transactions: [],
      refetch: jest.fn()
    });

    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: INITIAL_CATEGORY_MAP
    });

    render(<TransactionsScreen />);

    expect(TransactionList).toBeCalledTimes(1);
    expect(TransactionList).toBeCalledWith(
      {transactions: [], categoryMap: INITIAL_CATEGORY_MAP},
      {}
    );
  });
});
