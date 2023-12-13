import React, {ReactNode} from "react";
import {act, renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import useGetStarlingTransactions from "./useGetStarlingTransactions";

import {starlingApi} from "../../../api/axiosConfig";
import {
  STARLING_FEED_ITEM_1,
  STARLING_FEED_ITEM_2
} from "../../../mock-server/starling/data/feedData";
import ErrorContext, {defaultErrorContext} from "../../../store/error-context";
import {AppError} from "../../../types/errors";
import {StarlingFeedItem} from "../../../types/starling/feedItems";

jest.mock("../../../api/axiosConfig");

describe("useGetStarlingTransactions", () => {
  describe("with one id", () => {
    test("returns a correct list of transactions on a 200 status code", async () => {
      (
        starlingApi.get as jest.MockedFunction<
          typeof starlingApi.get<{feedItems: StarlingFeedItem[]}>
        >
      ).mockResolvedValueOnce({feedItems: [STARLING_FEED_ITEM_1]});

      const mockRemoveError = jest.fn();

      const customWrapper = (children: ReactNode) => (
        <ErrorContext.Provider
          value={{...defaultErrorContext, removeError: mockRemoveError}}>
          {children}
        </ErrorContext.Provider>
      );

      // the time element of this test could be precarious because
      // new Date() is also called in the hook in order to get the current time
      // if this test becomes flaky check how to manage this
      const now = new Date();
      const {result} = renderHook(
        () =>
          useGetStarlingTransactions({
            ids: [{accountId: "account-id", categoryId: "category-id"}]
          }),
        {
          customWrapper
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([STARLING_FEED_ITEM_1]);

      expect(mockRemoveError).toBeCalledTimes(1);
      expect(mockRemoveError).toBeCalledWith(
        "useGetStarlingTransactions-account-id-category-id"
      );

      expect(starlingApi.get).toBeCalledTimes(1);
      expect(starlingApi.get).toBeCalledWith(
        `v2/feed/account/account-id/category/category-id/transactions-between?minTransactionTimestamp=${new Date(
          "2014-01-01"
        ).toISOString()}&maxTransactionTimestamp=${now.toISOString()}`
      );
    });

    test("uses past dates for transactions query", async () => {
      (
        starlingApi.get as jest.MockedFunction<
          typeof starlingApi.get<{feedItems: StarlingFeedItem[]}>
        >
      ).mockResolvedValueOnce({feedItems: []});

      const {result} = renderHook(() =>
        useGetStarlingTransactions({
          ids: [{accountId: "account-id", categoryId: "category-id"}],
          dateRange: {
            from: new Date("01-01-2022"),
            to: new Date("01-01-2023")
          }
        })
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);

      expect(starlingApi.get).toBeCalledTimes(1);
      expect(starlingApi.get).toBeCalledWith(
        `v2/feed/account/account-id/category/category-id/transactions-between?minTransactionTimestamp=${new Date(
          "01-01-2022"
        ).toISOString()}&maxTransactionTimestamp=${new Date(
          "01-01-2023"
        ).toISOString()}`
      );
    });

    test("returns an error message", async () => {
      const mockError: AppError = {id: "idToOverride", error: "error"};
      (
        starlingApi.get as jest.MockedFunction<
          typeof starlingApi.get<{feedItems: StarlingFeedItem[]}>
        >
      ).mockRejectedValueOnce(mockError);

      const mockAddError = jest.fn();

      const customWrapper = (children: ReactNode) => (
        <ErrorContext.Provider
          value={{...defaultErrorContext, addError: mockAddError}}>
          {children}
        </ErrorContext.Provider>
      );

      const {result} = renderHook(
        () =>
          useGetStarlingTransactions({
            ids: [{accountId: "account-id", categoryId: "category-id"}]
          }),
        {
          customWrapper
        }
      );

      await waitFor(() => expect(mockAddError).toBeCalledTimes(1));
      expect(mockAddError).toBeCalledWith({
        error: "error",
        id: "useGetStarlingTransactions-account-id-category-id"
      });
      expect(result.current.data).toEqual([]);
    });
  });

  describe("with multiple ids", () => {
    test("combines data from multiple calls", async () => {
      (
        starlingApi.get as jest.MockedFunction<
          typeof starlingApi.get<{feedItems: StarlingFeedItem[]}>
        >
      )
        .mockResolvedValueOnce({feedItems: [STARLING_FEED_ITEM_1]})
        .mockResolvedValueOnce({feedItems: [STARLING_FEED_ITEM_2]});

      const mockRemoveError = jest.fn();

      const customWrapper = (children: ReactNode) => (
        <ErrorContext.Provider
          value={{...defaultErrorContext, removeError: mockRemoveError}}>
          {children}
        </ErrorContext.Provider>
      );

      const {result} = renderHook(
        () =>
          useGetStarlingTransactions({
            ids: [
              {accountId: "account-id-1", categoryId: "category-id-1"},
              {accountId: "account-id-2", categoryId: "category-id-2"}
            ]
          }),
        {
          customWrapper
        }
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.isRefetching).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual([
        STARLING_FEED_ITEM_2,
        STARLING_FEED_ITEM_1
      ]);

      expect(mockRemoveError).toBeCalledTimes(2);
      expect(mockRemoveError).toBeCalledWith(
        "useGetStarlingTransactions-account-id-1-category-id-1"
      );
      expect(mockRemoveError).toBeCalledWith(
        "useGetStarlingTransactions-account-id-2-category-id-2"
      );
    });

    test("returns loading status if 1 call is still loading", async () => {
      (
        starlingApi.get as jest.MockedFunction<
          typeof starlingApi.get<{feedItems: StarlingFeedItem[]}>
        >
      )
        .mockResolvedValueOnce({feedItems: [STARLING_FEED_ITEM_1]})
        .mockImplementationOnce(async () => new Promise(() => {}));

      const {result} = renderHook(() =>
        useGetStarlingTransactions({
          ids: [
            {accountId: "account-id-1", categoryId: "category-id-1"},
            {accountId: "account-id-2", categoryId: "category-id-2"}
          ]
        })
      );

      await waitFor(() =>
        expect(result.current.data).toEqual([STARLING_FEED_ITEM_1])
      );
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isSuccess).toBe(false);
    });

    test("returns refetching status if 1 call is still refetching", async () => {
      (
        starlingApi.get as jest.MockedFunction<
          typeof starlingApi.get<{feedItems: StarlingFeedItem[]}>
        >
      )
        .mockResolvedValueOnce({feedItems: [STARLING_FEED_ITEM_1]})
        .mockResolvedValueOnce({feedItems: []})
        .mockResolvedValueOnce({feedItems: [STARLING_FEED_ITEM_2]})
        .mockImplementationOnce(async () => new Promise(() => {}));

      const {result, rerender} = renderHook(
        props => useGetStarlingTransactions(props),
        {
          options: {
            initialProps: {
              ids: [
                {accountId: "account-id-1", categoryId: "category-id-1"},
                {accountId: "account-id-2", categoryId: "category-id-2"}
              ],
              enabled: true
            }
          }
        }
      );

      await waitFor(() =>
        expect(result.current.data).toEqual([STARLING_FEED_ITEM_1])
      );

      act(() =>
        rerender({
          ids: [
            {accountId: "account-id-1", categoryId: "category-id-1"},
            {accountId: "account-id-2", categoryId: "category-id-2"}
          ],
          enabled: false
        })
      );

      act(() =>
        rerender({
          ids: [
            {accountId: "account-id-1", categoryId: "category-id-1"},
            {accountId: "account-id-2", categoryId: "category-id-2"}
          ],
          enabled: true
        })
      );

      await waitFor(() =>
        expect(result.current.data).toEqual([STARLING_FEED_ITEM_2])
      );
      expect(result.current.isRefetching).toBe(true);
    });

    test("returns an error if 1 call fails", async () => {
      const mockError: AppError = {id: "idToOverride", error: "error"};
      (
        starlingApi.get as jest.MockedFunction<
          typeof starlingApi.get<{feedItems: StarlingFeedItem[]}>
        >
      )
        .mockResolvedValueOnce({feedItems: [STARLING_FEED_ITEM_1]})
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
        () =>
          useGetStarlingTransactions({
            ids: [
              {accountId: "account-id-1", categoryId: "category-id-1"},
              {accountId: "account-id-2", categoryId: "category-id-2"}
            ]
          }),
        {
          customWrapper
        }
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.data).toEqual([STARLING_FEED_ITEM_1]);

      expect(mockRemoveError).toBeCalledTimes(1);
      expect(mockRemoveError).toBeCalledWith(
        "useGetStarlingTransactions-account-id-1-category-id-1"
      );
      expect(mockAddError).toBeCalledTimes(1);
      expect(mockAddError).toBeCalledWith({
        error: mockError.error,
        id: "useGetStarlingTransactions-account-id-2-category-id-2"
      });
    });
  });

  test("can disable all queries", async () => {
    const {result} = renderHook(() =>
      useGetStarlingTransactions({
        ids: [
          {accountId: "account-id-1", categoryId: "category-id-1"},
          {accountId: "account-id-2", categoryId: "category-id-2"}
        ],
        enabled: false
      })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toEqual([]);
    expect(starlingApi.get).not.toBeCalled();
  });
});
