import {renderHook} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import useGetAllTruelayerTransactions from "./useGetAllTruelayerTransactions";
import useGetTruelayerPendingTransactions from "./useGetTruelayerPendingTransactions";
import useGetTruelayerSettledTransactions from "./useGetTruelayerSettledTransactions";

import {
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_ENTERTAINMENT_TRANSACTION_MARCH_MINIMUM_FIELDS
} from "../../../tests/mocks/trueLayer/dataAPI/data/cardTransactionData";

jest.mock("./useGetTruelayerPendingTransactions");
jest.mock("./useGetTruelayerSettledTransactions");

describe("useGetAllTruelayerTransactions", () => {
  test("returns a loading status if loading settled truelayer transactions", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerSettledTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      isSuccess: false,
      data: undefined
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerPendingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: false,
      data: undefined
    });

    // run hook
    const {result} = renderHook(() =>
      useGetAllTruelayerTransactions({cardIds: ["dummy_id_list"]})
    );

    // assertions
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toEqual([]);
  });

  test("returns a loading status if loading pending truelayer transactions", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerSettledTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: false,
      data: undefined
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerPendingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      isSuccess: false,
      data: undefined
    });

    // run hook
    const {result} = renderHook(() =>
      useGetAllTruelayerTransactions({cardIds: ["dummy_id_list"]})
    );

    // assertions
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toEqual([]);
  });

  test("does not return data until both hooks have finished processing", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerSettledTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: true,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerPendingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      isSuccess: false,
      data: undefined
    });

    // run hook
    const {result} = renderHook(() =>
      useGetAllTruelayerTransactions({cardIds: ["dummy_id_list"]})
    );

    // assertions
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toEqual([]);
  });

  test("returns combined data from hooks upon successful fetches", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerSettledTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: true,
      data: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS]
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerPendingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: true,
      data: [TRUELAYER_ENTERTAINMENT_TRANSACTION_MARCH_MINIMUM_FIELDS]
    });

    // run hook
    const {result} = renderHook(() =>
      useGetAllTruelayerTransactions({cardIds: ["dummy_id_list"]})
    );

    // assertions
    expect(useGetTruelayerSettledTransactions).toBeCalledTimes(1);
    expect(useGetTruelayerSettledTransactions).toBeCalledWith({
      cardIds: ["dummy_id_list"]
    });
    expect(useGetTruelayerPendingTransactions).toBeCalledTimes(1);
    expect(useGetTruelayerPendingTransactions).toBeCalledWith({
      cardIds: ["dummy_id_list"]
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual([
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
      TRUELAYER_ENTERTAINMENT_TRANSACTION_MARCH_MINIMUM_FIELDS
    ]);
  });

  test("passes date range to hooks", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerSettledTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: false,
      data: undefined
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerPendingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: false,
      data: undefined
    });

    // run hook
    const dateRange = {
      from: new Date("01-01-2023"),
      to: new Date("01-02-2023")
    };
    renderHook(() =>
      useGetAllTruelayerTransactions({cardIds: ["dummy_id_list"], dateRange})
    );

    // assertions
    expect(useGetTruelayerSettledTransactions).toBeCalledTimes(1);
    expect(useGetTruelayerSettledTransactions).toBeCalledWith({
      cardIds: ["dummy_id_list"],
      dateRange
    });
    expect(useGetTruelayerPendingTransactions).toBeCalledTimes(1);
    expect(useGetTruelayerPendingTransactions).toBeCalledWith({
      cardIds: ["dummy_id_list"],
      dateRange
    });
  });

  test("passes enabled to hooks", async () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerSettledTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: false,
      data: undefined
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetTruelayerPendingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isSuccess: false,
      data: undefined
    });

    // run hook
    renderHook(() =>
      useGetAllTruelayerTransactions({
        cardIds: ["dummy_id_list"],
        enabled: false
      })
    );

    // assertions
    expect(useGetTruelayerSettledTransactions).toBeCalledTimes(1);
    expect(useGetTruelayerSettledTransactions).toBeCalledWith({
      cardIds: ["dummy_id_list"],
      enabled: false
    });
    expect(useGetTruelayerPendingTransactions).toBeCalledTimes(1);
    expect(useGetTruelayerPendingTransactions).toBeCalledWith({
      cardIds: ["dummy_id_list"],
      enabled: false
    });
  });
});
