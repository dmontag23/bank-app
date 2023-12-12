import Config from "react-native-config";
import nock from "nock";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  starlingApi,
  trueLayerAuthApi,
  trueLayerDataApi
} from "../../api/axiosConfig";
import {
  Currency,
  StarlingAccount,
  StarlingAccountType
} from "../../types/starling/accounts";
import {StarlingErrorResponse} from "../../types/starling/error";
import {ConnectTokenPostResponse} from "../../types/trueLayer/authAPI/auth";
import {AuthAPIErrorResponse} from "../../types/trueLayer/authAPI/serverResponse";
import {
  DataAPIErrorResponse,
  DataAPISuccessResponse
} from "../../types/trueLayer/dataAPI/serverResponse";

describe("truelayer authentication flow", () => {
  test("correctly gets new access tokens on a 401 response", async () => {
    // setup mocks
    await AsyncStorage.setItem("truelayer-refresh-token", "good-refresh-token");

    const mockConnectTokenResponse: ConnectTokenPostResponse = {
      access_token: "new-auth-token",
      expires_in: 3600,
      refresh_token: "new-refresh-token",
      token_type: "Bearer",
      scope: "info"
    };
    nock(Config.TRUELAYER_AUTH_API_URL)
      .post("/connect/token")
      .reply(200, mockConnectTokenResponse);

    const mockUnauthenticatedResponse: DataAPIErrorResponse = {
      error_description: "The token expired at '2020-12-07 12:34:56Z'",
      error: "invalid_token"
    };

    nock(Config.TRUELAYER_DATA_API_URL)
      .get("/v1/cards/1/transactions")
      .reply(401, mockUnauthenticatedResponse);

    await expect(
      trueLayerDataApi.get("v1/cards/1/transactions")
    ).rejects.toEqual({
      error: "invalid_token",
      errorMessage: "The token expired at '2020-12-07 12:34:56Z'",
      service: "Truelayer Data API",
      status: 401,
      url: "v1/cards/1/transactions"
    });
    expect(await AsyncStorage.getItem("truelayer-auth-token")).toBe(
      "new-auth-token"
    );
    expect(await AsyncStorage.getItem("truelayer-refresh-token")).toBe(
      "new-refresh-token"
    );
  });

  test("returns rejection on failed authentication from auth endpoint", async () => {
    // setup mocks
    await AsyncStorage.setItem("truelayer-refresh-token", "good-refresh-token");

    const mockConnectTokenResponse: AuthAPIErrorResponse = {
      error: "invalid_grant"
    };
    nock(Config.TRUELAYER_AUTH_API_URL)
      .post("/connect/token")
      .reply(400, mockConnectTokenResponse);

    const mockUnauthenticatedResponse: DataAPIErrorResponse = {
      error_description: "The token expired at '2020-12-07 12:34:56Z'",
      error: "invalid_token"
    };

    nock(Config.TRUELAYER_DATA_API_URL)
      .get("/v1/cards/1/transactions")
      .reply(401, mockUnauthenticatedResponse);

    await expect(
      trueLayerDataApi.get("v1/cards/1/transactions")
    ).rejects.toEqual({
      error: "invalid_grant",
      errorMessage: "Request failed with status code 400",
      service: "Truelayer Auth API",
      status: 400,
      url: "connect/token"
    });
    expect(await AsyncStorage.getItem("truelayer-auth-token")).toBeNull();
    expect(await AsyncStorage.getItem("truelayer-refresh-token")).toBe(
      "good-refresh-token"
    );
  });

  test("returns rejection if a refresh token does not exist in storage", async () => {
    // setup mocks
    const mockUnauthenticatedResponse: DataAPIErrorResponse = {
      error_description: "The token expired at '2020-12-07 12:34:56Z'",
      error: "invalid_token"
    };

    nock(Config.TRUELAYER_DATA_API_URL)
      .get("/v1/cards/1/transactions")
      .reply(401, mockUnauthenticatedResponse);

    await expect(
      trueLayerDataApi.get("v1/cards/1/transactions")
    ).rejects.toEqual({
      error: "No refresh token found",
      errorMessage: "Could not get a valid refresh token from storage"
    });
    expect(await AsyncStorage.getItem("truelayer-auth-token")).toBeNull();
    expect(await AsyncStorage.getItem("truelayer-refresh-token")).toBeNull();
  });

  test("returns rejection if there is a problem getting tokens from storage", async () => {
    // setup mocks
    (
      AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>
    ).mockRejectedValueOnce("Error getting tokens from AsyncStorage");

    const mockUnauthenticatedResponse: DataAPIErrorResponse = {
      error_description: "The token expired at '2020-12-07 12:34:56Z'",
      error: "invalid_token"
    };

    nock(Config.TRUELAYER_DATA_API_URL)
      .get("/v1/cards/1/transactions")
      .reply(401, mockUnauthenticatedResponse);

    await expect(
      trueLayerDataApi.get("v1/cards/1/transactions")
    ).rejects.toEqual({
      error: "Cannot fetch AsyncStorage truelayer-auth-token token",
      errorMessage:
        "An error occurred when trying to fetch the token from storage: Error getting tokens from AsyncStorage",
      service: "Truelayer Data API"
    });
    expect(await AsyncStorage.getItem("truelayer-auth-token")).toBeNull();
    expect(await AsyncStorage.getItem("truelayer-refresh-token")).toBeNull();
  });

  test("returns rejection if there is a problem storing tokens", async () => {
    // setup mocks
    await AsyncStorage.setItem(
      "truelayer-refresh-token",
      "first-refresh-token"
    );

    (
      AsyncStorage.multiSet as jest.MockedFunction<typeof AsyncStorage.multiSet>
    ).mockRejectedValueOnce("Error storing tokens in AsyncStorage");

    const mockConnectTokenResponse: ConnectTokenPostResponse = {
      access_token: "new-auth-token",
      expires_in: 3600,
      refresh_token: "new-refresh-token",
      token_type: "Bearer",
      scope: "info"
    };
    nock(Config.TRUELAYER_AUTH_API_URL)
      .post("/connect/token")
      .reply(200, mockConnectTokenResponse);

    const mockUnauthenticatedResponse: DataAPIErrorResponse = {
      error_description: "The token expired at '2020-12-07 12:34:56Z'",
      error: "invalid_token"
    };

    nock(Config.TRUELAYER_DATA_API_URL)
      .get("/v1/cards/1/transactions")
      .reply(401, mockUnauthenticatedResponse);

    await expect(
      trueLayerDataApi.get("v1/cards/1/transactions")
    ).rejects.toEqual({
      error: "Cannot store new tokens in AsyncStorage",
      errorMessage:
        "An error occurred when trying to store the access and refresh tokens in storage: Error storing tokens in AsyncStorage"
    });
    expect(await AsyncStorage.getItem("truelayer-auth-token")).toBeNull();
    expect(await AsyncStorage.getItem("truelayer-refresh-token")).toBe(
      "first-refresh-token"
    );
  });
});

describe("basic success and error response from Truelayer APIs", () => {
  test("Truelayer Auth API returns success response", async () => {
    // setup mocks
    const mockConnectTokenResponse: ConnectTokenPostResponse = {
      access_token: "new-auth-token",
      expires_in: 3600,
      refresh_token: "new-refresh-token",
      token_type: "Bearer",
      scope: "info"
    };
    nock(Config.TRUELAYER_AUTH_API_URL)
      .post("/test")
      .reply(200, mockConnectTokenResponse);

    expect(await trueLayerAuthApi.post("test")).toEqual(
      mockConnectTokenResponse
    );
  });

  test("Truelayer Data API returns success response", async () => {
    // setup mocks
    await AsyncStorage.setItem(
      "truelayer-auth-token",
      "good-truelayer-auth-token"
    );

    const mockSuccessResponse: DataAPISuccessResponse<string> = {
      results: ["Test result"],
      status: "Succeeded"
    };

    nock(Config.TRUELAYER_DATA_API_URL, {
      reqheaders: {
        Authorization: "Bearer good-truelayer-auth-token"
      }
    })
      .get("/test")
      .reply(200, mockSuccessResponse);

    expect(await trueLayerDataApi.get("test")).toEqual(["Test result"]);
  });

  test("Truelayer Data API returns non 401 error response", async () => {
    // setup mocks
    await AsyncStorage.setItem(
      "truelayer-auth-token",
      "good-truelayer-auth-token"
    );

    const mockErrorResponse: DataAPIErrorResponse = {
      error: "Not found",
      error_description: "Cannot find this item",
      error_details: {details: "More details"}
    };

    nock(Config.TRUELAYER_DATA_API_URL, {
      reqheaders: {
        Authorization: "Bearer good-truelayer-auth-token"
      }
    })
      .get("/test")
      .reply(404, mockErrorResponse);

    await expect(trueLayerDataApi.get("test")).rejects.toEqual({
      error: "Not found",
      errorMessage: `Cannot find this item ${JSON.stringify(
        mockErrorResponse.error_details
      )}`,
      service: "Truelayer Data API",
      status: 404,
      url: "test"
    });
  });
});

describe("basic success and error response from Starling API", () => {
  test("returns success response", async () => {
    const mockStarlingAccount: StarlingAccount = {
      accountUid: "uuid",
      accountType: StarlingAccountType.PRIMARY,
      defaultCategory: "category",
      currency: Currency.EUR,
      createdAt: "2020-01-01",
      name: "name"
    };

    nock(Config.STARLING_API_URL, {
      reqheaders: {
        Authorization: "Bearer good-starling-auth-token"
      }
    })
      .get("/v2/accounts")
      .reply(200, {accounts: [mockStarlingAccount]});

    expect(await starlingApi.get("v2/accounts")).toEqual({
      accounts: [mockStarlingAccount]
    });
  });

  test("returns error response", async () => {
    const mockErrorResponse: StarlingErrorResponse = {
      error: "Not found",
      error_description: "Cannot find this item"
    };

    nock(Config.STARLING_API_URL, {
      reqheaders: {
        Authorization: "Bearer good-starling-auth-token"
      }
    })
      .get("/test")
      .reply(404, mockErrorResponse);

    await expect(starlingApi.get("test")).rejects.toEqual({
      error: "Not found",
      errorMessage: "Cannot find this item",
      service: "Starling API",
      status: 404,
      url: "test"
    });
  });
});
