import React from "react";
import {MD3LightTheme} from "react-native-paper";
import {act, fireEvent, render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import BudgetDialog from "./BudgetDialog";
import BudgetItemSummary from "./BudgetItemSummary";

import {BudgetItemWithTransactions} from "../../types/budget";

jest.mock("./BudgetDialog");

describe("BudgetItemSummary component", () => {
  const testItem: BudgetItemWithTransactions = {
    id: "id",
    name: "Item 1",
    cap: 0,
    categories: [],
    spent: 0,
    transactions: []
  };

  test("renders item with no cap correctly", () => {
    const mockBudget = {
      id: "",
      name: "",
      items: [],
      window: {start: new Date(), end: new Date()}
    };
    const mockSetSelectedBudget = jest.fn();

    render(
      <BudgetItemSummary
        item={testItem}
        budget={mockBudget}
        setSelectedBudget={mockSetSelectedBudget}
      />
    );

    expect(screen.getByText(testItem.name)).toBeVisible();
    expect(screen.getByText("£0.00")).toBeVisible();
    expect(screen.getByText("left of £0.00")).toBeVisible();

    const progressBar = screen.getByTestId("budgetItemSummaryProgressBar");
    expect(progressBar).toBeVisible();
    expect(progressBar.children[0]).toHaveStyle({
      backgroundColor: MD3LightTheme.colors.primaryContainer
    });
  });

  test("renders item with negative percentage correctly", () => {
    const mockBudget = {
      id: "",
      name: "",
      items: [],
      window: {start: new Date(), end: new Date()}
    };
    const mockSetSelectedBudget = jest.fn();

    render(
      <BudgetItemSummary
        item={{...testItem, cap: 1.5, spent: 2.2}}
        budget={mockBudget}
        setSelectedBudget={mockSetSelectedBudget}
      />
    );

    expect(screen.getByText(testItem.name)).toBeVisible();
    expect(screen.getByText("£-0.70")).toBeVisible();
    expect(screen.getByText("left of £1.50")).toBeVisible();

    const progressBar = screen.getByTestId("budgetItemSummaryProgressBar");
    expect(progressBar).toBeVisible();
    expect(progressBar.children[0]).toHaveStyle({
      backgroundColor: MD3LightTheme.colors.errorContainer,
      borderColor: MD3LightTheme.colors.error,
      borderWidth: 1
    });
  });

  test("renders item with positive percentage correctly", () => {
    const mockBudget = {
      id: "",
      name: "",
      items: [],
      window: {start: new Date(), end: new Date()}
    };
    const mockSetSelectedBudget = jest.fn();

    render(
      <BudgetItemSummary
        item={{...testItem, cap: 3.2, spent: 2.2}}
        budget={mockBudget}
        setSelectedBudget={mockSetSelectedBudget}
      />
    );

    expect(screen.getByText(testItem.name)).toBeVisible();
    expect(screen.getByText("£1.00")).toBeVisible();
    expect(screen.getByText("left of £3.20")).toBeVisible();

    const progressBar = screen.getByTestId("budgetItemSummaryProgressBar");
    expect(progressBar).toBeVisible();
    expect(progressBar.children[0]).toHaveStyle({
      backgroundColor: MD3LightTheme.colors.primaryContainer
    });
  });

  test("can open and close the budget dialog", () => {
    const mockBudget = {
      id: "",
      name: "",
      items: [],
      window: {start: new Date(), end: new Date()}
    };
    const mockSetSelectedBudget = jest.fn();

    render(
      <BudgetItemSummary
        item={testItem}
        budget={mockBudget}
        setSelectedBudget={mockSetSelectedBudget}
      />
    );

    expect(BudgetDialog).toBeCalledTimes(1);
    expect(BudgetDialog).toBeCalledWith(
      {
        isVisible: false,
        hide: expect.any(Function),
        setSelectedBudget: mockSetSelectedBudget,
        isEditing: true,
        formValues: mockBudget
      },
      {}
    );

    // check that the edit icon button is visible
    const editBudgetIcon = screen.getByRole("button");
    expect(editBudgetIcon).toBeVisible();

    // open the dialog
    fireEvent.press(editBudgetIcon);

    // check the dialog has been opened
    expect(BudgetDialog).toBeCalledTimes(2);

    const secondCall = (
      BudgetDialog as jest.MockedFunction<typeof BudgetDialog>
    ).mock.calls[1][0];
    expect(secondCall).toMatchObject({
      isVisible: true,
      hide: expect.any(Function),
      setSelectedBudget: mockSetSelectedBudget,
      isEditing: true,
      formValues: mockBudget
    });

    // hide the dialog
    const hideFn = secondCall.hide;
    act(() => hideFn());

    // check the dialog has been closed
    expect(BudgetDialog).toBeCalledTimes(3);

    const thirdCall = (BudgetDialog as jest.MockedFunction<typeof BudgetDialog>)
      .mock.calls[2][0];
    expect(thirdCall).toMatchObject({
      isVisible: false,
      hide: expect.any(Function),
      setSelectedBudget: mockSetSelectedBudget,
      isEditing: true,
      formValues: mockBudget
    });
  });
});
