import React from "react";
import nock from "nock";
import {fireEvent, render, screen, waitFor} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import App from "../../App";
import config from "../../config.json";

describe("App component", () => {
  test("shows the auth screens if not logged in", async () => {
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

    render(<App />);

    // check the budgets scene is rendered by default
    await waitFor(() =>
      expect(screen.getByText("Please select a budget")).toBeVisible()
    );
  });

  test("shows error badge on settings icon", async () => {
    // setup mocks
    await AsyncStorage.setItem(
      "truelayer-auth-token",
      "dummy-truelayer-auth-token"
    );

    nock(config.integrations.trueLayer.sandboxDataUrl)
      // matches any url of the form "v1/cards/<uuid>/transactions"
      .get(/\/v1\/cards\/([0-9a-z]+)\/transactions/)
      .reply(400, {error: "invalid_token"});

    nock(config.integrations.trueLayer.sandboxDataUrl)
      // matches any url of the form "v1/cards/<uuid>/transactions"
      .get(/\/v1\/cards\/([0-9a-z]+)\/transactions/)
      .reply(200, {
        results: [],
        status: "Succeeded"
      });

    render(<App />);

    // check the budgets scene is rendered by default
    await waitFor(() =>
      expect(screen.getByText("Please select a budget")).toBeVisible()
    );

    // navigate to the transactions screen
    // TODO: investigate why fireEvent.press does not work here
    fireEvent(
      screen.getByRole("button", {
        name: "Transactions"
      }),
      "click"
    );

    // check the badge on the settings button displays the correct value
    await waitFor(() => expect(screen.getByText("1")).toBeVisible());

    // navigate to the settings screen
    // TODO: investigate why fireEvent.press does not work here
    fireEvent(
      screen.getByRole("button", {
        name: "Settings"
      }),
      "click"
    );
    expect(screen.getAllByText("Settings").length).toBe(3);

    // check the badge appears on the settings page
    expect(screen.getAllByText("1").length).toBe(2);

    // navigate back to the transactions page to trigger the second
    // (successful) call to the api
    // TODO: investigate why fireEvent.press does not work here
    fireEvent(
      screen.getByRole("button", {
        name: "Transactions"
      }),
      "click"
    );

    await waitFor(() =>
      expect(screen.getAllByText("Transactions").length).toBe(3)
    );
    // ensure the badge on the settings icon has disappeared
    expect(screen.queryByText("1")).toBeNull();

    // ensure the badge on the settings screen is also gone
    // TODO: investigate why fireEvent.press does not work here
    fireEvent(
      screen.getByRole("button", {
        name: "Settings"
      }),
      "click"
    );
    expect(screen.getAllByText("Settings").length).toBe(3);
    expect(screen.queryByText("1")).toBeNull();
  });
});
