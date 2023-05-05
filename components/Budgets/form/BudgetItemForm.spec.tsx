import React from "react";
import {fireEvent, render, screen} from "@testing-library/react-native";

import BudgetItemForm from "./BudgetItemForm";

import {ComponentTestWrapper} from "../../../tests/mocks/utils";
import {BudgetInput} from "../../../types/budget";
import {TransactionCategory} from "../../../types/transaction";

jest.mock("uuid", () => ({
  v4: () => "unique-id"
}));

describe("BudgetItemForm component", () => {
  // needed for animated components
  // see https://github.com/jestjs/jest/issues/6434
  beforeEach(() => jest.useFakeTimers());

  const EMPTY_BUDGET: BudgetInput = {
    id: "1",
    name: "",
    window: {
      start: new Date("2023-01-01"),
      end: new Date("2023-01-31")
    },
    items: []
  };

  test("renders the correct form fields with all enabled categories", async () => {
    render(
      <BudgetItemForm
        budget={{
          ...EMPTY_BUDGET,
          items: [
            {
              id: "item-1",
              name: "",
              cap: "",
              categories: []
            }
          ]
        }}
        setBudget={() => {}}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    expect(screen.getByText("Budget Item")).toBeVisible();
    Object.keys(TransactionCategory).map(category => {
      const categoryCheckbox = screen.getByLabelText(category);
      expect(categoryCheckbox).toBeVisible();
      expect(categoryCheckbox).toBeEnabled();
    });
    expect(screen.getByText("Add item")).toBeVisible();
  });

  test("renders disabled categories", async () => {
    render(
      <BudgetItemForm
        budget={{
          ...EMPTY_BUDGET,
          items: [
            {
              id: "item-1",
              name: "Eating out",
              cap: "150",
              categories: [TransactionCategory.EATING_OUT]
            },
            {
              id: "item-2",
              name: "Entertainment",
              cap: "200",
              categories: []
            },
            {
              id: "item-3",
              name: "Savings",
              cap: "2000",
              categories: [TransactionCategory.SAVINGS]
            }
          ]
        }}
        setBudget={() => {}}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    expect(screen.getByText("Eating out")).toBeVisible();
    expect(screen.getByText("Entertainment")).toBeVisible();
    expect(screen.getByText("Savings")).toBeVisible();

    const eatingOutCheckboxes = screen.getAllByLabelText("EATING_OUT");
    expect(eatingOutCheckboxes).toHaveLength(3);
    expect(eatingOutCheckboxes[0]).toBeEnabled();
    expect(eatingOutCheckboxes[1]).toBeDisabled();
    expect(eatingOutCheckboxes[2]).toBeDisabled();

    const savingsCheckboxes = screen.getAllByLabelText("SAVINGS");
    expect(savingsCheckboxes).toHaveLength(3);
    expect(savingsCheckboxes[0]).toBeDisabled();
    expect(savingsCheckboxes[1]).toBeDisabled();
    expect(savingsCheckboxes[2]).toBeEnabled();
  });

  test("correctly adds an item to the form", async () => {
    const setBudget = jest.fn();
    setBudget.mockImplementation(setBudgetFn => {
      const newBudget = setBudgetFn(EMPTY_BUDGET);
      expect(newBudget).toEqual({
        ...EMPTY_BUDGET,
        items: [
          ...EMPTY_BUDGET.items,
          {
            id: "unique-id",
            name: "",
            cap: "",
            categories: []
          }
        ]
      });
    });

    render(<BudgetItemForm budget={EMPTY_BUDGET} setBudget={setBudget} />, {
      wrapper: ComponentTestWrapper
    });

    fireEvent.press(screen.getByText("Add item"));
    expect(setBudget).toBeCalledTimes(1);
  });

  test("sets the correct property on the correct item", async () => {
    const budgetWithTwoItems = {
      ...EMPTY_BUDGET,
      items: [
        {
          id: "item-1",
          name: "",
          cap: "",
          categories: [TransactionCategory.BILLS]
        },
        {
          id: "item-2",
          name: "Entertainment",
          cap: "200",
          categories: []
        }
      ]
    };

    const setBudget = jest.fn();
    setBudget.mockImplementation(setBudgetFn => {
      const newBudget = setBudgetFn(budgetWithTwoItems);
      expect(newBudget).toEqual({
        ...budgetWithTwoItems,
        items: [
          budgetWithTwoItems.items[0],
          {
            ...budgetWithTwoItems.items[1],
            categories: [TransactionCategory.ENTERTAINMENT]
          }
        ]
      });
    });

    render(
      <BudgetItemForm budget={budgetWithTwoItems} setBudget={setBudget} />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    const eatingOutCheckboxes = screen.getAllByLabelText("ENTERTAINMENT");
    expect(eatingOutCheckboxes).toHaveLength(2);
    fireEvent.press(eatingOutCheckboxes[1]);
    expect(setBudget).toBeCalledTimes(1);
  });
});
