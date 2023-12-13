import {act, renderHook} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import useGetTransactions from "./useGetTransactions";

import {Category, Source, Transaction} from "../../types/transaction";
import useGetAllMappedStarlingTransactions from "../integrations/starling/useGetAllMappedStarlingTransactions";
import useGetAllMappedTruelayerTransactions from "../integrations/truelayer/useGetAllMappedTruelayerTransactions";

jest.mock("../integrations/starling/useGetAllMappedStarlingTransactions");
jest.mock("../integrations/truelayer/useGetAllMappedTruelayerTransactions");

describe("useGetTransactions", () => {
  test("returns loading when loading starling transactions", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllMappedStarlingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      isRefetching: false,
      transactions: [],
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllMappedTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      transactions: [],
      refetch: jest.fn()
    });

    const {result} = renderHook(() => useGetTransactions());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isRefetching).toBe(false);
    expect(result.current.transactions).toEqual([]);
    expect(useGetAllMappedStarlingTransactions).toBeCalledTimes(1);
    expect(useGetAllMappedStarlingTransactions).toBeCalledWith({
      dateRange: undefined
    });
    expect(useGetAllMappedTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllMappedTruelayerTransactions).toBeCalledWith({
      dateRange: undefined
    });
  });

  test("returns loading when loading truelayer transactions", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllMappedStarlingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      transactions: [],
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllMappedTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: true,
      isRefetching: false,
      transactions: [],
      refetch: jest.fn()
    });

    const {result} = renderHook(() => useGetTransactions());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.transactions).toEqual([]);
    expect(useGetAllMappedStarlingTransactions).toBeCalledTimes(1);
    expect(useGetAllMappedStarlingTransactions).toBeCalledWith({
      dateRange: undefined
    });
    expect(useGetAllMappedTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllMappedTruelayerTransactions).toBeCalledWith({
      dateRange: undefined
    });
  });

  test("merges and sorts transactions", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    const mockStarlingTransaction: Transaction = {
      id: "starling",
      name: "starling-trx-1",
      description: "starling-description",
      amount: 10,
      category: "Custom",
      timestamp: new Date("2022-12-25"),
      source: Source.STARLING
    };
    (
      useGetAllMappedStarlingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      transactions: [mockStarlingTransaction],
      refetch: jest.fn()
    });

    const mockTruelayerTransaction: Transaction = {
      id: "truelayer",
      name: "truelayer-trx-1",
      description: "truelayer-description",
      amount: 5,
      category: Category.BILLS,
      timestamp: new Date("2023-1-1"),
      source: Source.TRUELAYER
    };
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllMappedTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      transactions: [mockTruelayerTransaction],
      refetch: jest.fn()
    });

    const {result} = renderHook(() => useGetTransactions());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.transactions).toEqual([
      mockTruelayerTransaction,
      mockStarlingTransaction
    ]);
    expect(useGetAllMappedStarlingTransactions).toBeCalledTimes(1);
    expect(useGetAllMappedStarlingTransactions).toBeCalledWith({
      dateRange: undefined
    });
    expect(useGetAllMappedTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllMappedTruelayerTransactions).toBeCalledWith({
      dateRange: undefined
    });
  });

  test("returns refetching status if refetching starling trxs", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    const mockStarlingTransaction: Transaction = {
      id: "starling",
      name: "starling-trx-1",
      description: "starling-description",
      amount: 10,
      category: "Custom",
      timestamp: new Date("2022-12-25"),
      source: Source.STARLING
    };
    (
      useGetAllMappedStarlingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: true,
      transactions: [mockStarlingTransaction],
      refetch: jest.fn()
    });

    const mockTruelayerTransaction: Transaction = {
      id: "truelayer",
      name: "truelayer-trx-1",
      description: "truelayer-description",
      amount: 5,
      category: Category.BILLS,
      timestamp: new Date("2023-1-1"),
      source: Source.TRUELAYER
    };
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllMappedTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      transactions: [mockTruelayerTransaction],
      refetch: jest.fn()
    });

    const {result} = renderHook(() => useGetTransactions());

    expect(result.current.transactions).toEqual([
      mockTruelayerTransaction,
      mockStarlingTransaction
    ]);
    expect(result.current.isRefetching).toBe(true);
  });

  test("returns refetching status if refetching truelayer trxs", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    const mockStarlingTransaction: Transaction = {
      id: "starling",
      name: "starling-trx-1",
      description: "starling-description",
      amount: 10,
      category: "Custom",
      timestamp: new Date("2022-12-25"),
      source: Source.STARLING
    };
    (
      useGetAllMappedStarlingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      transactions: [mockStarlingTransaction],
      refetch: jest.fn()
    });

    const mockTruelayerTransaction: Transaction = {
      id: "truelayer",
      name: "truelayer-trx-1",
      description: "truelayer-description",
      amount: 5,
      category: Category.BILLS,
      timestamp: new Date("2023-1-1"),
      source: Source.TRUELAYER
    };
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllMappedTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: true,
      transactions: [mockTruelayerTransaction],
      refetch: jest.fn()
    });

    const {result} = renderHook(() => useGetTransactions());

    expect(result.current.transactions).toEqual([
      mockTruelayerTransaction,
      mockStarlingTransaction
    ]);
    expect(result.current.isRefetching).toBe(true);
  });

  test("refetch both starling and truelayer transactions", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    const mockStarlingRefetch = jest.fn();
    (
      useGetAllMappedStarlingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      transactions: [],
      refetch: mockStarlingRefetch
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    const mockTruelayerRefetch = jest.fn();
    (
      useGetAllMappedTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      transactions: [],
      refetch: mockTruelayerRefetch
    });

    const {result} = renderHook(() => useGetTransactions());

    act(() => result.current.refetch());

    expect(mockStarlingRefetch).toBeCalledTimes(1);
    expect(mockStarlingRefetch).toBeCalledWith();
    expect(mockTruelayerRefetch).toBeCalledTimes(1);
    expect(mockTruelayerRefetch).toBeCalledWith();
  });

  test("can pass optional props", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllMappedStarlingTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      transactions: [],
      refetch: jest.fn()
    });

    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (
      useGetAllMappedTruelayerTransactions as jest.MockedFunction<any>
    ).mockReturnValueOnce({
      isLoading: false,
      isRefetching: false,
      transactions: [],
      refetch: jest.fn()
    });

    const from = new Date("2020-01-01");
    const to = new Date("2021-01-01");
    const {result} = renderHook(() =>
      useGetTransactions({dateRange: {from, to}})
    );

    act(() => result.current.refetch());

    expect(useGetAllMappedStarlingTransactions).toBeCalledTimes(1);
    expect(useGetAllMappedStarlingTransactions).toBeCalledWith({
      dateRange: {from, to}
    });
    expect(useGetAllMappedTruelayerTransactions).toBeCalledTimes(1);
    expect(useGetAllMappedTruelayerTransactions).toBeCalledWith({
      dateRange: {from, to}
    });
  });
});
