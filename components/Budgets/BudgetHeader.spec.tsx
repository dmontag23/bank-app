import React from "react";
import {act, fireEvent, render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import BudgetDialog from "./BudgetDialog";
import BudgetHeader from "./BudgetHeader";
import BudgetMenu from "./BudgetMenu";

import {BUDGET_WITH_ONE_ITEM} from "../../tests/mocks/data/budgets";

jest.mock("./BudgetDialog");
jest.mock("./BudgetMenu");

describe("BudgetHeader component", () => {
  test("renders elements", () => {
    const mockSetSelectedBudget = jest.fn();

    render(
      <BudgetHeader
        selectedBudget={null}
        setSelectedBudget={mockSetSelectedBudget}
      />
    );

    // check the budget dialog component
    expect(BudgetDialog).toBeCalledTimes(1);
    expect(BudgetDialog).toBeCalledWith(
      {
        isVisible: false,
        hide: expect.any(Function),
        setSelectedBudget: mockSetSelectedBudget
      },
      {}
    );

    // check that the add budget icon button is visible
    expect(screen.getByRole("button")).toBeVisible();

    // check the budget menu component
    expect(BudgetMenu).toBeCalledTimes(1);
    expect(BudgetMenu).toBeCalledWith(
      {
        renderMenuIcon: expect.any(Function),
        setSelectedBudget: expect.any(Function)
      },
      {}
    );

    // set the selected budget
    const setSelectBudgetFn = (
      BudgetMenu as jest.MockedFunction<typeof BudgetMenu>
    ).mock.calls[0][0].setSelectedBudget;
    setSelectBudgetFn(BUDGET_WITH_ONE_ITEM);
    expect(mockSetSelectedBudget).toBeCalledTimes(1);
    expect(mockSetSelectedBudget).toBeCalledWith(BUDGET_WITH_ONE_ITEM);

    // check the render menu icon function
    const mockOpenMenu = jest.fn();
    const renderMenuIconFn = (
      BudgetMenu as jest.MockedFunction<typeof BudgetMenu>
    ).mock.calls[0][0].renderMenuIcon;

    render(renderMenuIconFn(mockOpenMenu));

    const budgetMenuButton = screen.getByLabelText("Budget menu");
    expect(budgetMenuButton).toBeVisible();

    fireEvent.press(budgetMenuButton);

    expect(mockOpenMenu).toBeCalledTimes(1);
    expect(mockOpenMenu).toBeCalledWith();
  });

  test("has correct label on menu button", () => {
    render(
      <BudgetHeader
        selectedBudget={BUDGET_WITH_ONE_ITEM}
        setSelectedBudget={() => {}}
      />
    );

    const renderMenuIconFn = (
      BudgetMenu as jest.MockedFunction<typeof BudgetMenu>
    ).mock.calls[0][0].renderMenuIcon;

    render(renderMenuIconFn(() => {}));

    const budgetMenuButton = screen.getByText("Bil");
    expect(budgetMenuButton).toBeVisible();
  });

  test("can open and close the budget dialog", async () => {
    const mockSetSelectedBudget = jest.fn();

    render(
      <BudgetHeader
        selectedBudget={null}
        setSelectedBudget={mockSetSelectedBudget}
      />
    );

    expect(BudgetDialog).toBeCalledTimes(1);
    expect(BudgetDialog).toBeCalledWith(
      {
        isVisible: false,
        hide: expect.any(Function),
        setSelectedBudget: mockSetSelectedBudget
      },
      {}
    );

    // check that the add budget icon button is visible
    const addBudgetIcon = screen.getByRole("button");
    expect(addBudgetIcon).toBeVisible();

    // open the dialog
    fireEvent.press(addBudgetIcon);

    // check the dialog has been opened
    expect(BudgetDialog).toBeCalledTimes(2);
    const secondCall = (
      BudgetDialog as jest.MockedFunction<typeof BudgetDialog>
    ).mock.calls[1][0];
    expect(secondCall).toMatchObject({
      isVisible: true,
      hide: expect.any(Function),
      setSelectedBudget: mockSetSelectedBudget
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
      setSelectedBudget: mockSetSelectedBudget
    });
  });
});
