import React from "react";
import {useForm} from "react-hook-form";
import {describe, expect, test} from "@jest/globals";
import {
  fireEvent,
  render,
  renderHook,
  screen
} from "@testing-library/react-native";

import BudgetItemFormFields from "./BudgetItemFormFields";

import {ComponentTestWrapper} from "../../../tests/mocks/utils";
import {BudgetInput} from "../../../types/budget";
import {TransactionCategory} from "../../../types/transaction";

describe("BudgetItemFormFields component", () => {
  const BUDGET_WITH_EMPTY_ITEM: BudgetInput = {
    id: "budget-1",
    name: "",
    window: {start: new Date("01-01-2023"), end: new Date("01-02-2023")},
    items: [
      {
        id: "1",
        name: "",
        cap: "",
        categories: []
      }
    ]
  };

  test("renders the correct form fields", async () => {
    const {result} = renderHook(
      () => useForm<BudgetInput>({defaultValues: BUDGET_WITH_EMPTY_ITEM}),
      {
        wrapper: ComponentTestWrapper
      }
    );

    render(
      <BudgetItemFormFields
        disabledCategories={[]}
        control={result.current.control}
        index={0}
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
    const {result} = renderHook(
      () => useForm<BudgetInput>({defaultValues: BUDGET_WITH_EMPTY_ITEM}),
      {
        wrapper: ComponentTestWrapper
      }
    );

    const disabledCategories = [
      TransactionCategory.ENTERTAINMENT,
      TransactionCategory.SAVINGS
    ];

    render(
      <BudgetItemFormFields
        disabledCategories={disabledCategories}
        control={result.current.control}
        index={0}
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
    const {result} = renderHook(
      () =>
        useForm<BudgetInput>({
          defaultValues: {
            ...BUDGET_WITH_EMPTY_ITEM,
            items: [{...BUDGET_WITH_EMPTY_ITEM.items[0], name: "Test item"}]
          }
        }),
      {
        wrapper: ComponentTestWrapper
      }
    );

    render(
      <BudgetItemFormFields
        disabledCategories={[]}
        control={result.current.control}
        index={0}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    expect(screen.getByDisplayValue("Test item")).toBeVisible();
    expect(result.current.getValues("items.0.name")).toEqual("Test item");
    fireEvent.changeText(screen.getByLabelText("Item name"), "It");
    expect(result.current.getValues("items.0.name")).toEqual("It");
  });

  test("can set item cap", async () => {
    const {result} = renderHook(
      () =>
        useForm<BudgetInput>({
          defaultValues: {
            ...BUDGET_WITH_EMPTY_ITEM,
            items: [{...BUDGET_WITH_EMPTY_ITEM.items[0], cap: "20"}]
          }
        }),
      {
        wrapper: ComponentTestWrapper
      }
    );

    render(
      <BudgetItemFormFields
        disabledCategories={[]}
        control={result.current.control}
        index={0}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    expect(screen.getByText("£ ")).toBeVisible();
    expect(screen.getByDisplayValue("20")).toBeVisible();
    expect(result.current.getValues("items.0.cap")).toEqual("20");
    fireEvent.changeText(screen.getByLabelText("Cap"), "42");
    expect(result.current.getValues("items.0.cap")).toEqual("42");
  });

  test("cannot set disabled category", async () => {
    const {result} = renderHook(
      () => useForm<BudgetInput>({defaultValues: BUDGET_WITH_EMPTY_ITEM}),
      {
        wrapper: ComponentTestWrapper
      }
    );

    render(
      <BudgetItemFormFields
        disabledCategories={[TransactionCategory.EATING_OUT]}
        control={result.current.control}
        index={0}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    const eatingOutCheckbox = screen.getByLabelText("EATING_OUT");
    expect(eatingOutCheckbox).toBeDisabled();
    expect(result.current.getValues("items.0.categories")).toEqual([]);
    fireEvent.press(eatingOutCheckbox);
    expect(eatingOutCheckbox).toBeDisabled();
    expect(result.current.getValues("items.0.categories")).toEqual([]);
  });

  test("can select and deselect enabled category", async () => {
    const {result} = renderHook(
      () => useForm<BudgetInput>({defaultValues: BUDGET_WITH_EMPTY_ITEM}),
      {
        wrapper: ComponentTestWrapper
      }
    );

    render(
      <BudgetItemFormFields
        disabledCategories={[]}
        control={result.current.control}
        index={0}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    const billsCheckbox = screen.getByLabelText("BILLS");
    expect(billsCheckbox).toBeEnabled();
    expect(result.current.getValues("items.0.categories")).toEqual([]);
    fireEvent.press(billsCheckbox);
    expect(billsCheckbox).toBeEnabled();
    expect(result.current.getValues("items.0.categories")).toEqual([
      TransactionCategory.BILLS
    ]);
    fireEvent.press(billsCheckbox);
    expect(billsCheckbox).toBeEnabled();
    expect(result.current.getValues("items.0.categories")).toEqual([]);
  });
});
