import React from "react";
import {act, render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import Transaction from "./Transaction";
import TransactionList from "./TransactionList";

import {INITIAL_CATEGORY_MAP} from "../../constants";
import {EATING_OUT_CARD_TRANSACTION} from "../../tests/mocks/data/transactions";
import {Source, Transaction as TransactionType} from "../../types/transaction";
import LoadingSpinner from "../ui/LoadingSpinner";

jest.mock("./Transaction");
jest.mock("../ui/LoadingSpinner");

describe("TransactionList component", () => {
  test("renders a transaction list correctly", () => {
    const testTransactions: TransactionType[] = [
      EATING_OUT_CARD_TRANSACTION,
      {
        id: "id-2",
        name: "Savings transaction",
        description: "This is my second transaction",
        amount: 12.29,
        category: "Savings",
        timestamp: new Date("2023-01-01"),
        source: Source.TRUELAYER
      }
    ];

    render(
      <TransactionList
        transactions={testTransactions}
        categoryMap={INITIAL_CATEGORY_MAP}
      />
    );

    expect(Transaction).toBeCalledTimes(testTransactions.length);
    testTransactions.map(transaction =>
      expect(Transaction).toBeCalledWith(
        {
          transaction: transaction,
          categoryMap: INITIAL_CATEGORY_MAP
        },
        {}
      )
    );
  });

  test("is able to call onRefetchTransactions", async () => {
    const mockRefetch = jest.fn();

    render(
      <TransactionList
        transactions={[]}
        categoryMap={{}}
        onRefetchTransactions={mockRefetch}
        isRefetchingTransactions={false}
      />
    );

    // this is the recommended jest way to test the on refresh behavior
    // see https://github.com/callstack/react-native-testing-library/issues/809
    const transactionsList = screen.getByLabelText("Transaction list");
    expect(transactionsList).toBeDefined();

    const {refreshControl} = transactionsList.props;
    expect(refreshControl.props.refreshing).toBe(false);
    expect(refreshControl.props.tintColor).toBe("transparent");

    await act(async () => {
      refreshControl.props.onRefresh();
    });

    expect(mockRefetch).toBeCalledTimes(1);
    expect(mockRefetch).toBeCalledWith();
    expect(LoadingSpinner).not.toBeCalled();
  });

  test("shows loading spinner when refetching transactions", () => {
    render(
      <TransactionList
        transactions={[]}
        categoryMap={{}}
        onRefetchTransactions={jest.fn()}
        isRefetchingTransactions={true}
      />
    );

    const transactionsList = screen.getByLabelText("Transaction list");
    expect(transactionsList).toBeDefined();

    const {refreshControl} = transactionsList.props;
    expect(refreshControl).toBeUndefined();
    expect(LoadingSpinner).toBeCalledTimes(1);
    expect(LoadingSpinner).toBeCalledWith({}, {});
  });
});
