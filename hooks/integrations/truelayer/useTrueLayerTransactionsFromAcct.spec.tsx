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
