import React from "react";
import {render} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import Transaction from "./Transaction";
import TransactionList from "./TransactionList";

import {EATING_OUT_CARD_TRANSACTION} from "../../tests/mocks/data/transactions";
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

    render(<TransactionList transactions={testTransactions} />);

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
