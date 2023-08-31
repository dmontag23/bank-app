import React from "react";
import {useForm} from "react-hook-form";
import {fireEvent, render, renderHook, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import BudgetItemForm from "./BudgetItemForm";
import BudgetItemFormFields from "./BudgetItemFormFields";

import {BudgetInput, BudgetItemInput} from "../../../types/budget";
import {TransactionCategory} from "../../../types/transaction";
import ExpandableAccordion from "../../ui/ExpandableAccordion";

jest.mock("uuid", () => ({
  v4: () => "unique-id"
}));
jest.mock("./BudgetItemFormFields");
jest.mock("../../ui/ExpandableAccordion");

describe("BudgetItemForm component", () => {
  const BUDGET_WITH_ONE_EMPTY_ITEM: BudgetInput = {
    id: "budget-1",
    name: "",
    window: {start: new Date("01-01-2023"), end: new Date("01-02-2023")},
    items: [{id: "dummy", name: "", cap: "", categories: []}]
  };

  const ITEM_1: BudgetItemInput = {
    id: "item-1",
    name: "Item 1",
    categories: [TransactionCategory.EATING_OUT],
    cap: ""
  };

  test("has the correct accordion text when no item name is provided", async () => {
    const {result} = renderHook(() =>
      useForm<BudgetInput>({defaultValues: BUDGET_WITH_ONE_EMPTY_ITEM})
    );

    render(<BudgetItemForm control={result.current.control} />);

    expect(ExpandableAccordion).toBeCalledTimes(1);
    expect(ExpandableAccordion).toBeCalledWith(
      expect.objectContaining({
        title: "Budget Item",
        isInitiallyExpanded: true
      }),
      {}
    );
  });

  test("has the correct accordion text when an item name is provided", async () => {
    const {result} = renderHook(() =>
      useForm<BudgetInput>({
        defaultValues: {...BUDGET_WITH_ONE_EMPTY_ITEM, items: [ITEM_1]}
      })
    );

    render(<BudgetItemForm control={result.current.control} />);

    expect(ExpandableAccordion).toBeCalledTimes(1);
    expect(ExpandableAccordion).toBeCalledWith(
      expect.objectContaining({
        title: "Item 1",
        isInitiallyExpanded: true
      }),
      {}
    );
  });

  test("BudgetItemFormFields is called correctly", async () => {
    const item2: BudgetItemInput = {
      id: "item-2",
      name: "Item 2",
      cap: "",
      categories: [TransactionCategory.SAVINGS]
    };
    const item3: BudgetItemInput = {
      id: "item-3",
      name: "Item 3",
      cap: "",
      categories: [TransactionCategory.BILLS]
    };

    const budget: BudgetInput = {
      ...BUDGET_WITH_ONE_EMPTY_ITEM,
      items: [ITEM_1, item2, item3]
    };

    const {result} = renderHook(() =>
      useForm<BudgetInput>({defaultValues: budget})
    );

    render(<BudgetItemForm control={result.current.control} />);

    expect(ExpandableAccordion).toBeCalledTimes(3);
    expect(ExpandableAccordion).toBeCalledWith(
      expect.objectContaining({children: expect.any(Object)}),
      {}
    );

    // test BudgetItemFormFields
    const BudgetItemFormFieldsComponent = (
      ExpandableAccordion as jest.MockedFunction<typeof ExpandableAccordion>
    ).mock.calls[1][0].children as JSX.Element;
    render(BudgetItemFormFieldsComponent);

    expect(BudgetItemFormFields).toBeCalledTimes(1);
    expect(BudgetItemFormFields).toBeCalledWith(
      {
        disabledCategories: [
          TransactionCategory.EATING_OUT,
          TransactionCategory.BILLS
        ],
        control: result.current.control,
        index: 1
      },
      {}
    );
  });

  test("correctly adds an item to the form", async () => {
    const {result} = renderHook(() =>
      useForm<BudgetInput>({defaultValues: BUDGET_WITH_ONE_EMPTY_ITEM})
    );

    render(<BudgetItemForm control={result.current.control} />);

    expect(result.current.getValues("items")).toHaveLength(1);
    fireEvent.press(screen.getByText("Add item"));
    expect(result.current.getValues("items")).toHaveLength(2);
    expect(result.current.getValues("items.1.id")).toEqual("unique-id");
    expect(result.current.getValues("items.1.name")).toEqual("");
    expect(result.current.getValues("items.1.cap")).toEqual("");
    expect(result.current.getValues("items.1.categories")).toEqual([]);
  });
});
