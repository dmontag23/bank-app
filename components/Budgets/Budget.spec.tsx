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

import useGetCategoryMap from "../../hooks/transactions/useGetCategoryMap";
import useGetTransactions from "../../hooks/transactions/useGetTransactions";
import {
  EATING_OUT_CARD_TRANSACTION,
  PAY_BILL_CARD_TRANSACTION,
  PAY_RENT_TRANSACTION
} from "../../tests/mocks/data/transactions";
import {BudgetItem as BudgetItemType} from "../../types/budget";
import {CategoryMap} from "../../types/transaction";
import LoadingSpinner from "../ui/LoadingSpinner";

// TODO: Figure out why you need to return jest.fn()
// here for a memoized component
jest.mock("./BudgetItem", () => jest.fn());
jest.mock("../ui/LoadingSpinner");
jest.mock("../../hooks/transactions/useGetCategoryMap");
jest.mock("../../hooks/transactions/useGetTransactions");

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

  test("renders a spinner when loading transactions", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetTransactions as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: true,
      isRefetching: false,
      refetch: jest.fn(),
      transactions: []
    });

    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: undefined
    });

    render(
      <NavigationContainer>
        <Budget budget={emptyBudget} setSelectedBudget={jest.fn()} />
      </NavigationContainer>
    );

    expect(useGetTransactions).toBeCalledTimes(1);
    expect(useGetTransactions).toBeCalledWith({
      dateRange: {
        from: emptyBudget.window.start,
        to: emptyBudget.window.end
      }
    });
    expect(LoadingSpinner).toBeCalledTimes(1);
    expect(LoadingSpinner).toBeCalledWith({}, {});
  });

  test("renders a spinner when loading the category map", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetTransactions as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn(),
      transactions: [EATING_OUT_CARD_TRANSACTION, PAY_BILL_CARD_TRANSACTION]
    });

    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: true,
      data: undefined
    });

    render(
      <NavigationContainer>
        <Budget budget={emptyBudget} setSelectedBudget={jest.fn()} />
      </NavigationContainer>
    );

    expect(useGetCategoryMap).toBeCalledTimes(1);
    expect(useGetCategoryMap).toBeCalledWith();
    expect(LoadingSpinner).toBeCalledTimes(1);
    expect(LoadingSpinner).toBeCalledWith({}, {});
  });

  test("renders no item text when not loading but no budget items", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetTransactions as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn(),
      transactions: [EATING_OUT_CARD_TRANSACTION, PAY_BILL_CARD_TRANSACTION]
    });

    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: {}
    });

    render(
      <NavigationContainer>
        <Budget budget={emptyBudget} setSelectedBudget={jest.fn()} />
      </NavigationContainer>
    );

    expect(useGetTransactions).toBeCalledTimes(1);
    expect(useGetTransactions).toBeCalledWith({
      dateRange: {
        from: emptyBudget.window.start,
        to: emptyBudget.window.end
      }
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
    const mockRefetch = jest.fn();
    (useGetTransactions as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      transactions: [],
      refetch: mockRefetch
    });

    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: undefined
    });

    const mockSetSelectedBudget = jest.fn();
    const budget = {...emptyBudget, items: testBudgetItems};

    render(
      <NavigationContainer>
        <Budget budget={budget} setSelectedBudget={mockSetSelectedBudget} />
      </NavigationContainer>
    );

    expect(useGetTransactions).toBeCalledTimes(1);
    expect(useGetTransactions).toBeCalledWith({
      dateRange: {
        from: emptyBudget.window.start,
        to: emptyBudget.window.end
      }
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
        },
        budget,
        setSelectedBudget: mockSetSelectedBudget,
        categoryMap: {},
        onRefetchTransactions: mockRefetch,
        isRefetchingTransactions: false
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
        categories: ["Bills"]
      },
      {
        id: "id-2",
        name: "Item 2",
        cap: 100,
        categories: ["Eating out"]
      }
    ];

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetTransactions as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: true,
      refetch: jest.fn(),
      transactions: [
        PAY_RENT_TRANSACTION,
        EATING_OUT_CARD_TRANSACTION,
        PAY_BILL_CARD_TRANSACTION
      ]
    });

    const categoryMap: CategoryMap = {Bills: {icon: "bill", color: "red"}};
    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: categoryMap
    });

    const mockSetSelectedBudget = jest.fn();
    const budget = {...emptyBudget, items: testBudgetItems};

    render(
      <NavigationContainer>
        <Budget budget={budget} setSelectedBudget={mockSetSelectedBudget} />
      </NavigationContainer>
    );

    await waitFor(() => expect(BudgetItem).toBeCalledTimes(1));
    expect(useGetTransactions).toBeCalledTimes(1);
    expect(useGetTransactions).toBeCalledWith({
      dateRange: {
        from: emptyBudget.window.start,
        to: emptyBudget.window.end
      }
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
        },
        budget,
        setSelectedBudget: mockSetSelectedBudget,
        categoryMap,
        isRefetchingTransactions: true,
        onRefetchTransactions: expect.any(Function)
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
        categories: ["Bills"]
      },
      {
        id: "id-2",
        name: "Item 2",
        cap: 100,
        categories: ["Eating out"]
      }
    ];

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetTransactions as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn(),
      transactions: [
        PAY_RENT_TRANSACTION,
        EATING_OUT_CARD_TRANSACTION,
        PAY_BILL_CARD_TRANSACTION
      ]
    });

    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: {}
    });

    const mockSetSelectedBudget = jest.fn();
    const budget = {...emptyBudget, items: testBudgetItems};

    render(
      <NavigationContainer>
        <Budget budget={budget} setSelectedBudget={mockSetSelectedBudget} />
      </NavigationContainer>
    );

    expect(useGetTransactions).toBeCalledTimes(1);
    expect(useGetTransactions).toBeCalledWith({
      dateRange: {
        from: emptyBudget.window.start,
        to: emptyBudget.window.end
      }
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
        },
        budget,
        setSelectedBudget: mockSetSelectedBudget,
        categoryMap: {},
        isRefetchingTransactions: false,
        onRefetchTransactions: expect.any(Function)
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
        },
        budget,
        setSelectedBudget: mockSetSelectedBudget,
        categoryMap: {},
        isRefetchingTransactions: false,
        onRefetchTransactions: expect.any(Function)
      },
      {}
    );
  });
});
