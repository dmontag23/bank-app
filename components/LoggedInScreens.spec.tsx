import React from "react";
import {describe, expect, jest, test} from "@jest/globals";
import {fireEvent, render, screen} from "@testing-library/react-native";

import BudgetsScreen from "./Budgets/BudgetsScreen";
import LoggedInScreens from "./LoggedInScreens";
import TransactionsScreen from "./Transactions/TransactionsScreen";

import {ComponentTestWrapper} from "../tests/mocks/utils";

jest.mock("./Budgets/BudgetsScreen");
jest.mock("./Transactions/TransactionsScreen");

describe("LoggedInScreens component", () => {
  test("renders the budgets scene as the default screen", () => {
    render(<LoggedInScreens />, {
      wrapper: ComponentTestWrapper
    });

    const allButtons = screen.getAllByRole("button");
    expect(allButtons.length).toBe(3);

    allButtons.map(button => expect(button).toBeVisible());
    expect(BudgetsScreen).toBeCalledTimes(1);
  });

  test("renders the transactions scene", () => {
    render(<LoggedInScreens />, {
      wrapper: ComponentTestWrapper
    });

    const transactionButton = screen.getByRole("button", {
      name: "Transactions"
    });
    expect(transactionButton).toBeVisible();

    // TODO: Investigate why fireEvent.press does not work here
    fireEvent(transactionButton, "click");

    expect(TransactionsScreen).toBeCalledTimes(1);
  });

  test("renders the settings scene", () => {
    render(<LoggedInScreens />, {
      wrapper: ComponentTestWrapper
    });

    const transactionButton = screen.getByRole("button", {
      name: "Settings"
    });
    expect(transactionButton).toBeVisible();

    // TODO: Investigate why fireEvent.press does not work here
    fireEvent(transactionButton, "click");

    expect(screen.getByText("All settings")).toBeVisible();
  });
});
