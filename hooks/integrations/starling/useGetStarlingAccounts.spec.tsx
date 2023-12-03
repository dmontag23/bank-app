import React, {ReactNode} from "react";
import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import useGetStarlingAccounts from "./useGetStarlingAccounts";

import {starlingApi, trueLayerDataApi} from "../../../api/axiosConfig";
import {STARLING_ACCOUNT_1} from "../../../mock-server/starling/data/accountData";
import ErrorContext, {defaultErrorContext} from "../../../store/error-context";
import {AppError} from "../../../types/errors";
import {StarlingAccount} from "../../../types/starling/accounts";

jest.mock("../../../api/axiosConfig");

describe("useGetStarlingAccounts", () => {
  test("returns a correct list of accounts", async () => {
    (
      starlingApi.get as jest.MockedFunction<
        typeof starlingApi.get<{accounts: StarlingAccount[]}>
      >
    ).mockResolvedValueOnce({accounts: [STARLING_ACCOUNT_1]});

    const mockRemoveError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, removeError: mockRemoveError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useGetStarlingAccounts(), {
      customWrapper
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([STARLING_ACCOUNT_1]);
    expect(result.current.error).toBeNull();

    expect(mockRemoveError).toBeCalledTimes(1);
    expect(mockRemoveError).toBeCalledWith("useGetStarlingAccounts");
  });

  test("returns an error message", async () => {
    const mockError: AppError = {id: "idToOverride", error: "error"};
    (
      starlingApi.get as jest.MockedFunction<
        typeof starlingApi.get<{accounts: []}>
      >
    ).mockRejectedValueOnce(mockError);

    const mockAddError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, addError: mockAddError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useGetStarlingAccounts(), {
      customWrapper
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(mockError);

    expect(mockAddError).toBeCalledTimes(1);
    expect(mockAddError).toBeCalledWith({
      error: "error",
      id: "useGetStarlingAccounts"
    });
  });

  test("can disable the query", async () => {
    const {result} = renderHook(() => useGetStarlingAccounts({enabled: false}));

    await waitFor(() => expect(result.current.isSuccess).toBe(false));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
    expect(trueLayerDataApi.get).not.toBeCalled();
  });
});
