import React from "react";
import {render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import TransactionList from "./TransactionList";
import TransactionsScreen from "./TransactionsScreen";

import {INITIAL_CATEGORY_MAP} from "../../constants";
import useGetCategoryMap from "../../hooks/transactions/useGetCategoryMap";
import useGetTransactions from "../../hooks/transactions/useGetTransactions";
import {EATING_OUT_CARD_TRANSACTION} from "../../tests/mocks/data/transactions";
import {Source, Transaction} from "../../types/transaction";
import LoadingSpinner from "../ui/LoadingSpinner";

jest.mock("./TransactionList");
jest.mock("../ui/LoadingSpinner");
jest.mock("../../hooks/transactions/useGetCategoryMap");
jest.mock("../../hooks/transactions/useGetTransactions");

describe("TransactionsScreen component", () => {
  test("renders a loading spinner when loading transactions", () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetTransactions as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: true,
      isRefetching: false,
      transactions: [],
      refetch: jest.fn()
    });

    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: undefined
    });

    render(<TransactionsScreen />);

    expect(LoadingSpinner).toBeCalledTimes(1);
    expect(LoadingSpinner).toBeCalledWith({}, {});
    expect(useGetTransactions).toBeCalledTimes(1);
    expect(useGetTransactions).toBeCalledWith();
  });

  test("renders a loading spinner when loading the category map", () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetTransactions as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
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
    (useGetTransactions as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      transactions: testTransactions,
      refetch: mockRefetch
    });

    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: undefined
    });

    render(<TransactionsScreen />);

    expect(screen.getByText("Transactions")).toBeVisible();
    expect(TransactionList).toBeCalledTimes(1);
    expect(TransactionList).toBeCalledWith(
      {
        transactions: testTransactions,
        categoryMap: {},
        onRefetchTransactions: mockRefetch,
        isRefetchingTransactions: false
      },
      {}
    );
    expect(useGetTransactions).toBeCalledTimes(1);
    expect(useGetTransactions).toBeCalledWith();
  });

  test("passes category map to the transaction list component", () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    const mockRefetch = jest.fn();
    (useGetTransactions as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: true,
      transactions: [],
      refetch: mockRefetch
    });

    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: INITIAL_CATEGORY_MAP
    });

    render(<TransactionsScreen />);

    expect(TransactionList).toBeCalledTimes(1);
    expect(TransactionList).toBeCalledWith(
      {
        transactions: [],
        categoryMap: INITIAL_CATEGORY_MAP,
        onRefetchTransactions: mockRefetch,
        isRefetchingTransactions: true
      },
      {}
    );
  });
});
