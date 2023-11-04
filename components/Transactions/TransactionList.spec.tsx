import React from "react";
import {render} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import Transaction from "./Transaction";
import TransactionList from "./TransactionList";

import {INITIAL_CATEGORY_MAP} from "../../constants";
import {EATING_OUT_CARD_TRANSACTION} from "../../tests/mocks/data/transactions";
import {Transaction as TransactionType} from "../../types/transaction";

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
        category: "Savings",
        timestamp: new Date("2023-01-01")
      }
    ];

    render(
      <TransactionList
        transactions={testTransactions}
        categoryMap={INITIAL_CATEGORY_MAP}
      />
    );

    expect(Transaction).toBeCalledTimes(testTransactions.length);
    testTransactions.map(transaction =>
      expect(Transaction).toBeCalledWith(
        {
          transaction: transaction,
          categoryMap: INITIAL_CATEGORY_MAP
        },
        {}
      )
    );
  });
});
