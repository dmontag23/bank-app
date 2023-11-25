import React from "react";
import {MD3LightTheme} from "react-native-paper";
import {act, fireEvent, render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import BudgetDialog from "./BudgetDialog";
import BudgetItemSummary from "./BudgetItemSummary";

import {INITIAL_CATEGORY_MAP} from "../../constants";
import {BudgetItemWithTransactions} from "../../types/budget";
import CategoryIcon from "../ui/CategoryIcon";
import ExpandableAccordion from "../ui/ExpandableAccordion";

jest.mock("./BudgetDialog");
jest.mock("../ui/CategoryIcon");
jest.mock("../ui/ExpandableAccordion");

describe("BudgetItemSummary component", () => {
  const testItem: BudgetItemWithTransactions = {
    id: "id",
    name: "Item 1",
    cap: 0,
    categories: [],
    spent: 0,
    transactions: []
  };

  const mockBudget = {
    id: "",
    name: "",
    items: [],
    window: {start: new Date(), end: new Date()}
  };
  const mockSetSelectedBudget = jest.fn();

  test("renders item with no cap correctly", () => {
    render(
      <BudgetItemSummary
        item={testItem}
        budget={mockBudget}
        setSelectedBudget={mockSetSelectedBudget}
        categoryMap={{}}
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
    render(
      <BudgetItemSummary
        item={{...testItem, cap: 1.5, spent: 2.2}}
        budget={mockBudget}
        setSelectedBudget={mockSetSelectedBudget}
        categoryMap={{}}
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
    render(
      <BudgetItemSummary
        item={{...testItem, cap: 3.2, spent: 2.2}}
        budget={mockBudget}
        setSelectedBudget={mockSetSelectedBudget}
        categoryMap={{}}
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
    render(
      <BudgetItemSummary
        item={testItem}
        budget={mockBudget}
        setSelectedBudget={mockSetSelectedBudget}
        categoryMap={{}}
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

  test("renders unknown categories when no category map is present", () => {
    render(
      <BudgetItemSummary
        item={{
          ...testItem,
          categories: ["Bills"]
        }}
        budget={mockBudget}
        setSelectedBudget={mockSetSelectedBudget}
        categoryMap={{}}
      />
    );

    expect(ExpandableAccordion).toBeCalledTimes(1);
    expect(ExpandableAccordion).toBeCalledWith(
      {
        title: "Categories",
        headerStyle: {width: "80%", alignSelf: "center"},
        children: expect.any(Object)
      },
      {}
    );

    // test the children of the ExpandableAccordion
    const categories = (
      ExpandableAccordion as jest.MockedFunction<typeof ExpandableAccordion>
    ).mock.calls[0][0].children as JSX.Element;
    render(categories);

    expect(screen.getByText("Unknown")).toBeVisible();
    expect(screen.getByTestId("chip-container")).toHaveStyle({
      backgroundColor: INITIAL_CATEGORY_MAP.Unknown.color
    });
    expect(CategoryIcon).toBeCalledTimes(1);
    expect(CategoryIcon).toBeCalledWith(
      expect.objectContaining({
        icon: INITIAL_CATEGORY_MAP.Unknown.icon,
        color: INITIAL_CATEGORY_MAP.Unknown.color
      }),
      {}
    );
  });

  test("renders item categories with category map", () => {
    render(
      <BudgetItemSummary
        item={{
          ...testItem,
          categories: ["Bills"]
        }}
        budget={mockBudget}
        setSelectedBudget={mockSetSelectedBudget}
        categoryMap={INITIAL_CATEGORY_MAP}
      />
    );

    expect(ExpandableAccordion).toBeCalledTimes(1);
    expect(ExpandableAccordion).toBeCalledWith(
      {
        title: "Categories",
        headerStyle: {width: "80%", alignSelf: "center"},
        children: expect.any(Object)
      },
      {}
    );

    // test the children of the ExpandableAccordion
    const categories = (
      ExpandableAccordion as jest.MockedFunction<typeof ExpandableAccordion>
    ).mock.calls[0][0].children as JSX.Element;
    render(categories);

    expect(screen.getByText("Bills")).toBeVisible();
    expect(screen.getByTestId("chip-container")).toHaveStyle({
      backgroundColor: INITIAL_CATEGORY_MAP.Bills.color
    });
    expect(CategoryIcon).toBeCalledTimes(1);
    expect(CategoryIcon).toBeCalledWith(
      expect.objectContaining({
        icon: INITIAL_CATEGORY_MAP.Bills.icon,
        color: INITIAL_CATEGORY_MAP.Bills.color
      }),
      {}
    );
  });
});
