import React from "react";
import {describe, expect, jest, test} from "@jest/globals";
import {fireEvent, render, screen} from "@testing-library/react-native";

import BudgetItemFormFields from "./BudgetItemFormFields";

import {BUDGET_ITEM_BILLS} from "../../../tests/mocks/data/budgets";
import {ComponentTestWrapper} from "../../../tests/mocks/utils";
import {BudgetItemInput} from "../../../types/budget";
import {TransactionCategory} from "../../../types/transaction";

describe("BudgetItemFormFields component", () => {
  const EMPTY_BUDGET_ITEM: BudgetItemInput = {
    id: "1",
    name: "",
    cap: "",
    categories: []
  };

  test("renders the correct form fields", async () => {
    render(
      <BudgetItemFormFields
        budgetItem={EMPTY_BUDGET_ITEM}
        disabledCategories={[]}
        setBudgetItem={() => {}}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    expect(screen.getByLabelText("Item name")).toBeVisible();
    expect(screen.getByLabelText("Cap")).toBeVisible();
    expect(screen.getByText("Select categories")).toBeVisible();
    Object.keys(TransactionCategory).map(category => {
      const categoryCheckbox = screen.getByLabelText(category);
      expect(categoryCheckbox).toBeVisible();
      expect(categoryCheckbox).toBeEnabled();
    });
  });

  test("renders disabled categories", () => {
    const disabledCategories = [
      TransactionCategory.ENTERTAINMENT,
      TransactionCategory.SAVINGS
    ];

    render(
      <BudgetItemFormFields
        budgetItem={EMPTY_BUDGET_ITEM}
        disabledCategories={disabledCategories}
        setBudgetItem={() => {}}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    Object.keys(TransactionCategory).map(category => {
      const categoryCheckbox = screen.getByLabelText(category);
      expect(categoryCheckbox).toBeVisible();
      disabledCategories.includes(
        TransactionCategory[category as keyof typeof TransactionCategory]
      )
        ? expect(categoryCheckbox).toBeDisabled()
        : expect(categoryCheckbox).toBeEnabled();
    });
  });

  test("can set item name", async () => {
    const setBudgetItem = jest.fn();

    render(
      <BudgetItemFormFields
        budgetItem={{...EMPTY_BUDGET_ITEM, name: "Test item"}}
        disabledCategories={[]}
        setBudgetItem={setBudgetItem}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    expect(screen.getByDisplayValue("Test item")).toBeVisible();
    fireEvent.changeText(screen.getByLabelText("Item name"), "It");
    expect(setBudgetItem).toBeCalledTimes(1);
    expect(setBudgetItem).toBeCalledWith({...EMPTY_BUDGET_ITEM, name: "It"});
  });

  test("can set item cap", async () => {
    const setBudgetItem = jest.fn();

    render(
      <BudgetItemFormFields
        budgetItem={{...EMPTY_BUDGET_ITEM, cap: "20"}}
        disabledCategories={[]}
        setBudgetItem={setBudgetItem}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    expect(screen.getByText("£ ")).toBeVisible();
    expect(screen.getByDisplayValue("20")).toBeVisible();
    fireEvent.changeText(screen.getByLabelText("Cap"), "42");
    expect(setBudgetItem).toBeCalledTimes(1);
    expect(setBudgetItem).toBeCalledWith({...EMPTY_BUDGET_ITEM, cap: "42"});
  });

  test("cannot set disabled category", async () => {
    const setBudgetItem = jest.fn();

    render(
      <BudgetItemFormFields
        budgetItem={EMPTY_BUDGET_ITEM}
        disabledCategories={[TransactionCategory.EATING_OUT]}
        setBudgetItem={setBudgetItem}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    const eatingOutCheckbox = screen.getByLabelText("EATING_OUT");
    fireEvent.press(eatingOutCheckbox);
    expect(eatingOutCheckbox).toBeDisabled();
    expect(setBudgetItem).not.toBeCalled();
  });

  test("can set enabled category", async () => {
    const setBudgetItem = jest.fn();

    render(
      <BudgetItemFormFields
        budgetItem={EMPTY_BUDGET_ITEM}
        disabledCategories={[]}
        setBudgetItem={setBudgetItem}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    fireEvent.press(screen.getByLabelText("BILLS"));
    expect(setBudgetItem).toBeCalledTimes(1);
    expect(setBudgetItem).toBeCalledWith({
      ...EMPTY_BUDGET_ITEM,
      categories: [TransactionCategory.BILLS]
    });
  });

  test("can deselect enabled category", async () => {
    const setBudgetItem = jest.fn();

    render(
      <BudgetItemFormFields
        budgetItem={{...BUDGET_ITEM_BILLS, cap: ""}}
        disabledCategories={[]}
        setBudgetItem={setBudgetItem}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    const billsCheckbox = screen.getByLabelText("BILLS");
    expect(billsCheckbox).toBeEnabled();

    fireEvent.press(billsCheckbox);
    expect(billsCheckbox).toBeEnabled();
    expect(setBudgetItem).toBeCalledTimes(1);
    expect(setBudgetItem).toBeCalledWith({
      ...BUDGET_ITEM_BILLS,
      cap: "",
      categories: []
    });
  });
});
