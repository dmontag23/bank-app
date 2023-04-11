import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native";

import Transaction from "./Transaction";

import {ComponentTestWrapper} from "../../tests/mocks/utils";
import {
  TransactionCategory,
  Transaction as TransactionType
} from "../../types/transaction";

describe("Transaction component", () => {
  const testTransaction: TransactionType = {
    id: "id-1",
    name: "Test transaction",
    description: "This is a test transaction",
    amount: 12.7,
    category: TransactionCategory.ENTERTAINMENT
  };

  test("renders a transaction correctly", () => {
    render(<Transaction transaction={testTransaction} />, {
      wrapper: ComponentTestWrapper
    });

    expect(screen.getByText(testTransaction.name)).toBeVisible();
    expect(screen.getByText(testTransaction.category)).toBeVisible();
    expect(screen.getByText(testTransaction.amount.toString())).toBeVisible();
  });

  test("sets a new category correctly", async () => {
    render(<Transaction transaction={testTransaction} />, {
      wrapper: ComponentTestWrapper
    });

    // check that the original transaction category is displayed
    // and nothing is in Async Storage
    expect(screen.getByText(TransactionCategory.ENTERTAINMENT)).toBeVisible();
    expect(await AsyncStorage.getAllKeys()).toEqual([]);

    // press the transaction to bring up the dialog
    fireEvent.press(screen.getByText(testTransaction.name));
    await waitFor(() =>
      expect(screen.getByText("Select a category")).toBeVisible()
    );
    expect(screen.getAllByText(testTransaction.name)).toHaveLength(2);
    Object.keys(TransactionCategory).map(transaction => {
      expect(screen.getByText(transaction)).toBeVisible();
    });
    const selectCategoryText = screen.getByText("Select a category");

    // Change the category to "Savings"
    fireEvent.press(screen.getByText("SAVINGS"));

    // Check that the dialog is closed and
    // the transaction has been updated to have the "Savings" category
    await waitFor(() => expect(selectCategoryText).not.toBeOnTheScreen());
    expect(await AsyncStorage.getItem(testTransaction.id)).toEqual(
      TransactionCategory.SAVINGS
    );
  });
});
