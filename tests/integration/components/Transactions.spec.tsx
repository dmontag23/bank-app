import React from "react";
import nock from "nock";
import {fireEvent, render, screen, waitFor} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {NavigationContainer} from "@react-navigation/native";

import TransactionsScreen from "../../../components/Transactions/TransactionsScreen";
import config from "../../../config.json";
import {INITIAL_CATEGORY_MAP} from "../../../constants";
import {TRUELAYER_MASTERCARD} from "../../../mock-server/truelayer/data/cardData";
import {
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
} from "../../../mock-server/truelayer/data/cardTransactionData";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";

describe("Transactions", () => {
  test("renders a loading spinner when loading", () => {
    nock(config.integrations.trueLayer.sandboxDataUrl)
      .get("/v1/cards")
      .delayConnection(5000)
      .reply(200, {
        results: [TRUELAYER_MASTERCARD],
        status: "Succeeded"
      });

    render(
      <NavigationContainer>
        <TransactionsScreen />
      </NavigationContainer>
    );

    expect(screen.getByTestId("loadingSpinner")).toBeVisible();
  });

  test("renders transactions after loading", async () => {
    const testTransactions: CardTransaction[] = [
      TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
    ];
    const testPendingTransactions: CardTransaction[] = [
      TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS
    ];

    nock(config.integrations.trueLayer.sandboxDataUrl)
      .get("/v1/cards")
      .reply(200, {
        results: [TRUELAYER_MASTERCARD],
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
      .reply(200, {
        results: testTransactions,
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions/pending"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions\/pending/)
      .reply(200, {
        results: testPendingTransactions,
        status: "Succeeded"
      });

    render(
      <NavigationContainer>
        <TransactionsScreen />
      </NavigationContainer>
    );

    await waitFor(() => expect(screen.getByText("Transactions")).toBeVisible());
    [...testTransactions, ...testPendingTransactions].map(transaction => {
      expect(screen.getByText(transaction.description)).toBeVisible();
    });
  });

  test("sets a new category correctly", async () => {
    await AsyncStorage.setItem(
      "category-map",
      JSON.stringify(INITIAL_CATEGORY_MAP)
    );

    nock(config.integrations.trueLayer.sandboxDataUrl)
      .get("/v1/cards")
      .reply(200, {
        results: [TRUELAYER_MASTERCARD],
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
      .reply(200, {
        results: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS],
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions/pending"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions\/pending/)
      .reply(200, {
        results: [],
        status: "Succeeded"
      });

    const testTransactionId = `truelayer-${TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS.transaction_id}`;
    const testTransactionName =
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS.description;

    render(
      <NavigationContainer>
        <TransactionsScreen />
      </NavigationContainer>
    );

    // check that the original transaction category is displayed
    await waitFor(() =>
      expect(
        screen.getByText("24 Feb 2013 at 14:00 - Eating out")
      ).toBeVisible()
    );
    expect(await AsyncStorage.getAllKeys()).toEqual([
      "category-map",
      testTransactionId
    ]);

    // press the transaction to bring up the dialog
    fireEvent.press(screen.getByText("24 Feb 2013 at 14:00 - Eating out"));
    await waitFor(() =>
      expect(screen.getByText("Select a category")).toBeVisible()
    );
    expect(screen.getAllByText(testTransactionName)).toHaveLength(2);
    Object.keys(INITIAL_CATEGORY_MAP).map(category => {
      expect(screen.getByText(category)).toBeVisible();
    });

    // Change the category to "Savings"
    const selectCategoryText = screen.getByText("Select a category");
    fireEvent.press(screen.getByText("Savings"));

    // Check that the dialog is closed and
    // the transaction has been updated to have the "Savings" category
    await waitFor(() => expect(selectCategoryText).not.toBeOnTheScreen());
    expect(screen.getByText("24 Feb 2013 at 14:00 - Savings")).toBeVisible();
    expect(await AsyncStorage.getItem(testTransactionId)).toBe("Savings");
  });
});
