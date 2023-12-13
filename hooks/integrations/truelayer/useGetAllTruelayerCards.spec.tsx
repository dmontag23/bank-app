import React, {ReactNode} from "react";
import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import useGetAllTruelayerCards from "./useGetAllTruelayerCards";

import {trueLayerDataApi} from "../../../api/axiosConfig";
import {
  TRUELAYER_MASTERCARD,
  TRUELAYER_VISA
} from "../../../mock-server/truelayer/data/cardData";
import ErrorContext, {defaultErrorContext} from "../../../store/error-context";
import {AppError} from "../../../types/errors";
import {Card} from "../../../types/trueLayer/dataAPI/cards";

jest.mock("../../../api/axiosConfig");

describe("useGetAllTruelayerCards", () => {
  test("returns a correct list of cards", async () => {
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<Card[]>
      >
    ).mockResolvedValueOnce([TRUELAYER_MASTERCARD, TRUELAYER_VISA]);

    const mockRemoveError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, removeError: mockRemoveError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useGetAllTruelayerCards(), {
      customWrapper
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([TRUELAYER_MASTERCARD, TRUELAYER_VISA]);
    expect(result.current.error).toBeNull();

    expect(mockRemoveError).toBeCalledTimes(1);
    expect(mockRemoveError).toBeCalledWith("useGetAllTruelayerCards");
  });

  test("returns an error message", async () => {
    const mockError: AppError = {id: "idToOverride", error: "error"};
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<Card[]>
      >
    ).mockRejectedValueOnce(mockError);

    const mockAddError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, addError: mockAddError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useGetAllTruelayerCards(), {
      customWrapper
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(mockError);

    expect(mockAddError).toBeCalledTimes(1);
    expect(mockAddError).toBeCalledWith({
      error: "error",
      id: "useGetAllTruelayerCards"
    });
  });
});
