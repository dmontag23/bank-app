import React, {ReactNode} from "react";
import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import useTrueLayerTransactionsFromAcct from "./useTrueLayerTransactionsFromAcct";

import {trueLayerDataApi} from "../../../api/axiosConfig";
import ErrorContext, {defaultErrorContext} from "../../../store/error-context";
import {
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
} from "../../../tests/mocks/trueLayer/dataAPI/data/cardData";
import {AppError} from "../../../types/errors";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";

jest.mock("../../../api/axiosConfig");

describe("useTrueLayerTransactions", () => {
  test("returns a correct list of card transactions on a 200 status code", async () => {
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    ).mockImplementation(async () => [
      TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
    ]);

    const mockRemoveError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, removeError: mockRemoveError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(
      () => useTrueLayerTransactionsFromAcct("dummy"),
      {customWrapper}
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
    ]);
    expect(result.current.error).toBeNull();

    expect(mockRemoveError).toBeCalledTimes(1);
    expect(mockRemoveError).toBeCalledWith("useTrueLayerTransactionsFromAcct");
  });

  test("uses past dates for transactions query", async () => {
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    ).mockImplementation(async () => []);

    const {result} = renderHook(() =>
      useTrueLayerTransactionsFromAcct("dummy", {
        from: new Date("01-01-2022"),
        to: new Date("01-01-2023")
      })
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();

    expect(trueLayerDataApi.get).toBeCalledTimes(1);
    expect(trueLayerDataApi.get).toBeCalledWith(
      `v1/cards/dummy/transactions?from=${new Date(
        "01-01-2022"
      ).toISOString()}&to=${new Date("01-01-2023").toISOString()}`
    );
  });

  test("uses future dates for transactions query", async () => {
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    ).mockImplementation(async () => []);

    // the time element of this test could be precarious because
    // new Date() is also called in the hook in order to get the current time
    // if this test becomes flaky check how to manage this
    const now = new Date();
    const future = new Date(now.toISOString());
    future.setDate(future.getDate() + 1);

    const {result} = renderHook(() =>
      useTrueLayerTransactionsFromAcct("dummy", {from: now, to: future})
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();

    expect(trueLayerDataApi.get).toBeCalledTimes(1);
    expect(trueLayerDataApi.get).toBeCalledWith(
      `v1/cards/dummy/transactions?from=${now.toISOString()}&to=${now.toISOString()}`
    );
  });

  test("returns an error message", async () => {
    const mockError: AppError = {id: "idToOverride", error: "error"};
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    ).mockImplementation(async () => Promise.reject(mockError));

    const mockAddError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, addError: mockAddError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(
      () => useTrueLayerTransactionsFromAcct("dummy"),
      {customWrapper}
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(mockError);

    expect(mockAddError).toBeCalledTimes(1);
    expect(mockAddError).toBeCalledWith({
      error: "error",
      id: "useTrueLayerTransactionsFromAcct"
    });
  });
});
