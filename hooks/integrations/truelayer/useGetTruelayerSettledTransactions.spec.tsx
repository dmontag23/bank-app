import React, {ReactNode} from "react";
import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import useGetTruelayerSettledTransactions from "./useGetTruelayerSettledTransactions";

import {trueLayerDataApi} from "../../../api/axiosConfig";
import {
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
} from "../../../mock-server/truelayer/data/cardTransactionData";
import ErrorContext, {defaultErrorContext} from "../../../store/error-context";
import {AppError} from "../../../types/errors";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";

jest.mock("../../../api/axiosConfig");

describe("useGetTruelayerTransactions", () => {
  describe("with only 1 id", () => {
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
        () => useGetTruelayerSettledTransactions({cardIds: ["id_1"]}),
        {
          customWrapper
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([
        TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
        TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
      ]);

      expect(mockRemoveError).toBeCalledTimes(1);
      expect(mockRemoveError).toBeCalledWith(
        "useGetTruelayerTransactions-id_1"
      );
    });

    test("uses past dates for transactions query", async () => {
      (
        trueLayerDataApi.get as jest.MockedFunction<
          typeof trueLayerDataApi.get<CardTransaction[]>
        >
      ).mockImplementation(async () => []);

      const {result} = renderHook(() =>
        useGetTruelayerSettledTransactions({
          cardIds: ["id_1"],
          dateRange: {
            from: new Date("01-01-2022"),
            to: new Date("01-01-2023")
          }
        })
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);

      expect(trueLayerDataApi.get).toBeCalledTimes(1);
      expect(trueLayerDataApi.get).toBeCalledWith(
        `v1/cards/id_1/transactions?from=${new Date(
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
        useGetTruelayerSettledTransactions({
          cardIds: ["id_1"],
          dateRange: {from: now, to: future}
        })
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);

      expect(trueLayerDataApi.get).toBeCalledTimes(1);
      expect(trueLayerDataApi.get).toBeCalledWith(
        `v1/cards/id_1/transactions?from=${now.toISOString()}&to=${now.toISOString()}`
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
        () => useGetTruelayerSettledTransactions({cardIds: ["id_1"]}),
        {
          customWrapper
        }
      );

      await waitFor(() => expect(mockAddError).toBeCalledTimes(1));
      expect(mockAddError).toBeCalledWith({
        error: "error",
        id: "useGetTruelayerTransactions-id_1"
      });
      expect(result.current.data).toEqual([]);
    });
  });

  describe("with multiple ids", () => {
    test("combines data from multiple calls", async () => {
      (
        trueLayerDataApi.get as jest.MockedFunction<
          typeof trueLayerDataApi.get<CardTransaction[]>
        >
      )
        .mockResolvedValueOnce([
          TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
          TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
        ])
        .mockResolvedValueOnce([
          TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS
        ]);

      const mockRemoveError = jest.fn();

      const customWrapper = (children: ReactNode) => (
        <ErrorContext.Provider
          value={{...defaultErrorContext, removeError: mockRemoveError}}>
          {children}
        </ErrorContext.Provider>
      );

      const {result} = renderHook(
        () => useGetTruelayerSettledTransactions({cardIds: ["id_1", "id_2"]}),
        {
          customWrapper
        }
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual([
        TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS,
        TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
        TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
      ]);

      expect(mockRemoveError).toBeCalledTimes(2);
      expect(mockRemoveError).toBeCalledWith(
        "useGetTruelayerTransactions-id_1"
      );
      expect(mockRemoveError).toBeCalledWith(
        "useGetTruelayerTransactions-id_2"
      );
    });

    test("returns loading status if 1 call is still loading", async () => {
      (
        trueLayerDataApi.get as jest.MockedFunction<
          typeof trueLayerDataApi.get<CardTransaction[]>
        >
      )
        .mockResolvedValueOnce([
          TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
          TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
        ])
        .mockImplementationOnce(async () => new Promise(() => {}));

      const {result} = renderHook(() =>
        useGetTruelayerSettledTransactions({cardIds: ["id_1", "id_2"]})
      );

      await waitFor(() =>
        expect(result.current.data).toEqual([
          TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
          TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
        ])
      );
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isSuccess).toBe(false);
    });

    test("returns an error if 1 call fails", async () => {
      const mockError: AppError = {id: "idToOverride", error: "error"};
      (
        trueLayerDataApi.get as jest.MockedFunction<
          typeof trueLayerDataApi.get<CardTransaction[]>
        >
      )
        .mockResolvedValueOnce([
          TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
          TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
        ])
        .mockRejectedValueOnce(mockError);

      const mockAddError = jest.fn();
      const mockRemoveError = jest.fn();

      const customWrapper = (children: ReactNode) => (
        <ErrorContext.Provider
          value={{
            ...defaultErrorContext,
            addError: mockAddError,
            removeError: mockRemoveError
          }}>
          {children}
        </ErrorContext.Provider>
      );

      const {result} = renderHook(
        () => useGetTruelayerSettledTransactions({cardIds: ["id_1", "id_2"]}),
        {
          customWrapper
        }
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.data).toEqual([
        TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
        TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
      ]);

      expect(mockRemoveError).toBeCalledTimes(1);
      expect(mockRemoveError).toBeCalledWith(
        "useGetTruelayerTransactions-id_1"
      );
      expect(mockAddError).toBeCalledTimes(1);
      expect(mockAddError).toBeCalledWith({
        error: mockError.error,
        id: "useGetTruelayerTransactions-id_2"
      });
    });
  });

  test("can disable all queries", async () => {
    const {result} = renderHook(() =>
      useGetTruelayerSettledTransactions({
        cardIds: ["id_1", "id_2"],
        enabled: false
      })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toEqual([]);
    expect(trueLayerDataApi.get).not.toBeCalled();
  });
});
