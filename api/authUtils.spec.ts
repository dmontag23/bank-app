import {AxiosHeaders} from "axios";
import {beforeEach, describe, expect, jest, test} from "@jest/globals";

import {getNewToken, handleUnauthenticatedError} from "./authUtils";

import {
  createDataAPIRequestInterceptor,
  trueLayerAuthApi
} from "../axiosConfig";
import config from "../config.json";
import {
  ConnectTokenPostRequest,
  ConnectTokenPostResponse,
  GrantType
} from "../types/trueLayer/authAPI/auth";
import {AuthAPIErrorResponse} from "../types/trueLayer/authAPI/serverResponse";
import {DataAPIErrorResponse} from "../types/trueLayer/dataAPI/serverResponse";

jest.mock("../axiosConfig");

beforeEach(() => {
  (
    trueLayerAuthApi.post as jest.MockedFunction<
      typeof trueLayerAuthApi.post<
        ConnectTokenPostRequest,
        ConnectTokenPostResponse
      >
    >
  ).mockImplementation(async () =>
    // TODO: Refactor the data below and the one in truelayerAuthRouter.ts into a single place
    ({
      access_token: "good-access-token",
      expires_in: 3600,
      refresh_token: "refresh-token",
      token_type: "Bearer",
      scope: "info"
    })
  );
});

describe("getNewToken", () => {
  test("returns a new token on a successful call to the connect/token endpoint", async () => {
    const newToken = await getNewToken();

    // assertions
    expect(newToken).toEqual("good-access-token");
    expect(trueLayerAuthApi.post).toBeCalledTimes(1);
    expect(trueLayerAuthApi.post).toBeCalledWith("connect/token", {
      grant_type: GrantType.REFRESH,
      client_id: `${config.integrations.trueLayer.clientId}`,
      client_secret: `${config.integrations.trueLayer.clientSecret}`,
      refresh_token: ""
    });
  });

  test("logs an error to the console on an unsuccessful call to the connect/token endpoint", async () => {
    // setup mocks
    const mockTrueLayerAuthApi = trueLayerAuthApi as jest.MockedObject<
      typeof trueLayerAuthApi
    >;
    // TODO: Refactor this into common error file
    const expectedErrorResponse: AuthAPIErrorResponse = {
      error_description:
        "Sorry, we are experiencing technical difficulties. Please try again later.",
      error: "internal_server_error",
      error_details: {}
    };
    mockTrueLayerAuthApi.post.mockImplementation(async () =>
      Promise.reject({response: {data: expectedErrorResponse, status: 500}})
    );
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // assertions
    await expect(getNewToken()).rejects.toEqual(expectedErrorResponse);
    expect(mockTrueLayerAuthApi.post).toBeCalledTimes(1);
    expect(mockTrueLayerAuthApi.post).toBeCalledWith("connect/token", {
      grant_type: GrantType.REFRESH,
      client_id: `${config.integrations.trueLayer.clientId}`,
      client_secret: `${config.integrations.trueLayer.clientSecret}`,
      refresh_token: ""
    });
    expect(consoleError).toBeCalledTimes(1);
    expect(consoleError).toBeCalledWith(
      "An error occurred fetching the token: ",
      expectedErrorResponse
    );
  });

  test("logs an error to the console on a network error", async () => {
    const mockTrueLayerAuthApi = trueLayerAuthApi as jest.MockedObject<
      typeof trueLayerAuthApi
    >;
    const mockErrorMessage = "Network Error";
    mockTrueLayerAuthApi.post.mockImplementation(async () =>
      Promise.reject(Error(mockErrorMessage))
    );
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(getNewToken()).rejects.toEqual(mockErrorMessage);
    expect(mockTrueLayerAuthApi.post).toBeCalledTimes(1);
    expect(mockTrueLayerAuthApi.post).toBeCalledWith("connect/token", {
      grant_type: GrantType.REFRESH,
      client_id: `${config.integrations.trueLayer.clientId}`,
      client_secret: `${config.integrations.trueLayer.clientSecret}`,
      refresh_token: ""
    });
    expect(consoleError).toBeCalledTimes(1);
    expect(consoleError).toBeCalledWith(
      "An error occurred fetching the token: ",
      mockErrorMessage
    );
  });
});

describe("handleUnauthenticatedError", () => {
  test("correctly handles case with no error description", async () => {
    const consoleWarn = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    const mockError: DataAPIErrorResponse = {
      error: "invalid_token"
    };
    const mockHeaders = new AxiosHeaders({test: "headers"});

    await handleUnauthenticatedError(mockError, mockHeaders);

    expect(consoleWarn).toBeCalledTimes(2);
    expect(consoleWarn).toBeCalledWith(
      `The following authentication error occurred: ${mockError.error}\nAttempting to fetch a new token...`
    );
    expect(consoleWarn).toBeCalledWith("Successfully got a new token.");
    expect(createDataAPIRequestInterceptor).toBeCalledTimes(1);
    expect(createDataAPIRequestInterceptor).toBeCalledWith(
      new AxiosHeaders({
        ...mockHeaders,
        Authorization: `Bearer good-access-token`
      })
    );
  });

  test("correctly handles case with an error description", async () => {
    const consoleWarn = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    const mockError: DataAPIErrorResponse = {
      error_description: "The token expired at '2020-12-07 12:34:56Z'",
      error: "invalid_token"
    };
    const mockHeaders = new AxiosHeaders({test: "headers"});

    await handleUnauthenticatedError(mockError, mockHeaders);

    expect(consoleWarn).toBeCalledTimes(2);
    expect(consoleWarn).toBeCalledWith(
      `The following authentication error occurred: ${mockError.error} for the following reason: ${mockError.error_description}\nAttempting to fetch a new token...`
    );
    expect(consoleWarn).toBeCalledWith("Successfully got a new token.");
    expect(createDataAPIRequestInterceptor).toBeCalledTimes(1);
    expect(createDataAPIRequestInterceptor).toBeCalledWith(
      new AxiosHeaders({
        ...mockHeaders,
        Authorization: `Bearer good-access-token`
      })
    );
  });

  test("returns failure message when getting a new token fails", async () => {
    const consoleWarn = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockTrueLayerAuthApi = trueLayerAuthApi as jest.MockedObject<
      typeof trueLayerAuthApi
    >;
    const authApiErrorResponse: AuthAPIErrorResponse = {
      error_description:
        "Sorry, we are experiencing technical difficulties. Please try again later.",
      error: "internal_server_error",
      error_details: {}
    };
    mockTrueLayerAuthApi.post.mockImplementation(async () =>
      Promise.reject({response: {data: authApiErrorResponse, status: 500}})
    );
    const mockError: DataAPIErrorResponse = {
      error: "invalid_token"
    };
    const mockHeaders = new AxiosHeaders({test: "headers"});

    await expect(
      handleUnauthenticatedError(mockError, mockHeaders)
    ).rejects.toEqual(authApiErrorResponse);
    expect(consoleWarn).toBeCalledTimes(1);
    expect(consoleWarn).toBeCalledWith(
      `The following authentication error occurred: ${mockError.error}\nAttempting to fetch a new token...`
    );
    expect(consoleError).toBeCalledTimes(1);
    expect(consoleError).toBeCalledWith(
      "An error occurred fetching the token: ",
      authApiErrorResponse
    );
    expect(createDataAPIRequestInterceptor).not.toBeCalled();
  });
});
