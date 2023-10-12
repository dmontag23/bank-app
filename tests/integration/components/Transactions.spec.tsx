import React from "react";
import nock from "nock";
import {fireEvent, render, screen, waitFor} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {NavigationContainer} from "@react-navigation/native";

import TransactionsScreen from "../../../components/Transactions/TransactionsScreen";
import config from "../../../config.json";
import {TransactionCategory} from "../../../types/transaction";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";
import {TRUELAYER_MASTERCARD} from "../../mocks/trueLayer/dataAPI/data/cardData";
import {
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
} from "../../mocks/trueLayer/dataAPI/data/cardTransactionData";

describe("Transactions", () => {
  test("renders a loading spinner when loading", () => {
    nock(config.integrations.trueLayer.sandboxDataUrl)
      // matches any url of the form "v1/cards"
      .get(/\/v1\/cards/)
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
      // matches any url of the form "v1/cards"
      .get(/\/v1\/cards/)
      .reply(200, {
        results: [TRUELAYER_MASTERCARD],
        status: "Succeeded"
      });

    nock(config.integrations.trueLayer.sandboxDataUrl)
      // matches any url of the form "v1/cards/<uuid>/transactions"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
      .reply(200, {
        results: testTransactions,
        status: "Succeeded"
      });

    nock(config.integrations.trueLayer.sandboxDataUrl)
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
    nock(config.integrations.trueLayer.sandboxDataUrl)
      // matches any url of the form "v1/cards"
      .get(/\/v1\/cards/)
      .reply(200, {
        results: [TRUELAYER_MASTERCARD],
        status: "Succeeded"
      });

    nock(config.integrations.trueLayer.sandboxDataUrl)
      // matches any url of the form "v1/cards/<uuid>/transactions"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
      .reply(200, {
        results: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS],
        status: "Succeeded"
      });

    nock(config.integrations.trueLayer.sandboxDataUrl)
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
    // and nothing is in Async Storage
    await waitFor(() =>
      expect(
        screen.getByText(
          `24 Feb 2013 at 14:00 - ${TransactionCategory.EATING_OUT}`
        )
      ).toBeVisible()
    );
    expect(await AsyncStorage.getAllKeys()).toEqual([testTransactionId]);

    // press the transaction to bring up the dialog
    fireEvent.press(
      screen.getByText(
        `24 Feb 2013 at 14:00 - ${TransactionCategory.EATING_OUT}`
      )
    );
    await waitFor(() =>
      expect(screen.getByText("Select a category")).toBeVisible()
    );
    expect(screen.getAllByText(testTransactionName)).toHaveLength(2);
    Object.keys(TransactionCategory).map(transaction => {
      expect(screen.getByText(transaction)).toBeVisible();
    });

    // Change the category to "Savings"
    const selectCategoryText = screen.getByText("Select a category");
    fireEvent.press(screen.getByText("SAVINGS"));

    // Check that the dialog is closed and
    // the transaction has been updated to have the "Savings" category
    await waitFor(() => expect(selectCategoryText).not.toBeOnTheScreen());
    expect(
      screen.getByText(`24 Feb 2013 at 14:00 - ${TransactionCategory.SAVINGS}`)
    ).toBeVisible();
    expect(await AsyncStorage.getItem(testTransactionId)).toEqual(
      TransactionCategory.SAVINGS
    );
  });
});
