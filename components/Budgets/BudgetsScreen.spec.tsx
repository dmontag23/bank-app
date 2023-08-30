import React from "react";
import {act, render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import Budget from "./Budget";
import BudgetHeader from "./BudgetHeader";
import BudgetsScreen from "./BudgetsScreen";

import {BUDGET_WITH_ONE_ITEM} from "../../tests/mocks/data/budgets";

jest.mock("./Budget");
jest.mock("./BudgetHeader");

describe("BudgetsScreen component", () => {
  test("renders a screen without a selected budget", () => {
    render(<BudgetsScreen />);

    expect(BudgetHeader).toBeCalledTimes(1);
    expect(BudgetHeader).toBeCalledWith(
      {
        selectedBudget: null,
        setSelectedBudget: expect.any(Function)
      },
      {}
    );
    expect(screen.getByText("Please select a budget")).toBeVisible();
    expect(Budget).not.toBeCalled();
  });

  test("can select a new budget", () => {
    render(<BudgetsScreen />);

    expect(BudgetHeader).toBeCalledTimes(1);
    expect(BudgetHeader).toBeCalledWith(
      {
        selectedBudget: null,
        setSelectedBudget: expect.any(Function)
      },
      {}
    );

    const budgetHeaderMock = (
      BudgetHeader as jest.MockedFunction<typeof BudgetHeader>
    ).mock;
    const setSelectedBudgetFn = budgetHeaderMock.calls[0][0].setSelectedBudget;

    act(() => setSelectedBudgetFn(BUDGET_WITH_ONE_ITEM));

    expect(BudgetHeader).toBeCalledTimes(2);
    const secondCall = budgetHeaderMock.calls[1][0];
    expect(secondCall).toMatchObject({
      selectedBudget: BUDGET_WITH_ONE_ITEM,
      setSelectedBudget: expect.any(Function)
    });
    expect(Budget).toBeCalledTimes(1);
    expect(Budget).toBeCalledWith({budget: BUDGET_WITH_ONE_ITEM}, {});
  });
});
