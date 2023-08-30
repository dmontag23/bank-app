import React from "react";
import {Text} from "react-native";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import CategoryList from "./CategoryList";
import Transaction from "./Transaction";

import useStoreTransactionCategoryMap from "../../hooks/transactions/useStoreTransactionCategoryMap";
import {
  TransactionCategory,
  Transaction as TransactionType
} from "../../types/transaction";

jest.mock("./CategoryList");
jest.mock("../../hooks/transactions/useStoreTransactionCategoryMap");

describe("Transaction component", () => {
  const testTransaction: TransactionType = {
    id: "id-1",
    name: "Test transaction",
    description: "This is a test transaction",
    amount: 12.7,
    category: TransactionCategory.ENTERTAINMENT
  };

  test("renders a transaction correctly", () => {
    // setup mocks
    const mockUseStoreTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useStoreTransactionCategoryMap as jest.MockedFunction<any>;
    mockUseStoreTransactionCategoryMap.mockImplementation(() => ({
      mutate: jest.fn()
    }));

    render(<Transaction transaction={testTransaction} />);

    expect(screen.getByText(testTransaction.name)).toBeVisible();
    expect(screen.getByText(testTransaction.category)).toBeVisible();
    expect(screen.getByText("£12.70")).toBeVisible();
  });

  test("sets a new category correctly", async () => {
    // setup mocks
    const updateStore = jest.fn();
    const mockUseStoreTransactionCategoryMap =
      // TODO: any should probably not be used as a type here, but since a
      // query from tanstack query returns a whole bunch of non-optional things,
      // it's quicker than returning all those things for now
      useStoreTransactionCategoryMap as jest.MockedFunction<any>;
    mockUseStoreTransactionCategoryMap.mockImplementation(() => ({
      mutate: updateStore
    }));

    const mockCategoryList = CategoryList as jest.MockedFunction<
      typeof CategoryList
    >;
    // TODO: Not a big fan of this approach. Come back
    // and see if functional methods can be used here
    let onItemPress: ((category: TransactionCategory) => void) | undefined;
    mockCategoryList.mockImplementation(props => {
      onItemPress = props.onItemPress;
      return <Text>Category 1</Text>;
    });

    render(<Transaction transaction={testTransaction} />);

    // press the transaction to bring up the dialog
    fireEvent.press(screen.getByText(testTransaction.name));
    await waitFor(() =>
      expect(screen.getByText("Select a category")).toBeVisible()
    );
    expect(screen.getAllByText(testTransaction.name)).toHaveLength(2);
    expect(screen.getByText("Category 1")).toBeVisible();

    const selectCategoryText = screen.getByText("Select a category");

    // Change the category
    act(() => {
      if (onItemPress) onItemPress(TransactionCategory.SAVINGS);
    });

    // Check that the dialog is closed and
    // the transaction has been updated to have the "Savings" category
    await waitFor(() => expect(selectCategoryText).not.toBeOnTheScreen());
    expect(screen.getAllByText(testTransaction.name)).toHaveLength(1);
    expect(updateStore).toBeCalledTimes(1);
    expect(updateStore).toBeCalledWith({
      [testTransaction.id]: TransactionCategory.SAVINGS
    });
  });
});
