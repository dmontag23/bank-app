import React from "react";
import nock from "nock";
import {fireEvent, render, screen, waitFor} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";
import {NavigationContainer} from "@react-navigation/native";

import ErrorModal from "../../../components/errors/ErrorModal";
import TransactionsScreen from "../../../components/Transactions/TransactionsScreen";
import Toasts from "../../../components/ui/Toasts";
import Config from "../../../config.json";

describe("Error", () => {
  test("displays and closes toast", async () => {
    nock(Config.STARLING_API_URL)
      .get("/v2/accounts")
      .reply(200, {accounts: []});

    nock(Config.TRUELAYER_DATA_API_URL)
      .get("/v1/cards")
      .reply(400, {error: "invalid_token"});

    render(
      <NavigationContainer>
        <TransactionsScreen />
        <Toasts />
      </NavigationContainer>
    );

    await waitFor(() =>
      expect(screen.getByText("An error occurred: invalid_token")).toBeVisible()
    );
    const toast = screen.getByText("An error occurred: invalid_token");

    const closeButton = screen.getByLabelText("Close icon");
    expect(closeButton).toBeVisible();

    fireEvent.press(closeButton);

    expect(toast).not.toBeOnTheScreen();
  });

  test("can navigate to the error modal", async () => {
    nock(Config.STARLING_API_URL)
      .get("/v2/accounts")
      .reply(200, {accounts: []});

    nock(Config.TRUELAYER_DATA_API_URL)
      .get("/v1/cards")
      .reply(400, {error: "invalid_token"});

    render(
      <NavigationContainer>
        <TransactionsScreen />
        <Toasts />
        <ErrorModal />
      </NavigationContainer>
    );

    // open the modal
    await waitFor(() => expect(screen.getByText("Show details")).toBeVisible());
    const showDetailsButton = screen.getByText("Show details");

    fireEvent.press(showDetailsButton);

    // modal contains expanded error
    await waitFor(() => expect(screen.getByText("Errors")).toBeVisible());
    expect(showDetailsButton).not.toBeOnTheScreen();

    const titleTextElement = screen.getByText("Error: invalid_token");
    expect(titleTextElement).toBeVisible();
    const detailsTextElement = screen.getByText("Error details:");
    expect(detailsTextElement).toBeVisible();

    // close the expanded element
    fireEvent.press(titleTextElement);
    expect(detailsTextElement).not.toBeOnTheScreen();

    // reopen the expanded element
    fireEvent.press(titleTextElement);
    expect(screen.getByText("Error details:")).toBeVisible();

    // close the modal
    const closeButton = screen.getByText("Close");
    expect(closeButton).toBeVisible();
    fireEvent.press(closeButton);
    await waitFor(() => expect(titleTextElement).not.toBeOnTheScreen());
  });
});
