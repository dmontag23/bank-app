import React from "react";
import {Provider} from "react-native-paper";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {QueryClientProvider} from "@tanstack/react-query";
import {render, screen, waitFor} from "@testing-library/react-native";

import {trueLayerDataApi} from "../../api/axiosConfig";
import App from "../../App";
import {TruelayerAuthContextProvider} from "../../store/truelayer-auth-context";
import {CardTransaction} from "../../types/trueLayer/dataAPI/cards";
import {testQueryClient} from "../mocks/utils";

jest.mock("../../api/axiosConfig");

describe("App component", () => {
  test("shows the auth screens if not logged in", async () => {
    // setup mocks
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

    // check the third party connections scene is rendered by default
    await waitFor(() =>
      expect(
        screen.getByText("Please connect to the following services")
      ).toBeVisible()
    );
  });

  test("shows the budget screens if logged in", async () => {
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
  });
});
