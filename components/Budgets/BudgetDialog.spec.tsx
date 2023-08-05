import React from "react";
import {v4} from "uuid";
import {describe, expect, jest, test} from "@jest/globals";
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native";

import BudgetDialog from "./BudgetDialog";
import BudgetForm from "./form/BudgetForm";

import useStoreBudget from "../../hooks/budgets/useStoreBudget";
import {ComponentTestWrapper} from "../../tests/mocks/utils";
import {Budget, BudgetInput} from "../../types/budget";

jest.mock("uuid");
jest.mock("./form/BudgetForm");
jest.mock("../../hooks/budgets/useStoreBudget");

describe("BudgetDialog component", () => {
  const DEFAULT_BUDGET: BudgetInput = {
    id: "unique-id",
    name: "",
    window: {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // first day of current month
      end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) // last day of current month
    },
    items: []
  };

  test("does not render if not visible", () => {
    // TODO: any should probably not be used as a type here, but since a
    // mutation from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useStoreBudget as jest.MockedFunction<any>).mockReturnValue({
      mutate: () => {}
    });
    (v4 as jest.MockedFunction<typeof v4>).mockReturnValue("unique-id");

    render(
      <BudgetDialog
        isVisible={false}
        hide={() => {}}
        setSelectedBudget={() => {}}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    expect(screen.queryByText("New Budget")).toBeNull();
  });

  test("renders all elements", () => {
    // TODO: any should probably not be used as a type here, but since a
    // mutation from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useStoreBudget as jest.MockedFunction<any>).mockReturnValue({
      mutate: () => {}
    });
    (v4 as jest.MockedFunction<typeof v4>).mockReturnValue("unique-id");

    render(
      <BudgetDialog
        isVisible={true}
        hide={() => {}}
        setSelectedBudget={() => {}}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    // test all dialog elements exist
    expect(screen.getByText("New Budget")).toBeVisible();
    expect(screen.getByText("Cancel")).toBeVisible();
    expect(screen.getByText("Create")).toBeVisible();

    // test budget form is called correctly
    expect(BudgetForm).toBeCalledTimes(1);
    expect(BudgetForm).toBeCalledWith({control: expect.any(Object)}, {});

    // test the form is initialized with the default budget
    const control = (BudgetForm as jest.MockedFunction<typeof BudgetForm>).mock
      .calls[0][0].control;
    expect(control._formValues).toEqual(DEFAULT_BUDGET);
  });

  test("cancels budget creation", () => {
    // TODO: any should probably not be used as a type here, but since a
    // mutation from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    // it's quicker than returning all those things for now
    (useStoreBudget as jest.MockedFunction<any>).mockReturnValue({
      mutate: () => {}
    });
    (v4 as jest.MockedFunction<typeof v4>)
      .mockReturnValueOnce("unique-id-1")
      .mockReturnValueOnce("unique-id-2");
    const mockHideFn = jest.fn();

    render(
      <BudgetDialog
        isVisible={true}
        hide={mockHideFn}
        setSelectedBudget={() => {}}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    const cancelButton = screen.getByText("Cancel");
    expect(cancelButton).toBeVisible();

    fireEvent.press(cancelButton);

    // check the form was reset properly
    expect(mockHideFn).toBeCalledTimes(1);
    expect(mockHideFn).toBeCalledWith();
    expect(BudgetForm).toBeCalledTimes(2);
    const control = (BudgetForm as jest.MockedFunction<typeof BudgetForm>).mock
      .calls[1][0].control;
    expect(control._formValues).toEqual({...DEFAULT_BUDGET, id: "unique-id-2"});
  });

  test("creates a budget", async () => {
    // TODO: any should probably not be used as a type here, but since a
    // mutation from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    // it's quicker than returning all those things for now
    const mockMutate = jest.fn();
    (useStoreBudget as jest.MockedFunction<any>).mockReturnValue({
      mutate: mockMutate
    });
    (v4 as jest.MockedFunction<typeof v4>).mockReturnValue("unique-id");
    const mockHideFn = jest.fn();
    const mockSetSelectedBudget =
      jest.fn<React.Dispatch<React.SetStateAction<Budget | null>>>();

    render(
      <BudgetDialog
        isVisible={true}
        hide={mockHideFn}
        setSelectedBudget={mockSetSelectedBudget}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    // setup non-default budget
    expect(BudgetForm).toBeCalledTimes(1);
    const control = (BudgetForm as jest.MockedFunction<typeof BudgetForm>).mock
      .calls[0][0].control;

    const newBudget: BudgetInput = {
      ...DEFAULT_BUDGET,
      items: [{id: "item-1", name: "Item 1", cap: "30", categories: []}]
    };
    control._reset(newBudget);

    const createButton = screen.getByText("Create");
    expect(createButton).toBeVisible();

    fireEvent.press(createButton);

    expect(mockHideFn).toBeCalledTimes(1);
    expect(mockHideFn).toBeCalledWith();
    await waitFor(() => expect(mockMutate).toBeCalledTimes(1));
    expect(mockMutate).toBeCalledWith({
      ...newBudget,
      items: [{...newBudget.items[0], cap: 30}]
    });
    expect(mockSetSelectedBudget).toBeCalledTimes(1);
    expect(mockSetSelectedBudget).toBeCalledWith({
      ...newBudget,
      items: [{...newBudget.items[0], cap: 30}]
    });
  });
});
