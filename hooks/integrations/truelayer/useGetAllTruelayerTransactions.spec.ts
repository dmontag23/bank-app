import {renderHook} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import useGetAllTruelayerTransactions from "./useGetAllTruelayerTransactions";
import useGetTruelayerPendingTransactions from "./useGetTruelayerPendingTransactions";
import useGetTruelayerTransactions from "./useGetTruelayerTransactions";

import {TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS} from "../../../tests/mocks/server/dist/tests/mocks/trueLayer/dataAPI/data/cardData";
import {TRUELAYER_ENTERTAINMENT_TRANSACTION_MARCH_MINIMUM_FIELDS} from "../../../tests/mocks/trueLayer/dataAPI/data/cardTransactionData";

jest.mock("./useGetTruelayerPendingTransactions");
jest.mock("./useGetTruelayerTransactions");

describe("useGetAllTruelayerTransactions", () => {
  test("returns a loading status if loading settled truelayer transactions", async () => {
    // setup mocks
    const mockSettledTransactionsRefetch = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      isSuccess: false,
      data: undefined,
      refetch: mockSettledTransactionsRefetch
    });

    const mockPendingTransactionsRefetch = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerPendingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: false,
      data: undefined,
      refetch: mockPendingTransactionsRefetch
    });

    // run hook
    const {result} = renderHook(() => useGetAllTruelayerTransactions("dummy"));

    // assertions
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toEqual([]);
    result.current.refetch();
    expect(mockSettledTransactionsRefetch).toBeCalledTimes(1);
    expect(mockSettledTransactionsRefetch).toBeCalledWith();
    expect(mockPendingTransactionsRefetch).toBeCalledTimes(1);
    expect(mockPendingTransactionsRefetch).toBeCalledWith();
  });

  test("returns a loading status if loading pending truelayer transactions", async () => {
    // setup mocks
    const mockSettledTransactionsRefetch = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: false,
      data: undefined,
      refetch: mockSettledTransactionsRefetch
    });

    const mockPendingTransactionsRefetch = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerPendingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      isSuccess: false,
      data: undefined,
      refetch: mockPendingTransactionsRefetch
    });

    // run hook
    const {result} = renderHook(() => useGetAllTruelayerTransactions("dummy"));

    // assertions
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toEqual([]);
    result.current.refetch();
    expect(mockSettledTransactionsRefetch).toBeCalledTimes(1);
    expect(mockSettledTransactionsRefetch).toBeCalledWith();
    expect(mockPendingTransactionsRefetch).toBeCalledTimes(1);
    expect(mockPendingTransactionsRefetch).toBeCalledWith();
  });

  test("does not return data until both hooks have finished processing", async () => {
    // setup mocks
    const mockSettledTransactionsRefetch = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: true,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS],
      refetch: mockSettledTransactionsRefetch
    });

    const mockPendingTransactionsRefetch = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerPendingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      isSuccess: false,
      data: undefined,
      refetch: mockPendingTransactionsRefetch
    });

    // run hook
    const {result} = renderHook(() => useGetAllTruelayerTransactions("dummy"));

    // assertions
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toEqual([]);
    result.current.refetch();
    expect(mockSettledTransactionsRefetch).toBeCalledTimes(1);
    expect(mockSettledTransactionsRefetch).toBeCalledWith();
    expect(mockPendingTransactionsRefetch).toBeCalledTimes(1);
    expect(mockPendingTransactionsRefetch).toBeCalledWith();
  });

  test("returns combined data from hooks upon successful fetches", async () => {
    // setup mocks
    const mockSettledTransactionsRefetch = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: true,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS],
      refetch: mockSettledTransactionsRefetch
    });

    const mockPendingTransactionsRefetch = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerPendingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: true,
      data: [TRUELAYER_ENTERTAINMENT_TRANSACTION_MARCH_MINIMUM_FIELDS],
      refetch: mockPendingTransactionsRefetch
    });

    // run hook
    const {result} = renderHook(() => useGetAllTruelayerTransactions("dummy"));

    // assertions
    expect(useGetTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetTruelayerTransactions).toBeCalledWith("dummy", undefined);
    expect(useGetTruelayerPendingTransactions).toBeCalledTimes(1);
    expect(useGetTruelayerPendingTransactions).toBeCalledWith(
      "dummy",
      undefined
    );
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual([
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
      TRUELAYER_ENTERTAINMENT_TRANSACTION_MARCH_MINIMUM_FIELDS
    ]);
    result.current.refetch();
    expect(mockSettledTransactionsRefetch).toBeCalledTimes(1);
    expect(mockSettledTransactionsRefetch).toBeCalledWith();
    expect(mockPendingTransactionsRefetch).toBeCalledTimes(1);
    expect(mockPendingTransactionsRefetch).toBeCalledWith();
  });

  test("passes date range to hooks", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: false,
      data: undefined,
      refetch: () => {}
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerPendingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: false,
      data: undefined,
      refetch: () => {}
    });

    // run hook
    const dateRange = {
      from: new Date("01-01-2023"),
      to: new Date("01-02-2023")
    };
    renderHook(() => useGetAllTruelayerTransactions("dummy", dateRange));

    // assertions
    expect(useGetTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetTruelayerTransactions).toBeCalledWith("dummy", dateRange);
    expect(useGetTruelayerPendingTransactions).toBeCalledTimes(1);
    expect(useGetTruelayerPendingTransactions).toBeCalledWith(
      "dummy",
      dateRange
    );
  });
});
