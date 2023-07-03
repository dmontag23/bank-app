import React from "react";
import {fireEvent, render, screen} from "@testing-library/react-native";

import BudgetForm from "./BudgetForm";
import BudgetItemForm from "./BudgetItemForm";

import {ComponentTestWrapper} from "../../../tests/mocks/utils";
import {BudgetInput} from "../../../types/budget";

jest.mock("uuid", () => ({
  v4: () => "unique-id"
}));

jest.mock("./BudgetItemForm");

describe("BudgetForm component", () => {
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

  test("renders the correct form fields", async () => {
    const setBudget = jest.fn();

    render(<BudgetForm budget={EMPTY_BUDGET} setBudget={setBudget} />, {
      wrapper: ComponentTestWrapper
    });

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
      {
        budget: EMPTY_BUDGET,
        setBudget
      },
      {}
    );
  });

  test("can set the name", async () => {
    const setBudget = jest.fn();
    setBudget.mockImplementation(setBudgetFn => {
      const newBudget = setBudgetFn(EMPTY_BUDGET);
      expect(newBudget).toEqual({...EMPTY_BUDGET, name: "New name"});
    });

    render(
      <BudgetForm
        budget={{...EMPTY_BUDGET, name: "Test budget"}}
        setBudget={setBudget}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    expect(screen.getByDisplayValue("Test budget")).toBeVisible();
    fireEvent.changeText(screen.getByLabelText("Name"), "New name");
    expect(setBudget).toBeCalledTimes(1);
  });

  test("can set the start date", async () => {
    const newDate = new Date("2023-03-01");

    const setBudget = jest.fn();
    setBudget.mockImplementation(setBudgetFn => {
      const newBudget = setBudgetFn(EMPTY_BUDGET);
      expect(newBudget).toEqual({
        ...EMPTY_BUDGET,
        window: {...EMPTY_BUDGET.window, start: newDate}
      });
    });

    render(<BudgetForm budget={EMPTY_BUDGET} setBudget={setBudget} />, {
      wrapper: ComponentTestWrapper
    });

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
    expect(setBudget).toBeCalledTimes(1);
  });

  test("can set the end date", async () => {
    const newDate = new Date("2023-03-01");

    const setBudget = jest.fn();
    setBudget.mockImplementation(setBudgetFn => {
      const newBudget = setBudgetFn(EMPTY_BUDGET);
      expect(newBudget).toEqual({
        ...EMPTY_BUDGET,
        window: {...EMPTY_BUDGET.window, end: newDate}
      });
    });

    render(<BudgetForm budget={EMPTY_BUDGET} setBudget={setBudget} />, {
      wrapper: ComponentTestWrapper
    });

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
    expect(setBudget).toBeCalledTimes(1);
  });

  test("does not change the budget if no start date is set", async () => {
    const setBudget = jest.fn();

    render(<BudgetForm budget={EMPTY_BUDGET} setBudget={setBudget} />, {
      wrapper: ComponentTestWrapper
    });

    fireEvent(screen.getByLabelText("Start date"), "onChange", {
      nativeEvent: {}
    });
    expect(setBudget).not.toBeCalled();
  });

  test("does not change the budget if no end date is set", async () => {
    const setBudget = jest.fn();

    render(<BudgetForm budget={EMPTY_BUDGET} setBudget={setBudget} />, {
      wrapper: ComponentTestWrapper
    });

    fireEvent(screen.getByLabelText("End date"), "onChange", {nativeEvent: {}});
    expect(setBudget).not.toBeCalled();
  });
});