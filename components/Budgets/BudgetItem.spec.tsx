import React from "react";
import {isEqual} from "lodash";
import {render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import BudgetItem from "./BudgetItem";
import BudgetItemSummary from "./BudgetItemSummary";

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
      category: TransactionCategory.SAVINGS,
      timestamp: new Date("2023-01-01")
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
    const mockBudget = {
      id: "",
      name: "",
      items: [],
      window: {start: new Date(), end: new Date()}
    };
    const mockSetSelectedBudget = jest.fn();

    render(
      <BudgetItem
        item={{...testItem, transactions: []}}
        budget={mockBudget}
        setSelectedBudget={mockSetSelectedBudget}
      />
    );

    expect(
      screen.getByText(
        "There are currently no transactions for this budget item."
      )
    ).toBeVisible();
    expect(BudgetItemSummary).toBeCalledTimes(1);
    expect(BudgetItemSummary).toBeCalledWith(
      {
        item: {...testItem, transactions: []},
        budget: mockBudget,
        setSelectedBudget: mockSetSelectedBudget
      },
      {}
    );
  });

  test("renders item with transactions correctly", () => {
    const mockBudget = {
      id: "",
      name: "",
      items: [],
      window: {start: new Date(), end: new Date()}
    };
    const mockSetSelectedBudget = jest.fn();

    render(
      <BudgetItem
        item={testItem}
        budget={mockBudget}
        setSelectedBudget={mockSetSelectedBudget}
      />
    );

    expect(BudgetItemSummary).toBeCalledTimes(1);
    expect(BudgetItemSummary).toBeCalledWith(
      {
        item: testItem,
        budget: mockBudget,
        setSelectedBudget: mockSetSelectedBudget
      },
      {}
    );
    expect(TransactionList).toBeCalledTimes(1);
    expect(TransactionList).toBeCalledWith(
      {transactions: testTransactions},
      {}
    );
  });

  test("equality of two BudgetItems", () => {
    const mockBudget = {
      id: "",
      name: "",
      items: [],
      window: {start: new Date(), end: new Date()}
    };

    const mockSetSelectedBudget = jest.fn();

    const {rerender} = render(
      <BudgetItem
        item={testItem}
        budget={mockBudget}
        setSelectedBudget={mockSetSelectedBudget}
      />
    );

    rerender(
      <BudgetItem
        item={{...testItem, id: "2"}}
        budget={mockBudget}
        setSelectedBudget={mockSetSelectedBudget}
      />
    );

    expect(isEqual).toBeCalledTimes(1);
    expect(isEqual).toBeCalledWith(
      {
        item: testItem,
        budget: mockBudget,
        setSelectedBudget: mockSetSelectedBudget
      },
      {
        item: {...testItem, id: "2"},
        budget: mockBudget,
        setSelectedBudget: mockSetSelectedBudget
      }
    );
  });
});
