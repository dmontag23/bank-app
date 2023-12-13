import React from "react";
import {isEqual} from "lodash";
import {render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import BudgetItem from "./BudgetItem";
import BudgetItemSummary from "./BudgetItemSummary";

import {INITIAL_CATEGORY_MAP} from "../../constants";
import {BudgetItemWithTransactions} from "../../types/budget";
import {Source, Transaction} from "../../types/transaction";
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
      category: "Savings",
      timestamp: new Date("2023-01-01"),
      source: Source.TRUELAYER
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
        categoryMap={{}}
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
        setSelectedBudget: mockSetSelectedBudget,
        categoryMap: {}
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
        categoryMap={INITIAL_CATEGORY_MAP}
      />
    );

    expect(BudgetItemSummary).toBeCalledTimes(1);
    expect(BudgetItemSummary).toBeCalledWith(
      {
        item: testItem,
        budget: mockBudget,
        setSelectedBudget: mockSetSelectedBudget,
        categoryMap: INITIAL_CATEGORY_MAP
      },
      {}
    );
    expect(TransactionList).toBeCalledTimes(1);
    expect(TransactionList).toBeCalledWith(
      {transactions: testTransactions, categoryMap: INITIAL_CATEGORY_MAP},
      {}
    );
  });

  test("passes refetching logic to TransactionsList component", () => {
    const mockBudget = {
      id: "",
      name: "",
      items: [],
      window: {start: new Date(), end: new Date()}
    };
    const mockOnRefetchTransactions = jest.fn();

    render(
      <BudgetItem
        item={testItem}
        budget={mockBudget}
        setSelectedBudget={jest.fn()}
        categoryMap={{}}
        onRefetchTransactions={mockOnRefetchTransactions}
        isRefetchingTransactions={true}
      />
    );

    expect(TransactionList).toBeCalledTimes(1);
    expect(TransactionList).toBeCalledWith(
      {
        transactions: testTransactions,
        categoryMap: {},
        onRefetchTransactions: mockOnRefetchTransactions,
        isRefetchingTransactions: true
      },
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
        categoryMap={INITIAL_CATEGORY_MAP}
      />
    );

    rerender(
      <BudgetItem
        item={{...testItem, id: "2"}}
        budget={mockBudget}
        setSelectedBudget={mockSetSelectedBudget}
        categoryMap={INITIAL_CATEGORY_MAP}
      />
    );

    expect(isEqual).toBeCalledTimes(1);
    expect(isEqual).toBeCalledWith(
      {
        item: testItem,
        budget: mockBudget,
        setSelectedBudget: mockSetSelectedBudget,
        categoryMap: INITIAL_CATEGORY_MAP
      },
      {
        item: {...testItem, id: "2"},
        budget: mockBudget,
        setSelectedBudget: mockSetSelectedBudget,
        categoryMap: INITIAL_CATEGORY_MAP
      }
    );
  });
});
