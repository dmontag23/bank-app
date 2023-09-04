import React from "react";
import {
  fireEvent,
  render,
  screen,
  tabNavigationObject,
  waitFor
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import {NavigationContainer} from "@react-navigation/native";

import Budget from "./Budget";
import BudgetItem from "./BudgetItem";

import useTransactions from "../../hooks/transactions/useTransactions";
import {
  EATING_OUT_CARD_TRANSACTION,
  PAY_BILL_CARD_TRANSACTION,
  PAY_RENT_TRANSACTION
} from "../../tests/mocks/data/transactions";
import {BudgetItem as BudgetItemType} from "../../types/budget";
import {TransactionCategory} from "../../types/transaction";
import LoadingSpinner from "../ui/LoadingSpinner";

// TODO: Figure out why you need to return jest.fn()
// here for a memoized component
jest.mock("./BudgetItem", () => jest.fn());
jest.mock("../ui/LoadingSpinner");
jest.mock("../../hooks/transactions/useTransactions");

describe("Budget component", () => {
  const emptyBudget = {
    id: "1",
    name: "",
    window: {
      start: new Date("2023-01-01"),
      end: new Date("2023-01-31")
    },
    items: []
  };

  test("renders a spinner when loading", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useTransactions as jest.MockedFunction<any>).mockImplementation(() => ({
      isLoading: true,
      transactions: []
    }));

    render(
      <NavigationContainer>
        <Budget budget={emptyBudget} />
      </NavigationContainer>
    );

    expect(useTransactions).toBeCalledTimes(1);
    expect(useTransactions).toBeCalledWith("2cbf9b6063102763ccbe3ea62f1b3e72", {
      from: emptyBudget.window.start,
      to: emptyBudget.window.end
    });
    expect(LoadingSpinner).toBeCalledTimes(1);
    expect(LoadingSpinner).toBeCalledWith({}, {});
  });

  test("renders no item text when not loading but no budget items", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useTransactions as jest.MockedFunction<any>).mockImplementation(() => ({
      isLoading: false,
      transactions: [EATING_OUT_CARD_TRANSACTION, PAY_BILL_CARD_TRANSACTION]
    }));

    render(
      <NavigationContainer>
        <Budget budget={emptyBudget} />
      </NavigationContainer>
    );

    expect(useTransactions).toBeCalledTimes(1);
    expect(useTransactions).toBeCalledWith("2cbf9b6063102763ccbe3ea62f1b3e72", {
      from: emptyBudget.window.start,
      to: emptyBudget.window.end
    });
    expect(
      screen.getByText("There are no items in this budget.")
    ).toBeVisible();
  });

  test("processes a budget with no transactions", () => {
    const testBudgetItems: BudgetItemType[] = [
      {
        id: "id-1",
        name: "Item 1",
        cap: 50,
        categories: []
      }
    ];

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useTransactions as jest.MockedFunction<any>).mockImplementation(() => ({
      isLoading: false,
      transactions: []
    }));

    render(
      <NavigationContainer>
        <Budget budget={{...emptyBudget, items: testBudgetItems}} />
      </NavigationContainer>
    );

    expect(useTransactions).toBeCalledTimes(1);
    expect(useTransactions).toBeCalledWith("2cbf9b6063102763ccbe3ea62f1b3e72", {
      from: emptyBudget.window.start,
      to: emptyBudget.window.end
    });
    expect(BudgetItem).toBeCalledTimes(1);
    expect(BudgetItem).toBeCalledWith(
      {
        item: {...testBudgetItems[0], spent: 0, transactions: []},
        navigation: tabNavigationObject,
        route: {
          key: expect.stringContaining(testBudgetItems[0].id),
          name: testBudgetItems[0].id,
          params: undefined
        }
      },
      {}
    );
  });

  test("processes a budget with transactions", async () => {
    const testBudgetItems: BudgetItemType[] = [
      {
        id: "id-1",
        name: "Item 1",
        cap: 50,
        categories: [TransactionCategory.BILLS]
      },
      {
        id: "id-2",
        name: "Item 2",
        cap: 100,
        categories: [TransactionCategory.EATING_OUT]
      }
    ];

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useTransactions as jest.MockedFunction<any>).mockImplementation(() => ({
      isLoading: false,
      transactions: [
        PAY_RENT_TRANSACTION,
        EATING_OUT_CARD_TRANSACTION,
        PAY_BILL_CARD_TRANSACTION
      ]
    }));

    render(
      <NavigationContainer>
        <Budget budget={{...emptyBudget, items: testBudgetItems}} />
      </NavigationContainer>
    );

    await waitFor(() => expect(BudgetItem).toBeCalledTimes(1));
    expect(useTransactions).toBeCalledTimes(1);
    expect(useTransactions).toBeCalledWith("2cbf9b6063102763ccbe3ea62f1b3e72", {
      from: emptyBudget.window.start,
      to: emptyBudget.window.end
    });
    expect(BudgetItem).toBeCalledWith(
      {
        item: {
          ...testBudgetItems[0],
          spent: 202.52,
          transactions: [PAY_RENT_TRANSACTION, PAY_BILL_CARD_TRANSACTION]
        },
        navigation: tabNavigationObject,
        route: {
          key: expect.stringContaining(testBudgetItems[0].id),
          name: testBudgetItems[0].id,
          params: undefined
        }
      },
      {}
    );
  });

  test("switches between budget items", async () => {
    const testBudgetItems: BudgetItemType[] = [
      {
        id: "id-1",
        name: "Item 1",
        cap: 50,
        categories: [TransactionCategory.BILLS]
      },
      {
        id: "id-2",
        name: "Item 2",
        cap: 100,
        categories: [TransactionCategory.EATING_OUT]
      }
    ];

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useTransactions as jest.MockedFunction<any>).mockImplementation(() => ({
      isLoading: false,
      transactions: [
        PAY_RENT_TRANSACTION,
        EATING_OUT_CARD_TRANSACTION,
        PAY_BILL_CARD_TRANSACTION
      ]
    }));

    render(
      <NavigationContainer>
        <Budget budget={{...emptyBudget, items: testBudgetItems}} />
      </NavigationContainer>
    );

    expect(useTransactions).toBeCalledTimes(1);
    expect(useTransactions).toBeCalledWith("2cbf9b6063102763ccbe3ea62f1b3e72", {
      from: emptyBudget.window.start,
      to: emptyBudget.window.end
    });
    expect(BudgetItem).toBeCalledTimes(1);
    expect(BudgetItem).toBeCalledWith(
      {
        item: {
          ...testBudgetItems[0],
          spent: 202.52,
          transactions: [PAY_RENT_TRANSACTION, PAY_BILL_CARD_TRANSACTION]
        },
        navigation: tabNavigationObject,
        route: {
          key: expect.stringContaining(testBudgetItems[0].id),
          name: testBudgetItems[0].id,
          params: undefined
        }
      },
      {}
    );

    const allTabs = screen.getAllByRole("tab");
    const secondTab = allTabs?.[1];
    expect(secondTab).toBeVisible();

    fireEvent.press(secondTab);

    expect(BudgetItem).toBeCalledTimes(2);
    expect(BudgetItem).toBeCalledWith(
      {
        item: {
          ...testBudgetItems[1],
          spent: 36.71,
          transactions: [EATING_OUT_CARD_TRANSACTION]
        },
        navigation: tabNavigationObject,
        route: {
          key: expect.stringContaining(testBudgetItems[1].id),
          name: testBudgetItems[1].id,
          params: undefined
        }
      },
      {}
    );
  });
});
