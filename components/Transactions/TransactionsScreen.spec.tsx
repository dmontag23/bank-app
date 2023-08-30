import React from "react";
import {render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import TransactionList from "./TransactionList";
import TransactionsScreen from "./TransactionsScreen";

import useTransactions from "../../hooks/transactions/useTransactions";
import {EATING_OUT_CARD_TRANSACTION} from "../../tests/mocks/data/transactions";
import {Transaction, TransactionCategory} from "../../types/transaction";
import LoadingSpinner from "../ui/LoadingSpinner";

jest.mock("./TransactionList");
jest.mock("../ui/LoadingSpinner");
jest.mock("../../hooks/transactions/useTransactions");

describe("TransactionsScreen component", () => {
  test("renders a loading spinner when loading transactions", () => {
    // setup mocks
    const mockUseTransactions =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useTransactions as jest.MockedFunction<any>;
    mockUseTransactions.mockImplementation(() => ({
      isLoading: true,
      transactions: []
    }));

    render(<TransactionsScreen />);

    expect(LoadingSpinner).toBeCalledTimes(1);
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
        category: TransactionCategory.SAVINGS
      }
    ];

    // setup mocks
    const mockUseTransactions =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useTransactions as jest.MockedFunction<any>;
    mockUseTransactions.mockImplementation(() => ({
      isLoading: false,
      transactions: testTransactions
    }));

    render(<TransactionsScreen />);

    expect(screen.getByText("Transactions")).toBeVisible();
    expect(TransactionList).toBeCalledTimes(1);
    expect(TransactionList).toBeCalledWith(
      {transactions: testTransactions},
      {}
    );
  });
});
