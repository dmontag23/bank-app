import React, {ReactNode} from "react";
import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import useGetTruelayerPendingTransactions from "./useGetTruelayerPendingTransactions";

import {trueLayerDataApi} from "../../../api/axiosConfig";
import ErrorContext, {defaultErrorContext} from "../../../store/error-context";
import {
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
} from "../../../tests/mocks/trueLayer/dataAPI/data/cardTransactionData";
import {AppError} from "../../../types/errors";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";

jest.mock("../../../api/axiosConfig");

describe("useGetTruelayerPendingTransactions", () => {
  describe("with only 1 id", () => {
    test("returns a correct list of card transactions with no date filtering", async () => {
      (
        trueLayerDataApi.get as jest.MockedFunction<
          typeof trueLayerDataApi.get<CardTransaction[]>
        >
      ).mockImplementation(async () => [
        TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
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
        () => useGetTruelayerPendingTransactions({cardIds: ["id_1"]}),
        {
          customWrapper
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([
        TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
        TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS
      ]);

      expect(mockRemoveError).toBeCalledTimes(1);
      expect(mockRemoveError).toBeCalledWith(
        "useGetTruelayerPendingTransactions-id_1"
      );
    });

    test("returns correctly filtered data when passing in a date range", async () => {
      (
        trueLayerDataApi.get as jest.MockedFunction<
          typeof trueLayerDataApi.get<CardTransaction[]>
        >
      ).mockImplementation(async () => [
        TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
        TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS
      ]);

      const {result} = renderHook(() =>
        useGetTruelayerPendingTransactions({
          cardIds: ["id_1"],
          dateRange: {
            from: new Date("2023-03-01"),
            to: new Date("2023-04-01")
          }
        })
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([
        TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS
      ]);
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
        () => useGetTruelayerPendingTransactions({cardIds: ["id_1"]}),
        {
          customWrapper
        }
      );

      await waitFor(() => expect(mockAddError).toBeCalledTimes(1));
      expect(mockAddError).toBeCalledWith({
        error: "error",
        id: "useGetTruelayerPendingTransactions-id_1"
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
        () => useGetTruelayerPendingTransactions({cardIds: ["id_1", "id_2"]}),
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
        "useGetTruelayerPendingTransactions-id_1"
      );
      expect(mockRemoveError).toBeCalledWith(
        "useGetTruelayerPendingTransactions-id_2"
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
        useGetTruelayerPendingTransactions({cardIds: ["id_1", "id_2"]})
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
        () => useGetTruelayerPendingTransactions({cardIds: ["id_1", "id_2"]}),
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
        "useGetTruelayerPendingTransactions-id_1"
      );
      expect(mockAddError).toBeCalledTimes(1);
      expect(mockAddError).toBeCalledWith({
        error: mockError.error,
        id: "useGetTruelayerPendingTransactions-id_2"
      });
    });

    test("can disable all queries", async () => {
      const {result} = renderHook(() =>
        useGetTruelayerPendingTransactions({
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
});
