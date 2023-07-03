import React from "react";
import {isEqual} from "lodash";
import {render, screen} from "@testing-library/react-native";

import BudgetItem from "./BudgetItem";
import BudgetItemSummary from "./BudgetItemSummary";

import {ComponentTestWrapper} from "../../tests/mocks/utils";
import {BudgetItemWithTransactions} from "../../types/budget";
import {Transaction, TransactionCategory} from "../../types/transaction";
import TransactionList from "../Transactions/TransactionList";

jest.mock("lodash");
jest.mock("./BudgetItemSummary");
jest.mock("../Transactions/TransactionList");

describe("BudgetItem component", () => {
  const testTransactions: Transaction[] = [
    {
      id: "id",
      name: "Transaction 1",
      description: "Description",
      amount: 0,
      category: TransactionCategory.SAVINGS
    }
  ];
  const testItem: BudgetItemWithTransactions = {
    id: "id",
    name: "Item 1",
    cap: 0,
    categories: [],
    spent: 0,
    transactions: testTransactions
  };

  test("renders item with no transactions correctly", () => {
    render(<BudgetItem item={{...testItem, transactions: []}} />, {
      wrapper: ComponentTestWrapper
    });

    expect(
      screen.getByText(
        "There are currently no transactions for this budget item."
      )
    ).toBeVisible();
    expect(BudgetItemSummary).toBeCalledTimes(1);
    expect(BudgetItemSummary).toBeCalledWith(
      {item: {...testItem, transactions: []}},
      {}
    );
  });

  test("renders item with transactions correctly", () => {
    render(<BudgetItem item={testItem} />, {
      wrapper: ComponentTestWrapper
    });

    expect(BudgetItemSummary).toBeCalledTimes(1);
    expect(BudgetItemSummary).toBeCalledWith({item: testItem}, {});
    expect(TransactionList).toBeCalledTimes(1);
    expect(TransactionList).toBeCalledWith(
      {transactions: testTransactions},
      {}
    );
  });

  test("equality of two BudgetItems", () => {
    const {rerender} = render(<BudgetItem item={testItem} />, {
      wrapper: ComponentTestWrapper
    });

    rerender(<BudgetItem item={{...testItem, id: "2"}} />);

    expect(isEqual).toBeCalledTimes(1);
    expect(isEqual).toBeCalledWith(
      {
        item: testItem
      },
      {
        item: {...testItem, id: "2"}
      }
    );
  });
});
