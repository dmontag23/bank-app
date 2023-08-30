import React from "react";
import {render, screen, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {trueLayerDataApi} from "../../api/axiosConfig";
import App from "../../App";
import {CardTransaction} from "../../types/trueLayer/dataAPI/cards";

jest.mock("../../api/axiosConfig");

describe("App component", () => {
  test("shows the auth screens if not logged in", async () => {
    // setup mocks
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    ).mockImplementation(async () => []);

    render(<App />);

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

    render(<App />);

    // check the budgets scene is rendered by default
    await waitFor(() =>
      expect(screen.getByText("Please select a budget")).toBeVisible()
    );
  });
});
