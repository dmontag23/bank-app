import {AxiosError, AxiosHeaders, AxiosResponse} from "axios";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

// needed in order to mock functions from the same module
import * as truelayerAPIUtils from "./truelayerAPIUtils";
import {
  getNewToken,
  getTokenFromStorage,
  handleTruelayerError,
  storeNewTokens
} from "./truelayerAPIUtils";

import config from "../../config.json";
import {IntegrationErrorResponse} from "../../types/errors";
import {
  ConnectTokenPostRequest,
  ConnectTokenPostResponse,
  GrantType
} from "../../types/trueLayer/authAPI/auth";
import {AuthAPIErrorResponse} from "../../types/trueLayer/authAPI/serverResponse";
import {DataAPIErrorResponse} from "../../types/trueLayer/dataAPI/serverResponse";
import {trueLayerAuthApi} from "../axiosConfig";

jest.mock("../axiosConfig");

describe("Truelayer API Utils", () => {
  describe("handleTruelayerError", () => {
    test("handles regular Javascript error", async () => {
      const consoleError = jest.spyOn(console, "error");
      const errorHandlingFn = await handleTruelayerError("Test API Name");

      const mockError = new Error("This is a test error message");

      const expectedAppError: IntegrationErrorResponse = {
        error: "Error",
        errorMessage: "This is a test error message",
        service: "Truelayer Test API Name"
      };

      await expect(errorHandlingFn(mockError)).rejects.toEqual(
        expectedAppError
      );

      expect(consoleError).toBeCalledTimes(1);
      expect(consoleError).toBeCalledWith(
        "A Truelayer Test API Name error has occurred: ",
        mockError
      );
    });

    test("handles axios error without a response, status, or url", async () => {
      const consoleError = jest.spyOn(console, "error");
      const errorHandlingFn = await handleTruelayerError("Test API Name");

      const mockError = new AxiosError("This is an axios error");

      const expectedAppError: IntegrationErrorResponse = {
        error: "AxiosError",
        errorMessage: "This is an axios error",
        service: "Truelayer Test API Name"
      };

      await expect(errorHandlingFn(mockError)).rejects.toEqual(
        expectedAppError
      );

      expect(consoleError).toBeCalledTimes(1);
      expect(consoleError).toBeCalledWith(
        "A Truelayer Test API Name error has occurred: ",
        JSON.stringify(mockError)
      );
    });

    test("handles axios error without a response but with status and url", async () => {
      const consoleError = jest.spyOn(console, "error");
      const errorHandlingFn = await handleTruelayerError("Test API Name");

      const mockError: AxiosError = {
        name: "AxiosError",
        message: "This is an axios error",
        status: 404,
        config: {
          headers: new AxiosHeaders(),
          url: "Test url"
        },
        isAxiosError: true,
        toJSON: () => ({})
      };

      const expectedAppError: IntegrationErrorResponse = {
        error: "AxiosError",
        errorMessage: "This is an axios error",
        service: "Truelayer Test API Name",
        status: 404,
        url: "Test url"
      };

      await expect(errorHandlingFn(mockError)).rejects.toEqual(
        expectedAppError
      );

      expect(consoleError).toBeCalledTimes(1);
      expect(consoleError).toBeCalledWith(
        "A Truelayer Test API Name error has occurred: ",
        JSON.stringify(mockError)
      );
    });

    test("handles Truelayer Auth API error response with no error description, details, or urls", async () => {
      const consoleError = jest.spyOn(console, "error");
      const getNewTokenMock = jest
        .spyOn(truelayerAPIUtils, "getNewToken")
        .mockImplementationOnce(async () => undefined);
      const errorHandlingFn = await handleTruelayerError("Auth API");

      const mockAuthAPIErrorResponse: AuthAPIErrorResponse = {
        error: "access_denied"
      };

      const response: AxiosResponse = {
        data: mockAuthAPIErrorResponse,
        status: 401,
        statusText: "Access denied",
        headers: new AxiosHeaders(),
        config: {headers: new AxiosHeaders()}
      };

      const mockError = new AxiosError(
        "Test error message",
        undefined,
        {headers: new AxiosHeaders()},
        undefined,
        response
      );

      const expectedAppError: IntegrationErrorResponse = {
        error: "access_denied",
        errorMessage: "Test error message",
        service: "Truelayer Auth API",
        status: 401
      };

      await expect(errorHandlingFn(mockError)).rejects.toEqual(
        expectedAppError
      );

      expect(consoleError).toBeCalledTimes(1);
      expect(consoleError).toBeCalledWith(
        "A Truelayer Auth API error has occurred: ",
        JSON.stringify(mockError)
      );
      expect(getNewTokenMock).not.toBeCalled();

      getNewTokenMock.mockRestore();
    });

    test("handles Truelayer Data API error response with error description and config url", async () => {
      const consoleError = jest.spyOn(console, "error");
      const getNewTokenMock = jest
        .spyOn(truelayerAPIUtils, "getNewToken")
        .mockImplementationOnce(async () => undefined);
      const errorHandlingFn = await handleTruelayerError("Data API");

      const mockAuthAPIErrorResponse: DataAPIErrorResponse = {
        error: "not_found",
        error_description: "Cannot find the page"
      };

      const response: AxiosResponse = {
        data: mockAuthAPIErrorResponse,
        status: 404,
        statusText: "Not found",
        headers: new AxiosHeaders(),
        config: {headers: new AxiosHeaders()}
      };

      const mockError = new AxiosError(
        "Test error message",
        undefined,
        {
          headers: new AxiosHeaders(),
          url: "Config url"
        },
        undefined,
        response
      );

      const expectedAppError: IntegrationErrorResponse = {
        error: "not_found",
        errorMessage: "Cannot find the page",
        service: "Truelayer Data API",
        status: 404,
        url: "Config url"
      };

      await expect(errorHandlingFn(mockError)).rejects.toEqual(
        expectedAppError
      );

      expect(consoleError).toBeCalledTimes(1);
      expect(consoleError).toBeCalledWith(
        "A Truelayer Data API error has occurred: ",
        JSON.stringify(mockError)
      );
      expect(getNewTokenMock).not.toBeCalled();

      getNewTokenMock.mockRestore();
    });

    test("handles Truelayer Data API error response with error details and response url", async () => {
      const consoleError = jest.spyOn(console, "error");
      const getNewTokenMock = jest
        .spyOn(truelayerAPIUtils, "getNewToken")
        .mockImplementationOnce(async () => undefined);
      const errorHandlingFn = await handleTruelayerError("Data API");

      const mockAuthAPIErrorResponse: DataAPIErrorResponse = {
        error: "not_found",
        error_details: {reason: "Not sure why"}
      };

      const response: AxiosResponse = {
        data: mockAuthAPIErrorResponse,
        status: 404,
        statusText: "Not found",
        headers: new AxiosHeaders(),
        config: {headers: new AxiosHeaders(), url: "Response url"}
      };

      const mockError = new AxiosError(
        "Test error message",
        undefined,
        {
          headers: new AxiosHeaders(),
          url: "Config url"
        },
        undefined,
        response
      );

      const expectedAppError: IntegrationErrorResponse = {
        error: "not_found",
        errorMessage: '{"reason":"Not sure why"}',
        service: "Truelayer Data API",
        status: 404,
        url: "Response url"
      };

      await expect(errorHandlingFn(mockError)).rejects.toEqual(
        expectedAppError
      );

      expect(consoleError).toBeCalledTimes(1);
      expect(consoleError).toBeCalledWith(
        "A Truelayer Data API error has occurred: ",
        JSON.stringify(mockError)
      );
      expect(getNewTokenMock).not.toBeCalled();

      getNewTokenMock.mockRestore();
    });

    test("handles Truelayer Data API error response with type, no details and no urls", async () => {
      const consoleError = jest.spyOn(console, "error");
      const getNewTokenMock = jest
        .spyOn(truelayerAPIUtils, "getNewToken")
        .mockImplementationOnce(async () => undefined);
      const errorHandlingFn = await handleTruelayerError("Data API");

      const mockAuthAPIErrorResponse: DataAPIErrorResponse = {
        type: "There's likely a url here",
        title: "Error title",
        status: 404,
        trace_id: "Trace id"
      };

      const response: AxiosResponse = {
        data: mockAuthAPIErrorResponse,
        status: 404,
        statusText: "Not found",
        headers: new AxiosHeaders(),
        config: {headers: new AxiosHeaders()}
      };

      const mockError = new AxiosError(
        "Test error message",
        undefined,
        {
          headers: new AxiosHeaders()
        },
        undefined,
        response
      );

      const expectedAppError: IntegrationErrorResponse = {
        error: "Error title",
        errorMessage: "see There's likely a url here",
        service: "Truelayer Data API",
        status: 404
      };

      await expect(errorHandlingFn(mockError)).rejects.toEqual(
        expectedAppError
      );

      expect(consoleError).toBeCalledTimes(1);
      expect(consoleError).toBeCalledWith(
        "A Truelayer Data API error has occurred: ",
        JSON.stringify(mockError)
      );
      expect(getNewTokenMock).not.toBeCalled();

      getNewTokenMock.mockRestore();
    });

    test("handles Truelayer Data API error response with type, details, and config url", async () => {
      const consoleError = jest.spyOn(console, "error");
      const getNewTokenMock = jest
        .spyOn(truelayerAPIUtils, "getNewToken")
        .mockImplementationOnce(async () => undefined);
      const errorHandlingFn = await handleTruelayerError("Data API");

      const mockAuthAPIErrorResponse: DataAPIErrorResponse = {
        type: "There's likely a url here",
        title: "Error title",
        status: 404,
        trace_id: "Trace id",
        detail: "You had an oopsie"
      };

      const response: AxiosResponse = {
        data: mockAuthAPIErrorResponse,
        status: 404,
        statusText: "Not found",
        headers: new AxiosHeaders(),
        config: {headers: new AxiosHeaders()}
      };

      const mockError = new AxiosError(
        "Test error message",
        undefined,
        {
          headers: new AxiosHeaders(),
          url: "Config url"
        },
        undefined,
        response
      );

      const expectedAppError: IntegrationErrorResponse = {
        error: "Error title",
        errorMessage: "You had an oopsie see There's likely a url here",
        service: "Truelayer Data API",
        status: 404,
        url: "Config url"
      };

      await expect(errorHandlingFn(mockError)).rejects.toEqual(
        expectedAppError
      );

      expect(consoleError).toBeCalledTimes(1);
      expect(consoleError).toBeCalledWith(
        "A Truelayer Data API error has occurred: ",
        JSON.stringify(mockError)
      );
      expect(getNewTokenMock).not.toBeCalled();

      getNewTokenMock.mockRestore();
    });

    test("handles Truelayer Data API error response with type, details, and response url", async () => {
      const consoleError = jest.spyOn(console, "error");
      const getNewTokenMock = jest
        .spyOn(truelayerAPIUtils, "getNewToken")
        .mockImplementationOnce(async () => undefined);
      const errorHandlingFn = await handleTruelayerError("Data API");

      const mockAuthAPIErrorResponse: DataAPIErrorResponse = {
        type: "There's likely a url here",
        title: "Error title",
        status: 404,
        trace_id: "Trace id",
        detail: "You had an oopsie"
      };

      const response: AxiosResponse = {
        data: mockAuthAPIErrorResponse,
        status: 404,
        statusText: "Not found",
        headers: new AxiosHeaders(),
        config: {headers: new AxiosHeaders(), url: "Response url"}
      };

      const mockError = new AxiosError(
        "Test error message",
        undefined,
        {
          headers: new AxiosHeaders(),
          url: "Config url"
        },
        undefined,
        response
      );

      const expectedAppError: IntegrationErrorResponse = {
        error: "Error title",
        errorMessage: "You had an oopsie see There's likely a url here",
        service: "Truelayer Data API",
        status: 404,
        url: "Response url"
      };

      await expect(errorHandlingFn(mockError)).rejects.toEqual(
        expectedAppError
      );

      expect(consoleError).toBeCalledTimes(1);
      expect(consoleError).toBeCalledWith(
        "A Truelayer Data API error has occurred: ",
        JSON.stringify(mockError)
      );
      expect(getNewTokenMock).not.toBeCalled();

      getNewTokenMock.mockRestore();
    });

    test("calls get new token for the data api on a 401 error", async () => {
      const getNewTokenMock = jest
        .spyOn(truelayerAPIUtils, "getNewToken")
        .mockImplementationOnce(async () => Promise.reject("Bad error"));
      const errorHandlingFn = await handleTruelayerError("Data API");

      const mockAuthAPIErrorResponse: DataAPIErrorResponse = {
        error: "access_denied"
      };

      const response: AxiosResponse = {
        data: mockAuthAPIErrorResponse,
        status: 401,
        statusText: "Access denied",
        headers: new AxiosHeaders(),
        config: {headers: new AxiosHeaders()}
      };

      const mockError = new AxiosError(
        undefined,
        undefined,
        undefined,
        undefined,
        response
      );

      await expect(errorHandlingFn(mockError)).rejects.toEqual("Bad error");

      expect(getNewTokenMock).toBeCalledTimes(1);
      expect(getNewTokenMock).toBeCalledWith();

      getNewTokenMock.mockRestore();
    });
  });

  describe("getNewToken", () => {
    test("returns a rejection if no refresh token is in storage", async () => {
      const consoleLog = jest.spyOn(console, "log");
      const mockGetTokenFromStorage = jest
        .spyOn(truelayerAPIUtils, "getTokenFromStorage")
        .mockResolvedValueOnce(null);

      await expect(getNewToken()).rejects.toEqual({
        error: "No refresh token found",
        errorMessage: "Could not get a valid refresh token from storage"
      });

      expect(consoleLog).toBeCalledTimes(1);
      expect(consoleLog).toBeCalledWith("Attempting to fetch a new token...");
      expect(mockGetTokenFromStorage).toBeCalledTimes(1);
      expect(mockGetTokenFromStorage).toBeCalledWith("truelayer-refresh-token");

      mockGetTokenFromStorage.mockRestore();
    });

    test("stores new access and refresh tokens", async () => {
      const consoleLog = jest.spyOn(console, "log");
      const mockGetTokenFromStorage = jest
        .spyOn(truelayerAPIUtils, "getTokenFromStorage")
        .mockImplementationOnce(async () => "refresh-token");
      const mockStoreNewTokens = jest
        .spyOn(truelayerAPIUtils, "storeNewTokens")
        .mockImplementationOnce(async () => {});
      (
        trueLayerAuthApi.post as jest.MockedFunction<
          typeof trueLayerAuthApi.post<
            ConnectTokenPostRequest,
            ConnectTokenPostResponse
          >
        >
      ).mockImplementationOnce(async () => ({
        access_token: "new-access-token",
        expires_in: 3600,
        refresh_token: "new-refresh-token",
        token_type: "token-type",
        scope: "accounts"
      }));

      await expect(getNewToken()).resolves.toBeUndefined();

      expect(consoleLog).toBeCalledTimes(4);
      expect(consoleLog).toBeCalledWith("Attempting to fetch a new token...");
      expect(consoleLog).toBeCalledWith("Successfully got new tokens.");
      expect(consoleLog).toBeCalledWith(
        "Attempting to store new access and refresh tokens..."
      );
      console.log("Successfully stored new tokens.");

      expect(mockGetTokenFromStorage).toBeCalledTimes(1);
      expect(mockGetTokenFromStorage).toBeCalledWith("truelayer-refresh-token");

      expect(trueLayerAuthApi.post).toBeCalledTimes(1);
      expect(trueLayerAuthApi.post).toBeCalledWith("connect/token", {
        grant_type: GrantType.REFRESH,
        client_id: config.integrations.trueLayer.clientId,
        client_secret: config.integrations.trueLayer.clientSecret,
        refresh_token: "refresh-token"
      });

      expect(mockStoreNewTokens).toBeCalledTimes(1);
      expect(mockStoreNewTokens).toBeCalledWith(
        "new-access-token",
        "new-refresh-token"
      );

      mockGetTokenFromStorage.mockRestore();
      mockStoreNewTokens.mockRestore();
    });

    test("stores new access token without refresh token", async () => {
      const mockGetTokenFromStorage = jest
        .spyOn(truelayerAPIUtils, "getTokenFromStorage")
        .mockImplementationOnce(async () => "refresh-token");
      const mockStoreNewTokens = jest
        .spyOn(truelayerAPIUtils, "storeNewTokens")
        .mockImplementationOnce(async () => {});
      (
        trueLayerAuthApi.post as jest.MockedFunction<
          typeof trueLayerAuthApi.post<
            ConnectTokenPostRequest,
            ConnectTokenPostResponse
          >
        >
      ).mockImplementationOnce(async () => ({
        access_token: "new-access-token",
        expires_in: 3600,
        token_type: "token-type",
        scope: "accounts"
      }));

      expect(await getNewToken()).toBeUndefined();

      expect(mockStoreNewTokens).toBeCalledTimes(1);
      expect(mockStoreNewTokens).toBeCalledWith("new-access-token", "");

      mockGetTokenFromStorage.mockRestore();
      mockStoreNewTokens.mockRestore();
    });
  });

  describe("storeNewTokens", () => {
    test("sets tokens in AsyncStorage", async () => {
      expect(await storeNewTokens("access-token", "refresh-token")).toBeNull();
      expect(await AsyncStorage.getItem("truelayer-auth-token")).toBe(
        "access-token"
      );
      expect(await AsyncStorage.getItem("truelayer-refresh-token")).toBe(
        "refresh-token"
      );
    });

    test("returns rejection on AsyncStorage failure", async () => {
      (
        AsyncStorage.multiSet as jest.MockedFunction<
          typeof AsyncStorage.multiSet
        >
      ).mockImplementationOnce(async () =>
        Promise.reject("Error with multiSet")
      );

      await expect(
        storeNewTokens("access-token", "refresh-token")
      ).rejects.toEqual({
        error: "Cannot store new tokens in AsyncStorage",
        errorMessage:
          "An error occurred when trying to store the access and refresh tokens in storage: Error with multiSet"
      });

      expect(await AsyncStorage.getItem("truelayer-auth-token")).toBeNull();
      expect(await AsyncStorage.getItem("truelayer-refresh-token")).toBeNull();
    });
  });

  describe("getTokenFromStorage", () => {
    test("gets the item correctly", async () => {
      await AsyncStorage.setItem("test-token", "a cool token");
      expect(await getTokenFromStorage("test-token")).toBe("a cool token");
    });

    test("returns rejection on AsyncStorage failure", async () => {
      (
        AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>
      ).mockImplementationOnce(async () =>
        Promise.reject("Error with getItem")
      );

      await expect(getTokenFromStorage("test-token")).rejects.toEqual({
        name: "Cannot fetch AsyncStorage test-token token",
        message:
          "An error occurred when trying to fetch the token from storage: Error with getItem"
      });
    });
  });
});
