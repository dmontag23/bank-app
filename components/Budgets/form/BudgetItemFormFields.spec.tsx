import React from "react";
import {useForm} from "react-hook-form";
import {fireEvent, render, renderHook, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import BudgetItemFormFields from "./BudgetItemFormFields";

import {INITIAL_CATEGORY_MAP} from "../../../constants";
import useGetCategoryMap from "../../../hooks/transactions/useGetCategoryMap";
import {BudgetInput} from "../../../types/budget";
import LoadingSpinner from "../../ui/LoadingSpinner";

jest.mock("../../../hooks/transactions/useGetCategoryMap");
jest.mock("../../ui/LoadingSpinner");

describe("BudgetItemFormFields component", () => {
  const BUDGET_WITH_EMPTY_ITEM: BudgetInput = {
    id: "budget-1",
    name: "",
    window: {start: new Date("01-01-2023"), end: new Date("01-02-2023")},
    items: [
      {
        id: "item-1",
        name: "",
        cap: "",
        categories: []
      }
    ]
  };

  test("loading spinner is rendered when category map is loading", async () => {
    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: true,
      data: undefined
    });

    const {result} = renderHook(() =>
      useForm<BudgetInput>({defaultValues: BUDGET_WITH_EMPTY_ITEM})
    );

    render(
      <BudgetItemFormFields
        disabledCategories={[]}
        control={result.current.control}
        index={0}
      />
    );

    expect(screen.getByLabelText("Item name")).toBeVisible();
    expect(screen.getByLabelText("Cap")).toBeVisible();
    expect(screen.getByText("Select categories")).toBeVisible();
    expect(LoadingSpinner).toBeCalledTimes(1);
    expect(LoadingSpinner).toBeCalledWith({}, {});
  });

  test("does not render categories when no category map exists", async () => {
    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: undefined
    });

    const {result} = renderHook(() =>
      useForm<BudgetInput>({defaultValues: BUDGET_WITH_EMPTY_ITEM})
    );

    render(
      <BudgetItemFormFields
        disabledCategories={[]}
        control={result.current.control}
        index={0}
      />
    );

    expect(screen.getByLabelText("Item name")).toBeVisible();
    expect(screen.getByLabelText("Cap")).toBeVisible();
    expect(screen.getByText("Select categories")).toBeVisible();
    expect(screen.queryByText("Unknown")).toBeNull();
  });

  test("renders form fields with categories", async () => {
    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: INITIAL_CATEGORY_MAP
    });

    const {result} = renderHook(() =>
      useForm<BudgetInput>({defaultValues: BUDGET_WITH_EMPTY_ITEM})
    );

    render(
      <BudgetItemFormFields
        disabledCategories={[]}
        control={result.current.control}
        index={0}
      />
    );

    expect(screen.getByLabelText("Item name")).toBeVisible();
    expect(screen.getByLabelText("Cap")).toBeVisible();
    expect(screen.getByText("Select categories")).toBeVisible();
    Object.keys(INITIAL_CATEGORY_MAP).map(category => {
      const categoryCheckbox = screen.getByLabelText(category);
      expect(categoryCheckbox).toBeVisible();
      expect(categoryCheckbox).toBeEnabled();
    });
  });

  test("sorts categories", () => {
    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: {
        ...INITIAL_CATEGORY_MAP,
        "Credit card": {icon: "credit-card", color: "hsl(90, 100%, 50%)"}
      }
    });

    const {result} = renderHook(() =>
      useForm<BudgetInput>({defaultValues: BUDGET_WITH_EMPTY_ITEM})
    );

    render(
      <BudgetItemFormFields
        disabledCategories={[]}
        control={result.current.control}
        index={0}
      />
    );

    // credit card should be the 6th item in the list based on the initial category map
    expect(screen.getAllByRole("checkbox")[5]).toHaveProp(
      "accessibilityLabel",
      "Credit card"
    );
  });

  test("renders disabled categories", () => {
    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: INITIAL_CATEGORY_MAP
    });

    const {result} = renderHook(() =>
      useForm<BudgetInput>({defaultValues: BUDGET_WITH_EMPTY_ITEM})
    );

    const disabledCategories = ["Entertainment", "Savings"];

    render(
      <BudgetItemFormFields
        disabledCategories={disabledCategories}
        control={result.current.control}
        index={0}
      />
    );

    Object.keys(INITIAL_CATEGORY_MAP).map(category => {
      const categoryCheckbox = screen.getByLabelText(category);
      expect(categoryCheckbox).toBeVisible();
      disabledCategories.includes(category)
        ? expect(categoryCheckbox).toBeDisabled()
        : expect(categoryCheckbox).toBeEnabled();
    });
  });

  test("can set item name", async () => {
    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: {}
    });

    const {result} = renderHook(() =>
      useForm<BudgetInput>({
        defaultValues: {
          ...BUDGET_WITH_EMPTY_ITEM,
          items: [{...BUDGET_WITH_EMPTY_ITEM.items[0], name: "Test item"}]
        }
      })
    );

    render(
      <BudgetItemFormFields
        disabledCategories={[]}
        control={result.current.control}
        index={0}
      />
    );

    expect(screen.getByDisplayValue("Test item")).toBeVisible();
    expect(result.current.getValues("items.0.name")).toEqual("Test item");
    fireEvent.changeText(screen.getByLabelText("Item name"), "It");
    expect(result.current.getValues("items.0.name")).toEqual("It");
  });

  test("can set item cap", async () => {
    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: {}
    });

    const {result} = renderHook(() =>
      useForm<BudgetInput>({
        defaultValues: {
          ...BUDGET_WITH_EMPTY_ITEM,
          items: [{...BUDGET_WITH_EMPTY_ITEM.items[0], cap: "20"}]
        }
      })
    );

    render(
      <BudgetItemFormFields
        disabledCategories={[]}
        control={result.current.control}
        index={0}
      />
    );

    expect(screen.getByText("£ ")).toBeVisible();
    expect(screen.getByDisplayValue("20")).toBeVisible();
    expect(result.current.getValues("items.0.cap")).toEqual("20");
    fireEvent.changeText(screen.getByLabelText("Cap"), "42");
    expect(result.current.getValues("items.0.cap")).toEqual("42");
  });

  test("cannot set disabled category", async () => {
    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: INITIAL_CATEGORY_MAP
    });

    const {result} = renderHook(() =>
      useForm<BudgetInput>({defaultValues: BUDGET_WITH_EMPTY_ITEM})
    );

    render(
      <BudgetItemFormFields
        disabledCategories={["Eating out"]}
        control={result.current.control}
        index={0}
      />
    );

    const eatingOutCheckbox = screen.getByLabelText("Eating out");
    expect(eatingOutCheckbox).toBeDisabled();
    expect(result.current.getValues("items.0.categories")).toEqual([]);
    fireEvent.press(eatingOutCheckbox);
    expect(eatingOutCheckbox).toBeDisabled();
    expect(result.current.getValues("items.0.categories")).toEqual([]);
  });

  test("can select and deselect enabled category", async () => {
    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: INITIAL_CATEGORY_MAP
    });

    const {result} = renderHook(() =>
      useForm<BudgetInput>({defaultValues: BUDGET_WITH_EMPTY_ITEM})
    );

    render(
      <BudgetItemFormFields
        disabledCategories={[]}
        control={result.current.control}
        index={0}
      />
    );

    const billsCheckbox = screen.getByLabelText("Bills");
    expect(billsCheckbox).toBeEnabled();
    expect(result.current.getValues("items.0.categories")).toEqual([]);
    fireEvent.press(billsCheckbox);
    expect(billsCheckbox).toBeEnabled();
    expect(result.current.getValues("items.0.categories")).toEqual(["Bills"]);
    fireEvent.press(billsCheckbox);
    expect(billsCheckbox).toBeEnabled();
    expect(result.current.getValues("items.0.categories")).toEqual([]);
  });
});
