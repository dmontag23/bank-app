import {AxiosHeaders, AxiosResponse} from "axios";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

// needed in order to mock functions from the same module
import * as truelayerAPIUtils from "./truelayerAPIUtils";
import {
  getNewToken,
  handleTruelayerError,
  storeNewTokens
} from "./truelayerAPIUtils";

import config from "../../config.json";
import {
  ConnectTokenPostRequest,
  ConnectTokenPostResponse,
  GrantType
} from "../../types/trueLayer/authAPI/auth";
import {AuthAPIErrorResponse} from "../../types/trueLayer/authAPI/serverResponse";
import {DataAPIErrorResponse} from "../../types/trueLayer/dataAPI/serverResponse";
import {trueLayerAuthApi} from "../axiosConfig";
import {handleAxiosApiErrorResponse} from "../axiosInterceptors";
import {getTokenFromStorage} from "../utils";

jest.mock("../axiosConfig");
jest.mock("../axiosInterceptors");
jest.mock("../utils");

describe("Truelayer API Utils", () => {
  describe("handleTruelayerError", () => {
    test("handles DataAPIErrorResponseWithType error with detail", async () => {
      const getNewTokenMock = jest.spyOn(truelayerAPIUtils, "getNewToken");

      const mockAuthAPIErrorResponse: DataAPIErrorResponse = {
        type: "type",
        title: "title",
        status: 403,
        trace_id: "trace-id",
        detail: "  detail"
      };

      const response: AxiosResponse = {
        data: mockAuthAPIErrorResponse,
        status: 403,
        statusText: "Bad token",
        headers: new AxiosHeaders(),
        config: {headers: new AxiosHeaders()}
      };

      handleTruelayerError("Data API");

      expect(handleAxiosApiErrorResponse).toBeCalledTimes(1);
      expect(handleAxiosApiErrorResponse).toBeCalledWith(
        "Truelayer Data API",
        expect.any(Function)
      );

      const errorHandlingFn = (
        handleAxiosApiErrorResponse as jest.MockedFunction<
          typeof handleAxiosApiErrorResponse
        >
      ).mock.calls[0][1];

      await expect(errorHandlingFn(response)).resolves.toEqual({
        error: "title",
        errorMessage: "detail see type"
      });
      expect(getNewTokenMock).not.toBeCalled();
    });

    test("handles DataAPIErrorResponseWithType error with no detail", async () => {
      const getNewTokenMock = jest.spyOn(truelayerAPIUtils, "getNewToken");

      const mockAuthAPIErrorResponse: DataAPIErrorResponse = {
        type: "type",
        title: "title",
        status: 403,
        trace_id: "trace-id"
      };

      const response: AxiosResponse = {
        data: mockAuthAPIErrorResponse,
        status: 403,
        statusText: "Bad token",
        headers: new AxiosHeaders(),
        config: {headers: new AxiosHeaders()}
      };

      handleTruelayerError("Data API");

      expect(handleAxiosApiErrorResponse).toBeCalledTimes(1);
      expect(handleAxiosApiErrorResponse).toBeCalledWith(
        "Truelayer Data API",
        expect.any(Function)
      );

      const errorHandlingFn = (
        handleAxiosApiErrorResponse as jest.MockedFunction<
          typeof handleAxiosApiErrorResponse
        >
      ).mock.calls[0][1];

      await expect(errorHandlingFn(response)).resolves.toEqual({
        error: "title",
        errorMessage: "see type"
      });
      expect(getNewTokenMock).not.toBeCalled();
    });

    test("handles common api error with description and details", async () => {
      const getNewTokenMock = jest.spyOn(truelayerAPIUtils, "getNewToken");

      const mockAuthAPIErrorResponse: AuthAPIErrorResponse = {
        error: "access_denied",
        error_description: "  Your access has been denied",
        error_details: {"B/c": "reasons"}
      };

      const response: AxiosResponse = {
        data: mockAuthAPIErrorResponse,
        status: 401,
        statusText: "Access denied",
        headers: new AxiosHeaders(),
        config: {headers: new AxiosHeaders()}
      };

      handleTruelayerError("Auth API");

      expect(handleAxiosApiErrorResponse).toBeCalledTimes(1);
      expect(handleAxiosApiErrorResponse).toBeCalledWith(
        "Truelayer Auth API",
        expect.any(Function)
      );

      const errorHandlingFn = (
        handleAxiosApiErrorResponse as jest.MockedFunction<
          typeof handleAxiosApiErrorResponse
        >
      ).mock.calls[0][1];

      await expect(errorHandlingFn(response)).resolves.toEqual({
        error: "access_denied",
        errorMessage: `Your access has been denied ${JSON.stringify(
          mockAuthAPIErrorResponse.error_details
        )}`
      });
      expect(getNewTokenMock).not.toBeCalled();
    });

    test("handles common api error with no description or details", async () => {
      const getNewTokenMock = jest.spyOn(truelayerAPIUtils, "getNewToken");

      const mockAuthAPIErrorResponse: AuthAPIErrorResponse = {
        error: "unauthorized"
      };

      const response: AxiosResponse = {
        data: mockAuthAPIErrorResponse,
        status: 403,
        statusText: "Not authorized",
        headers: new AxiosHeaders(),
        config: {headers: new AxiosHeaders()}
      };

      handleTruelayerError("Data API");

      expect(handleAxiosApiErrorResponse).toBeCalledTimes(1);
      expect(handleAxiosApiErrorResponse).toBeCalledWith(
        "Truelayer Data API",
        expect.any(Function)
      );

      const errorHandlingFn = (
        handleAxiosApiErrorResponse as jest.MockedFunction<
          typeof handleAxiosApiErrorResponse
        >
      ).mock.calls[0][1];

      await expect(errorHandlingFn(response)).resolves.toEqual({
        error: "unauthorized",
        errorMessage: ""
      });
      expect(getNewTokenMock).not.toBeCalled();
    });

    test("calls get new token for the data api on a 401 error", async () => {
      const getNewTokenMock = jest
        .spyOn(truelayerAPIUtils, "getNewToken")
        .mockRejectedValueOnce("Bad error");

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

      handleTruelayerError("Data API");

      expect(handleAxiosApiErrorResponse).toBeCalledTimes(1);
      expect(handleAxiosApiErrorResponse).toBeCalledWith(
        "Truelayer Data API",
        expect.any(Function)
      );

      const errorHandlingFn = (
        handleAxiosApiErrorResponse as jest.MockedFunction<
          typeof handleAxiosApiErrorResponse
        >
      ).mock.calls[0][1];

      await expect(errorHandlingFn(response)).rejects.toEqual("Bad error");
      expect(getNewTokenMock).toBeCalledTimes(1);
      expect(getNewTokenMock).toBeCalledWith();
      getNewTokenMock.mockRestore();
    });
  });

  describe("getNewToken", () => {
    test("returns a rejection if no refresh token is in storage", async () => {
      const consoleLog = jest.spyOn(console, "log");
      (
        getTokenFromStorage as jest.MockedFunction<typeof getTokenFromStorage>
      ).mockResolvedValueOnce(null);

      await expect(getNewToken()).rejects.toEqual({
        error: "No refresh token found",
        errorMessage: "Could not get a valid refresh token from storage"
      });

      expect(consoleLog).toBeCalledTimes(1);
      expect(consoleLog).toBeCalledWith("Attempting to fetch a new token...");
      expect(getTokenFromStorage).toBeCalledTimes(1);
      expect(getTokenFromStorage).toBeCalledWith("truelayer-refresh-token");
    });

    test("stores new access and refresh tokens", async () => {
      const consoleLog = jest.spyOn(console, "log");
      (
        getTokenFromStorage as jest.MockedFunction<typeof getTokenFromStorage>
      ).mockResolvedValueOnce("refresh-token");
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

      expect(getTokenFromStorage).toBeCalledTimes(1);
      expect(getTokenFromStorage).toBeCalledWith("truelayer-refresh-token");

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

      mockStoreNewTokens.mockRestore();
    });

    test("stores new access token without refresh token", async () => {
      (
        getTokenFromStorage as jest.MockedFunction<typeof getTokenFromStorage>
      ).mockResolvedValueOnce("refresh-token");
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
});
