import React, {ReactNode} from "react";
import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import usePostTruelayerToken from "./usePostTruelayerToken";

import {trueLayerAuthApi} from "../../../api/axiosConfig";
import Config from "../../../config.json";
import ErrorContext, {defaultErrorContext} from "../../../store/error-context";
import {
  ConnectTokenPostRequest,
  ConnectTokenPostResponse,
  GrantType
} from "../../../types/trueLayer/authAPI/auth";
import {AuthAPIErrorResponse} from "../../../types/trueLayer/authAPI/serverResponse";

jest.mock("../../../api/axiosConfig");

describe("usePostTruelayerToken", () => {
  test("returns correct data on a successful request", async () => {
    const mockResponseData: ConnectTokenPostResponse = {
      access_token: "",
      expires_in: 0,
      refresh_token: "",
      token_type: "",
      scope: "accounts"
    };
    (
      trueLayerAuthApi.post as jest.MockedFunction<
        typeof trueLayerAuthApi.post<
          ConnectTokenPostRequest,
          ConnectTokenPostResponse
        >
      >
    ).mockImplementation(async () => mockResponseData);

    // setup error context mocks
    const mockRemoveError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, removeError: mockRemoveError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => usePostTruelayerToken(), {customWrapper});
    result.current.mutate("dummy-code");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResponseData);
    expect(trueLayerAuthApi.post).toBeCalledTimes(1);
    expect(trueLayerAuthApi.post).toBeCalledWith("connect/token", {
      grant_type: GrantType.AUTHORIZATION_CODE,
      client_id: Config.TRUELAYER_CLIENT_ID,
      client_secret: Config.TRUELAYER_CLIENT_SECRET,
      redirect_uri: `${Config.URI}${Config.TRUELAYER_CALLBACK_ENDPOINT}`,
      code: "dummy-code"
    });
    expect(result.current.error).toBeNull();

    expect(mockRemoveError).toBeCalledTimes(1);
    expect(mockRemoveError).toBeCalledWith("usePostTruelayerToken");
  });

  test("returns an error message on a 400 status code response", async () => {
    const error: AuthAPIErrorResponse = {
      error: "invalid_grant"
    };
    (
      trueLayerAuthApi.post as jest.MockedFunction<
        typeof trueLayerAuthApi.post<
          ConnectTokenPostRequest,
          ConnectTokenPostResponse
        >
      >
    ).mockImplementation(async () => Promise.reject(error));

    // setup error context mocks
    const mockAddError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, addError: mockAddError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => usePostTruelayerToken(), {customWrapper});
    result.current.mutate("error-code");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(trueLayerAuthApi.post).toBeCalledTimes(1);
    expect(trueLayerAuthApi.post).toBeCalledWith("connect/token", {
      grant_type: GrantType.AUTHORIZATION_CODE,
      client_id: Config.TRUELAYER_CLIENT_ID,
      client_secret: Config.TRUELAYER_CLIENT_SECRET,
      redirect_uri: `${Config.URI}${Config.TRUELAYER_CALLBACK_ENDPOINT}`,
      code: "error-code"
    });
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(error);

    expect(mockAddError).toBeCalledTimes(1);
    expect(mockAddError).toBeCalledWith({
      id: "usePostTruelayerToken",
      error: "invalid_grant"
    });
  });
});
