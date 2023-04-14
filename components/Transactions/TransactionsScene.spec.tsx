import React from "react";
import {render, screen} from "@testing-library/react-native";

import TransactionsScene from "./TransactionsScene";

import useTransactions from "../../hooks/useTransactions";
import {EATING_OUT_CARD_TRANSACTION} from "../../tests/mocks/data/transactions";
import {ComponentTestWrapper} from "../../tests/mocks/utils";
import {Transaction, TransactionCategory} from "../../types/transaction";

jest.mock("../../hooks/useTransactions");

describe("TransactionsScene component", () => {
  test("renders a loading spinner when loading transactions", () => {
    // setup mocks
    const mockUseTransactions =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useTransactions as jest.MockedFunction<any>;
    mockUseTransactions.mockImplementationOnce(() => ({
      isLoading: true,
      transactions: []
    }));

    render(<TransactionsScene />, {
      wrapper: ComponentTestWrapper
    });

    expect(screen.getByTestId("loadingSpinner")).toBeVisible();
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
    mockUseTransactions.mockImplementationOnce(() => ({
      isLoading: false,
      transactions: testTransactions
    }));

    render(<TransactionsScene />, {
      wrapper: ComponentTestWrapper
    });

    expect(screen.getByText("Transactions")).toBeVisible();
    testTransactions.map(transaction => {
      expect(screen.getByText(transaction.name)).toBeVisible();
    });
  });
});
