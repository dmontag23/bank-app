import React from "react";
import {
  fireEvent,
  render,
  screen,
  tabNavigationObject
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import {NavigationContainer} from "@react-navigation/native";

import BudgetsScreen from "./Budgets/BudgetsScreen";
import LoggedInScreens from "./LoggedInScreens";
import SettingsScreen from "./Settings/SettingsScreen";
import TransactionsScreen from "./Transactions/TransactionsScreen";

import ErrorContext from "../store/error-context";

jest.mock("./Budgets/BudgetsScreen");
jest.mock("./Settings/SettingsScreen");
jest.mock("./Transactions/TransactionsScreen");

// TODO: Come back and see if there's a way to test the icons
describe("LoggedInScreens component", () => {
  test("renders the budgets scene as the default screen", () => {
    render(
      <NavigationContainer>
        <LoggedInScreens />
      </NavigationContainer>
    );

    const allButtons = screen.getAllByRole("button");
    expect(allButtons.length).toBe(3);

    allButtons.map(button => expect(button).toBeVisible());
    expect(BudgetsScreen).toBeCalledTimes(1);
    expect(BudgetsScreen).toBeCalledWith(
      {
        navigation: tabNavigationObject,
        route: expect.objectContaining({name: "Budgets", params: undefined})
      },
      {}
    );
  });

  test("renders the transactions screen", () => {
    render(
      <NavigationContainer>
        <LoggedInScreens />
      </NavigationContainer>
    );

    const transactionButton = screen.getByRole("button", {
      name: "Transactions"
    });
    expect(transactionButton).toBeVisible();

    // TODO: Investigate why fireEvent.press does not work here
    fireEvent(transactionButton, "click");

    expect(TransactionsScreen).toBeCalledTimes(1);
    expect(TransactionsScreen).toBeCalledWith(
      {
        navigation: tabNavigationObject,
        route: expect.objectContaining({
          name: "Transactions",
          params: undefined
        })
      },
      {}
    );
  });

  test("renders the settings screen", () => {
    render(
      <NavigationContainer>
        <LoggedInScreens />
      </NavigationContainer>
    );

    const settingsButton = screen.getByRole("button", {
      name: "Settings"
    });
    expect(settingsButton).toBeVisible();

    // TODO: Investigate why fireEvent.press does not work here
    fireEvent(settingsButton, "click");

    expect(SettingsScreen).toBeCalledTimes(1);
    expect(SettingsScreen).toBeCalledWith(
      {
        navigation: tabNavigationObject,
        route: expect.objectContaining({name: "Settings", params: undefined})
      },
      {}
    );
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
        <NavigationContainer>
          <LoggedInScreens />
        </NavigationContainer>
      </ErrorContext.Provider>
    );

    expect(screen.getByText("2")).toBeVisible();
  });
});
