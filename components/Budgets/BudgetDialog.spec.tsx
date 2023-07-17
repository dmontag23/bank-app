import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native";

import BudgetDialog from "./BudgetDialog";
import BudgetForm from "./form/BudgetForm";

import {ComponentTestWrapper} from "../../tests/mocks/utils";
import {BudgetInput} from "../../types/budget";

jest.mock("uuid", () => ({
  v4: () => "unique-id"
}));
jest.mock("./form/BudgetForm");

describe("BudgetDialog component", () => {
  test("does not render if not visible", () => {
    render(
      <BudgetDialog
        isVisible={false}
        hide={() => {}}
        onSubmit={async () => {}}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    expect(screen.queryByText("New Budget")).toBeNull();
  });

  test("renders all elements", () => {
    render(
      <BudgetDialog
        isVisible={true}
        hide={() => {}}
        onSubmit={async () => {}}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    const defaultBudget: BudgetInput = {
      id: "unique-id",
      name: "",
      window: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      },
      items: []
    };

    // test all dialog elements exist
    expect(screen.getByText("New Budget")).toBeVisible();
    expect(screen.getByText("Cancel")).toBeVisible();
    expect(screen.getByText("Create")).toBeVisible();

    // test budget form is called correctly
    expect(BudgetForm).toBeCalledTimes(1);
    expect(BudgetForm).toBeCalledWith(
      {
        budget: defaultBudget,
        setBudget: expect.any(Function)
      },
      {}
    );
    const setBudgetFn = (BudgetForm as jest.MockedFunction<typeof BudgetForm>)
      .mock.calls[0][0].setBudget;
    act(() => setBudgetFn({...defaultBudget, name: "Budget name"}));
    expect(BudgetForm).toBeCalledTimes(2);
    expect(BudgetForm).toBeCalledWith(
      {
        budget: {...defaultBudget, name: "Budget name"},
        setBudget: expect.any(Function)
      },
      {}
    );
  });

  test("cancels budget creation", () => {
    const mockHideFn = jest.fn();

    render(
      <BudgetDialog
        isVisible={true}
        hide={mockHideFn}
        onSubmit={async () => {}}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    const defaultBudget: BudgetInput = {
      id: "unique-id",
      name: "",
      window: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      },
      items: []
    };

    // setup non-default budget
    expect(BudgetForm).toBeCalledTimes(1);
    const setBudgetFn = (BudgetForm as jest.MockedFunction<typeof BudgetForm>)
      .mock.calls[0][0].setBudget;

    act(() => setBudgetFn({...defaultBudget, name: "Test budget"}));
    expect(BudgetForm).toBeCalledTimes(2);
    expect(BudgetForm).toBeCalledWith(
      expect.objectContaining({
        budget: expect.objectContaining({name: "Test budget"})
      }),
      {}
    );

    const cancelButton = screen.getByText("Cancel");
    expect(cancelButton).toBeVisible();

    fireEvent.press(cancelButton);

    expect(mockHideFn).toBeCalledTimes(1);
    expect(mockHideFn).toBeCalledWith();
    expect(BudgetForm).toBeCalledTimes(3);
    const lastBudgetCall = (
      BudgetForm as jest.MockedFunction<typeof BudgetForm>
    ).mock.calls[2][0].budget;
    expect(lastBudgetCall).toEqual(defaultBudget);
  });

  test("creates a budget", async () => {
    const mockHideFn = jest.fn();
    const mockOnSubmit = jest.fn();

    render(
      <BudgetDialog
        isVisible={true}
        hide={mockHideFn}
        onSubmit={mockOnSubmit}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    const defaultBudget: BudgetInput = {
      id: "unique-id",
      name: "",
      window: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      },
      items: []
    };

    // setup non-default budget
    expect(BudgetForm).toBeCalledTimes(1);
    const setBudgetFn = (BudgetForm as jest.MockedFunction<typeof BudgetForm>)
      .mock.calls[0][0].setBudget;

    const newBudget: BudgetInput = {
      ...defaultBudget,
      items: [{id: "item-1", name: "Item 1", cap: "30", categories: []}]
    };
    act(() => setBudgetFn(newBudget));
    expect(BudgetForm).toBeCalledTimes(2);
    expect(BudgetForm).toBeCalledWith(
      expect.objectContaining({budget: newBudget}),
      {}
    );

    const createButton = screen.getByText("Create");
    expect(createButton).toBeVisible();

    fireEvent.press(createButton);

    expect(mockOnSubmit).toBeCalledTimes(1);
    expect(mockOnSubmit).toBeCalledWith({
      ...newBudget,
      items: [{...newBudget.items[0], cap: 30}]
    });
    await waitFor(() => expect(mockHideFn).toBeCalledTimes(1));
    expect(mockHideFn).toBeCalledWith();
    expect(BudgetForm).toBeCalledTimes(3);
    const lastBudgetCall = (
      BudgetForm as jest.MockedFunction<typeof BudgetForm>
    ).mock.calls[2][0].budget;
    expect(lastBudgetCall).toEqual(defaultBudget);
  });
});
