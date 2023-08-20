import React from "react";
import {describe, expect, jest, test} from "@jest/globals";
import {fireEvent, render, screen} from "@testing-library/react-native";

import BudgetsScreen from "./Budgets/BudgetsScreen";
import LoggedInScreens from "./LoggedInScreens";
import SettingsScreen from "./Settings/SettingsScreen";
import TransactionsScreen from "./Transactions/TransactionsScreen";

import ErrorContext from "../store/error-context";
import {ComponentTestWrapper} from "../tests/mocks/utils";

jest.mock("./Budgets/BudgetsScreen");
jest.mock("./Settings/SettingsScreen");
jest.mock("./Transactions/TransactionsScreen");

// TODO: Come back and see if there's a way to test the icons
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

  test("renders the transactions screen", () => {
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

  test("renders the settings screen", () => {
    render(<LoggedInScreens />, {
      wrapper: ComponentTestWrapper
    });

    const settingsButton = screen.getByRole("button", {
      name: "Settings"
    });
    expect(settingsButton).toBeVisible();

    // TODO: Investigate why fireEvent.press does not work here
    fireEvent(settingsButton, "click");

    expect(SettingsScreen).toBeCalledTimes(1);
  });

  test("checks the badge appears on the settings menu option if there are errors", () => {
    render(
      <ErrorContext.Provider
        value={{
          errors: [
            {id: "1", error: ""},
            {id: "2", error: ""}
          ],
          addError: () => {},
          removeError: () => {},
          errorModal: {
            isVisible: false,
            showModal: () => {},
            hideModal: () => {}
          }
        }}>
        <LoggedInScreens />
      </ErrorContext.Provider>,
      {
        wrapper: ComponentTestWrapper
      }
    );

    expect(screen.getByText("2")).toBeVisible();
  });
});
