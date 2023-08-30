import React from "react";
import {fireEvent, render, screen, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {NavigationContainer} from "@react-navigation/native";

import {trueLayerDataApi} from "../../api/axiosConfig";
import LoggedInScreens from "../../components/LoggedInScreens";
import {CardTransaction} from "../../types/trueLayer/dataAPI/cards";

jest.mock("../../api/axiosConfig");

describe("Logged in screen views", () => {
  test("can switch between screens", async () => {
    // setup mocks
    await AsyncStorage.setItem(
      "truelayer-auth-token",
      "dummy-truelayer-auth-token"
    );
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    ).mockImplementation(async () => []);

    render(
      <NavigationContainer>
        <LoggedInScreens />
      </NavigationContainer>
    );

    // check the budgets scene is rendered by default
    await waitFor(() =>
      expect(screen.getByText("Please select a budget")).toBeVisible()
    );

    // navigate to the transactions scene
    expect(screen.getAllByText("Transactions").length).toBe(2);
    const transactionButton = screen.getByRole("button", {
      name: "Transactions"
    });
    expect(transactionButton).toBeVisible();
    // TODO: investigate why fireEvent.press does not work here
    fireEvent(transactionButton, "click");
    await waitFor(() =>
      expect(screen.getAllByText("Transactions").length).toBe(3)
    );

    // navigate to the settings scene
    const settingsButton = screen.getByRole("button", {
      name: "Settings"
    });
    expect(settingsButton).toBeVisible();
    // TODO: investigate why fireEvent.press does not work here
    fireEvent(settingsButton, "click");
    expect(screen.getAllByText("Settings").length).toBe(3);

    // navigate back to the budgets scene
    const budgetsButton = screen.getByRole("button", {
      name: "Budgets"
    });
    expect(budgetsButton).toBeVisible();
    // TODO: investigate why fireEvent.press does not work here
    fireEvent(budgetsButton, "click");
    expect(screen.getByText("Please select a budget")).toBeVisible();
  });
});
