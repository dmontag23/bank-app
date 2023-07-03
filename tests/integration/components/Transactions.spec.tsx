import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native";

import {trueLayerDataApi} from "../../../axiosConfig";
import TransactionsScene from "../../../components/Transactions/TransactionsScene";
import {TransactionCategory} from "../../../types/transaction";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";
import {
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
} from "../../mocks/trueLayer/dataAPI/data/cardData";
import {ComponentTestWrapper} from "../../mocks/utils";

jest.mock("../../../axiosConfig");

describe("Transactions", () => {
  test("renders a loading spinner when loading", () => {
    // TODO: Can probably refactor this across all tests to have a
    // helper where you just pass in the implementation for the data
    // mock
    (
      trueLayerDataApi as jest.MockedObject<typeof trueLayerDataApi>
    ).get.mockImplementation(async () => new Promise(() => {}));

    render(<TransactionsScene />, {
      wrapper: ComponentTestWrapper
    });

    expect(screen.getByTestId("loadingSpinner")).toBeVisible();
  });

  test("renders transactions after loading", async () => {
    const testTransactions: CardTransaction[] = [
      TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
    ];
    (
      trueLayerDataApi as jest.MockedObject<typeof trueLayerDataApi>
    ).get.mockImplementation(async () => testTransactions);

    render(<TransactionsScene />, {
      wrapper: ComponentTestWrapper
    });

    await waitFor(() => expect(screen.getByText("Transactions")).toBeVisible());
    testTransactions.map(transaction => {
      expect(screen.getByText(transaction.description)).toBeVisible();
    });
  });

  test("sets a new category correctly", async () => {
    (
      trueLayerDataApi as jest.MockedObject<typeof trueLayerDataApi>
    ).get.mockImplementation(async () => [
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
    ]);

    const testTransactionId = `truelayer-${TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS.transaction_id}`;
    const testTransactionName =
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS.description;

    render(<TransactionsScene />, {
      wrapper: ComponentTestWrapper
    });

    // check that the original transaction category is displayed
    // and nothing is in Async Storage
    await waitFor(() =>
      expect(screen.getByText(TransactionCategory.EATING_OUT)).toBeVisible()
    );
    expect(await AsyncStorage.getAllKeys()).toEqual([testTransactionId]);

    // press the transaction to bring up the dialog
    fireEvent.press(screen.getByText(TransactionCategory.EATING_OUT));
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
    expect(screen.getByText(TransactionCategory.SAVINGS)).toBeVisible();
    expect(await AsyncStorage.getItem(testTransactionId)).toEqual(
      TransactionCategory.SAVINGS
    );
  });
});
