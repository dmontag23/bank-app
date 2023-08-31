import React from "react";
import {useForm} from "react-hook-form";
import {fireEvent, render, renderHook, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import BudgetForm from "./BudgetForm";
import BudgetItemForm from "./BudgetItemForm";

import {BudgetInput} from "../../../types/budget";

jest.mock("./BudgetItemForm");

describe("BudgetForm component", () => {
  const EMPTY_BUDGET: BudgetInput = {
    id: "1",
    name: "",
    window: {
      start: new Date("2023-01-01"),
      end: new Date("2023-01-31")
    },
    items: []
  };

  test("renders the correct form fields", async () => {
    const {result} = renderHook(() =>
      useForm<BudgetInput>({defaultValues: EMPTY_BUDGET})
    );

    render(<BudgetForm control={result.current.control} />);

    expect(screen.getByLabelText("Name")).toBeVisible();

    const startDateElement = screen.getByLabelText("Start date");
    expect(startDateElement).toBeVisible();
    expect(startDateElement.props.date).toEqual(
      EMPTY_BUDGET.window.start.getTime()
    );
    const endDateElement = screen.getByLabelText("End date");
    expect(endDateElement).toBeVisible();
    expect(endDateElement.props.date).toEqual(
      EMPTY_BUDGET.window.end.getTime()
    );

    expect(BudgetItemForm).toBeCalledTimes(1);
    expect(BudgetItemForm).toBeCalledWith(
      {control: result.current.control},
      {}
    );
  });

  test("can set the name", async () => {
    const {result} = renderHook(() =>
      useForm<BudgetInput>({
        defaultValues: {...EMPTY_BUDGET, name: "Test budget"}
      })
    );

    render(<BudgetForm control={result.current.control} />);

    expect(screen.getByDisplayValue("Test budget")).toBeVisible();
    expect(result.current.getValues("name")).toEqual("Test budget");
    fireEvent.changeText(screen.getByLabelText("Name"), "New name");
    expect(result.current.getValues("name")).toEqual("New name");
  });

  test("can set the start date", async () => {
    const newDate = new Date("2023-03-01");

    const {result} = renderHook(() =>
      useForm<BudgetInput>({defaultValues: EMPTY_BUDGET})
    );

    render(<BudgetForm control={result.current.control} />);

    expect(result.current.getValues("window.start")).toEqual(
      EMPTY_BUDGET.window.start
    );
    fireEvent(
      screen.getByLabelText("Start date"),
      "onChange",
      {
        type: "set",
        nativeEvent: {
          timestamp: newDate.getTime()
        }
      },
      newDate
    );
    expect(result.current.getValues("window.start")).toEqual(newDate);
  });

  test("can set the end date", async () => {
    const newDate = new Date("2023-03-01");

    const {result} = renderHook(() =>
      useForm<BudgetInput>({defaultValues: EMPTY_BUDGET})
    );

    render(<BudgetForm control={result.current.control} />);

    expect(result.current.getValues("window.end")).toEqual(
      EMPTY_BUDGET.window.end
    );
    fireEvent(
      screen.getByLabelText("End date"),
      "onChange",
      {
        type: "set",
        nativeEvent: {
          timestamp: newDate.getTime()
        }
      },
      newDate
    );
    expect(result.current.getValues("window.end")).toEqual(newDate);
  });

  test("does not change the budget if no start date is set", async () => {
    const {result} = renderHook(() =>
      useForm<BudgetInput>({defaultValues: EMPTY_BUDGET})
    );

    render(<BudgetForm control={result.current.control} />);

    expect(result.current.getValues("window.start")).toEqual(
      EMPTY_BUDGET.window.start
    );
    fireEvent(screen.getByLabelText("Start date"), "onChange", {
      nativeEvent: {}
    });
    expect(result.current.getValues("window.start")).toEqual(
      EMPTY_BUDGET.window.start
    );
  });

  test("does not change the budget if no end date is set", async () => {
    const {result} = renderHook(() =>
      useForm<BudgetInput>({defaultValues: EMPTY_BUDGET})
    );

    render(<BudgetForm control={result.current.control} />);

    expect(result.current.getValues("window.end")).toEqual(
      EMPTY_BUDGET.window.end
    );
    fireEvent(screen.getByLabelText("End date"), "onChange", {nativeEvent: {}});
    expect(result.current.getValues("window.end")).toEqual(
      EMPTY_BUDGET.window.end
    );
  });
});
