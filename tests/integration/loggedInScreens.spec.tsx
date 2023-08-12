import React from "react";
import {Provider} from "react-native-paper";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {QueryClientProvider} from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native";

import App from "../../App";
import {trueLayerDataApi} from "../../axiosConfig";
import {TruelayerAuthContextProvider} from "../../store/truelayer-auth-context";
import {CardTransaction} from "../../types/trueLayer/dataAPI/cards";
import {testQueryClient} from "../mocks/utils";

jest.mock("../../axiosConfig");

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
      <QueryClientProvider client={testQueryClient}>
        <TruelayerAuthContextProvider>
          <Provider>
            <App />
          </Provider>
        </TruelayerAuthContextProvider>
      </QueryClientProvider>
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
    expect(screen.getByText("All settings")).toBeVisible();

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
