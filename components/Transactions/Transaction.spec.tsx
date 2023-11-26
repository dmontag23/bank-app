import React from "react";
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

import {INITIAL_CATEGORY_MAP} from "../../constants";
import useStoreTransactionCategoryMap from "../../hooks/transactions/useStoreTransactionCategoryMap";
import {Source, Transaction as TransactionType} from "../../types/transaction";
import CategoryIcon from "../ui/CategoryIcon";

jest.mock("./CategoryList");
jest.mock("../../hooks/transactions/useStoreTransactionCategoryMap");
jest.mock("../ui/CategoryIcon");

describe("Transaction component", () => {
  const testTransaction: TransactionType = {
    id: "id-1",
    name: "Test transaction",
    description: "This is a test transaction",
    amount: 12.7,
    category: "Entertainment",
    timestamp: new Date("2023-01-01T00:00:00Z"),
    source: Source.TRUELAYER
  };

  test("renders a transaction correctly", () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useStoreTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      mutate: jest.fn()
    });

    render(<Transaction transaction={testTransaction} categoryMap={{}} />);

    expect(screen.getByText(testTransaction.name)).toBeVisible();
    expect(
      screen.getByText(`1 Jan 2023 at 00:00  -  ${testTransaction.category}`)
    ).toBeVisible();
    expect(screen.getByText("£12.70")).toBeVisible();

    expect(CategoryIcon).toBeCalledTimes(1);
    expect(CategoryIcon).toBeCalledWith(INITIAL_CATEGORY_MAP.Unknown, {});
  });

  test("sets a new category correctly", async () => {
    // setup mocks
    const updateStore = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useStoreTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValue({
      mutate: updateStore
    });

    render(<Transaction transaction={testTransaction} categoryMap={{}} />);

    // press the transaction to bring up the dialog
    fireEvent.press(screen.getByText(testTransaction.name));
    await waitFor(() =>
      expect(screen.getByText("Select a category")).toBeVisible()
    );
    expect(screen.getAllByText(testTransaction.name)).toHaveLength(2);

    // check the category list component is called correctly with the correct props
    expect(CategoryList).toBeCalledTimes(1);
    expect(CategoryList).toBeCalledWith(
      {onItemPress: expect.any(Function)},
      {}
    );
    const onItemPressFn =
      (CategoryList as jest.MockedFunction<typeof CategoryList>).mock
        .calls[0][0].onItemPress ?? jest.fn();

    const selectCategoryText = screen.getByText("Select a category");

    // Change the category
    act(() => {
      onItemPressFn("Savings");
    });

    // Check that the dialog is closed and
    // the transaction has been updated to have the "Savings" category
    await waitFor(() => expect(selectCategoryText).not.toBeOnTheScreen());
    expect(screen.getAllByText(testTransaction.name)).toHaveLength(1);
    expect(updateStore).toBeCalledTimes(1);
    expect(updateStore).toBeCalledWith({
      transactionIdToCategoryMapping: {
        [testTransaction.id]: "Savings"
      },
      source: Source.TRUELAYER
    });
  });

  test("uses the correct category from the category map", () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useStoreTransactionCategoryMap as jest.MockedFunction<any>
    ).mockReturnValue({
      mutate: jest.fn()
    });

    render(
      <Transaction
        transaction={testTransaction}
        categoryMap={INITIAL_CATEGORY_MAP}
      />
    );

    expect(CategoryIcon).toBeCalledTimes(1);
    expect(CategoryIcon).toBeCalledWith(INITIAL_CATEGORY_MAP.Entertainment, {});
  });
});
