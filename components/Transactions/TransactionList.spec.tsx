import React from "react";
import {render, screen} from "@testing-library/react-native";

import TransactionList from "./TransactionList";

import {EATING_OUT_CARD_TRANSACTION} from "../../tests/mocks/data/transactions";
import {ComponentTestWrapper} from "../../tests/mocks/utils";
import {Transaction, TransactionCategory} from "../../types/transaction";

describe("TransactionList component", () => {
  test("renders a transaction list correctly", () => {
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

    render(<TransactionList transactions={testTransactions} />, {
      wrapper: ComponentTestWrapper
    });

    testTransactions.map(transaction => {
      expect(screen.getByText(transaction.name)).toBeVisible();
      expect(screen.getByText(transaction.category)).toBeVisible();
      expect(screen.getByText(transaction.amount.toString())).toBeVisible();
    });
  });
});
