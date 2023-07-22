import React from "react";
import {describe, expect, jest, test} from "@jest/globals";
import {fireEvent, render, screen} from "@testing-library/react-native";

import BudgetsScene from "./Budgets/BudgetsScene";
import Screens from "./Scenes";
import TransactionsScene from "./Transactions/TransactionsScene";

import {ComponentTestWrapper} from "../tests/mocks/utils";

jest.mock("./Budgets/BudgetsScene");
jest.mock("./Transactions/TransactionsScene");

describe("Scenes component", () => {
  test("renders the budgets scene as the default screen", () => {
    render(<Screens />, {
      wrapper: ComponentTestWrapper
    });

    const allButtons = screen.getAllByRole("button");
    expect(allButtons.length).toBe(3);

    allButtons.map(button => expect(button).toBeVisible());
    expect(BudgetsScene).toBeCalledTimes(1);
  });

  test("renders the transactions scene", async () => {
    render(<Screens />, {
      wrapper: ComponentTestWrapper
    });

    const transactionButton = screen.getByRole("button", {
      name: "Transactions"
    });
    expect(transactionButton).toBeVisible();

    // TODO: Investigate why fireEvent.press does not work here
    fireEvent(transactionButton, "click");

    expect(TransactionsScene).toBeCalledTimes(1);
  });

  test("renders the settings scene", async () => {
    render(<Screens />, {
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