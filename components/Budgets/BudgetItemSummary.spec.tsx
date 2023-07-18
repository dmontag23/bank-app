import React from "react";
import {MD3LightTheme} from "react-native-paper";
import {render, screen} from "@testing-library/react-native";

import BudgetItemSummary from "./BudgetItemSummary";

import {ComponentTestWrapper} from "../../tests/mocks/utils";
import {BudgetItemWithTransactions} from "../../types/budget";

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
    render(<BudgetItemSummary item={testItem} />, {
      wrapper: ComponentTestWrapper
    });

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
    render(<BudgetItemSummary item={{...testItem, cap: 1.5, spent: 2.2}} />, {
      wrapper: ComponentTestWrapper
    });

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
    render(<BudgetItemSummary item={{...testItem, cap: 3.2, spent: 2.2}} />, {
      wrapper: ComponentTestWrapper
    });

    expect(screen.getByText(testItem.name)).toBeVisible();
    expect(screen.getByText("£1.00")).toBeVisible();
    expect(screen.getByText("left of £3.20")).toBeVisible();

    const progressBar = screen.getByTestId("budgetItemSummaryProgressBar");
    expect(progressBar).toBeVisible();
    expect(progressBar.children[0]).toHaveStyle({
      backgroundColor: MD3LightTheme.colors.primaryContainer
    });
  });
});
