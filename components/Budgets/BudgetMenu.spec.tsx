import React from "react";
import {GestureResponderEvent} from "react-native";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import BudgetMenu from "./BudgetMenu";

import useDeleteBudget from "../../hooks/budgets/useDeleteBudget";
import useGetAllBudgets from "../../hooks/budgets/useGetAllBudgets";
import {
  BUDGET_WITH_NO_ITEMS,
  BUDGET_WITH_ONE_ITEM
} from "../../tests/mocks/data/budgets";
import {Budget} from "../../types/budget";

jest.mock("../../hooks/budgets/useDeleteBudget");
jest.mock("../../hooks/budgets/useGetAllBudgets");

describe("BudgetMenu component", () => {
  test("renders a fragment when budget data is undefined", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    const renderMenuIcon =
      jest.fn<(openMenu: (e?: GestureResponderEvent) => void) => JSX.Element>();
    (useGetAllBudgets as jest.MockedFunction<any>).mockImplementation(() => ({
      data: undefined
    }));
    (useDeleteBudget as jest.MockedFunction<any>).mockImplementation(() => ({
      mutate: () => {}
    }));

    render(
      <BudgetMenu
        renderMenuIcon={renderMenuIcon}
        setSelectedBudget={() => {}}
      />
    );

    expect(renderMenuIcon).toBeCalledTimes(1);
    expect(renderMenuIcon).toBeCalledWith(expect.any(Function));
  });

  test("renders a fragment when budget data array does not contain budgets", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    const renderMenuIcon =
      jest.fn<(openMenu: (e?: GestureResponderEvent) => void) => JSX.Element>();
    (useGetAllBudgets as jest.MockedFunction<any>).mockImplementation(() => ({
      data: []
    }));
    (useDeleteBudget as jest.MockedFunction<any>).mockImplementation(() => ({
      mutate: () => {}
    }));

    render(
      <BudgetMenu
        renderMenuIcon={renderMenuIcon}
        setSelectedBudget={() => {}}
      />
    );

    expect(renderMenuIcon).toBeCalledTimes(1);
    expect(renderMenuIcon).toBeCalledWith(expect.any(Function));
  });

  test("renders budgets", async () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    const renderMenuIcon =
      jest.fn<(openMenu: (e?: GestureResponderEvent) => void) => JSX.Element>();
    (useGetAllBudgets as jest.MockedFunction<any>).mockImplementation(() => ({
      data: [BUDGET_WITH_NO_ITEMS, BUDGET_WITH_ONE_ITEM]
    }));
    (useDeleteBudget as jest.MockedFunction<any>).mockImplementation(() => ({
      mutate: () => {}
    }));

    render(
      <BudgetMenu
        renderMenuIcon={renderMenuIcon}
        setSelectedBudget={() => {}}
      />
    );

    expect(renderMenuIcon).toBeCalledTimes(1);
    expect(renderMenuIcon).toBeCalledWith(expect.any(Function));

    // open the menu
    const openMenu = renderMenuIcon.mock.calls[0][0];
    await act(() => openMenu());

    // TODO: Investigate why toBeVisible() fails here
    // I think it's because the opacity of a parent is 0
    expect(screen.getByText(BUDGET_WITH_NO_ITEMS.name)).toBeOnTheScreen();
    expect(screen.getByText(BUDGET_WITH_ONE_ITEM.name)).toBeOnTheScreen();

    // check that there are two icon buttons
    const iconButtons = screen.getAllByRole("button");
    expect(iconButtons.length).toBe(2);
  });

  test("correctly selects a budget", async () => {
    const renderMenuIcon =
      jest.fn<(openMenu: (e?: GestureResponderEvent) => void) => JSX.Element>();
    const setSelectedBudget = jest.fn();

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useGetAllBudgets as jest.MockedFunction<any>).mockImplementation(() => ({
      data: [BUDGET_WITH_NO_ITEMS, BUDGET_WITH_ONE_ITEM]
    }));
    (useDeleteBudget as jest.MockedFunction<any>).mockImplementation(() => ({
      mutate: () => {}
    }));

    render(
      <BudgetMenu
        renderMenuIcon={renderMenuIcon}
        setSelectedBudget={setSelectedBudget}
      />
    );

    expect(renderMenuIcon).toBeCalledTimes(1);
    expect(renderMenuIcon).toBeCalledWith(expect.any(Function));

    // open the menu
    const openMenu = renderMenuIcon.mock.calls[0][0];
    await act(() => openMenu());

    const secondBudget = screen.getByText(BUDGET_WITH_ONE_ITEM.name);
    // TODO: Investigate why toBeVisible() fails here
    // I think it's because the opacity of a parent is 0
    expect(secondBudget).toBeOnTheScreen();

    fireEvent.press(secondBudget);

    await waitFor(() => expect(secondBudget).not.toBeOnTheScreen());
    expect(setSelectedBudget).toBeCalledTimes(1);
    expect(setSelectedBudget).toBeCalledWith(BUDGET_WITH_ONE_ITEM);
  });

  test("correctly deletes a budget and keeps current budget selection", async () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    const renderMenuIcon =
      jest.fn<(openMenu: (e?: GestureResponderEvent) => void) => JSX.Element>();
    const setSelectedBudget =
      jest.fn<React.Dispatch<React.SetStateAction<Budget | null>>>();
    (useGetAllBudgets as jest.MockedFunction<any>).mockImplementation(() => ({
      data: [BUDGET_WITH_NO_ITEMS, BUDGET_WITH_ONE_ITEM]
    }));
    (useDeleteBudget as jest.MockedFunction<any>).mockImplementation(() => ({
      mutate: () => {}
    }));

    render(
      <BudgetMenu
        renderMenuIcon={renderMenuIcon}
        setSelectedBudget={setSelectedBudget}
      />
    );

    expect(renderMenuIcon).toBeCalledTimes(1);
    expect(renderMenuIcon).toBeCalledWith(expect.any(Function));

    // open the menu
    const openMenu = renderMenuIcon.mock.calls[0][0];
    await act(() => openMenu());

    // check that there are two icon buttons
    const iconButtons = screen.getAllByRole("button");
    expect(iconButtons.length).toBe(2);
    const deleteSecondBudgetButton = iconButtons[1];

    fireEvent.press(deleteSecondBudgetButton);

    expect(setSelectedBudget).toBeCalledTimes(1);
    const setSelectedBudgetFn = setSelectedBudget.mock.calls[0][0] as (
      prevState: Budget | null
    ) => Budget | null;
    const selectedBudget = setSelectedBudgetFn(BUDGET_WITH_NO_ITEMS);
    expect(selectedBudget).toBe(BUDGET_WITH_NO_ITEMS);
  });

  test("correctly deletes a budget and de-selects same budget", async () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    const renderMenuIcon =
      jest.fn<(openMenu: (e?: GestureResponderEvent) => void) => JSX.Element>();
    const setSelectedBudget =
      jest.fn<React.Dispatch<React.SetStateAction<Budget | null>>>();
    (useGetAllBudgets as jest.MockedFunction<any>).mockImplementation(() => ({
      data: [BUDGET_WITH_NO_ITEMS, BUDGET_WITH_ONE_ITEM]
    }));
    (useDeleteBudget as jest.MockedFunction<any>).mockImplementation(() => ({
      mutate: () => {}
    }));

    render(
      <BudgetMenu
        renderMenuIcon={renderMenuIcon}
        setSelectedBudget={setSelectedBudget}
      />
    );

    expect(renderMenuIcon).toBeCalledTimes(1);
    expect(renderMenuIcon).toBeCalledWith(expect.any(Function));

    // open the menu
    const openMenu = renderMenuIcon.mock.calls[0][0];
    await act(() => openMenu());

    // check that there are two icon buttons
    const iconButtons = screen.getAllByRole("button");
    expect(iconButtons.length).toBe(2);
    const deleteSecondBudgetButton = iconButtons[1];

    fireEvent.press(deleteSecondBudgetButton);

    expect(setSelectedBudget).toBeCalledTimes(1);
    const setSelectedBudgetFn = setSelectedBudget.mock.calls[0][0] as (
      prevState: Budget | null
    ) => Budget | null;
    const selectedBudget = setSelectedBudgetFn(BUDGET_WITH_ONE_ITEM);
    expect(selectedBudget).toBeNull();
  });
});
