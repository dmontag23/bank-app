import React from "react";
import {render} from "@testing-library/react-native";

import Transaction from "./Transaction";
import TransactionList from "./TransactionList";

import {EATING_OUT_CARD_TRANSACTION} from "../../tests/mocks/data/transactions";
import {ComponentTestWrapper} from "../../tests/mocks/utils";
import {
  TransactionCategory,
  Transaction as TransactionType
} from "../../types/transaction";

jest.mock("./Transaction");

describe("TransactionList component", () => {
  test("renders a transaction list correctly", () => {
    const testTransactions: TransactionType[] = [
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

    expect(Transaction).toBeCalledTimes(testTransactions.length);
    testTransactions.map(transaction =>
      expect(Transaction).toBeCalledWith(
        {
          transaction: transaction
        },
        {}
      )
    );
  });
});
