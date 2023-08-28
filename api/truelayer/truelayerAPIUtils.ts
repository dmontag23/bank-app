// TODO: COME BACK AND USE SECURE STORAGE FOR STORING TOKENS!!!
import {AxiosError, isAxiosError} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// TODO: this is needed in order to be able to unit test these functions
// Might want to find a better way to do this and consider eliminating unit tests altogether in favor
// of integration tests as recommended by the react testing library
// see https://stackoverflow.com/questions/45111198/how-to-mock-functions-in-the-same-module-using-jest
import * as truelayerAPIUtils from "./truelayerAPIUtils";

import config from "../../config.json";
import {IntegrationErrorResponse} from "../../types/errors";
import {
  ConnectTokenPostRequest,
  ConnectTokenPostResponse,
  GrantType
} from "../../types/trueLayer/authAPI/auth";
import {AuthAPIErrorResponse} from "../../types/trueLayer/authAPI/serverResponse";
import {isCommonTruelayerAPIError} from "../../types/trueLayer/common";
import {DataAPIErrorResponse} from "../../types/trueLayer/dataAPI/serverResponse";
import {trueLayerAuthApi} from "../axiosConfig";

// TODO: Cleanup this function as all the conditions are confusing
export const handleTruelayerError =
  (apiName: string) => async (error: Error | AxiosError) => {
    console.error(
      `A Truelayer ${apiName} error has occurred: `,
      isAxiosError(error) ? JSON.stringify(error) : error
    );

    const errorToReturn: IntegrationErrorResponse = {
      error: "",
      // TODO: Make the service name an enum?
      service: `Truelayer ${apiName}`
    };

    if (isAxiosError<AuthAPIErrorResponse | DataAPIErrorResponse>(error)) {
      const errorResponse = error.response;

      if (errorResponse?.data) {
        if (errorResponse.status === 401 && apiName === "Data API")
          await truelayerAPIUtils.getNewToken();

        if (isCommonTruelayerAPIError(errorResponse.data))
          return Promise.reject({
            ...errorToReturn,
            error: errorResponse.data.error,
            errorMessage:
              errorResponse.data.error_description ||
              errorResponse.data.error_details
                ? `${errorResponse.data.error_description ?? ""} ${
                    Object.keys(errorResponse.data.error_details ?? {}).length
                      ? JSON.stringify(errorResponse.data.error_details)
                      : ""
                  }`.trim()
                : error.message,
            status: errorResponse.status,
            ...(errorResponse.config.url
              ? {url: errorResponse.config.url}
              : error.config?.url
              ? {url: error.config.url}
              : {})
          });

        // the only other type the error can possibly be here is
        // DataAPIErrorResponseWithType
        return Promise.reject({
          ...errorToReturn,
          error: errorResponse.data.title,
          errorMessage: `${errorResponse.data.detail ?? ""} see ${
            errorResponse.data.type
          }`.trim(),
          status: errorResponse.data.status,
          ...(errorResponse.config.url
            ? {url: errorResponse.config.url}
            : error.config?.url
            ? {url: error.config.url}
            : {})
        });
      }

      return Promise.reject({
        ...errorToReturn,
        error: error.name,
        errorMessage: error.message,
        ...(error.status ? {status: error.status} : {}),
        ...(error.config?.url ? {url: error.config.url} : {})
      });
    }

    return Promise.reject({
      ...errorToReturn,
      error: error.name,
      errorMessage: error.message
    });
  };

export const getNewToken = async () => {
  console.log("Attempting to fetch a new token...");

  const refreshToken = await truelayerAPIUtils.getTokenFromStorage(
    "truelayer-refresh-token"
  );
  if (!refreshToken)
    return Promise.reject({
      error: "No refresh token found",
      errorMessage: "Could not get a valid refresh token from storage"
    });

  const newAccessData = await trueLayerAuthApi.post<
    ConnectTokenPostRequest,
    ConnectTokenPostResponse
  >("connect/token", {
    grant_type: GrantType.REFRESH,
    client_id: config.integrations.trueLayer.clientId,
    client_secret: config.integrations.trueLayer.clientSecret,
    refresh_token: refreshToken
  });
  console.log("Successfully got new tokens.");
  console.log("Attempting to store new access and refresh tokens...");
  await truelayerAPIUtils.storeNewTokens(
    newAccessData.access_token,
    newAccessData.refresh_token ?? ""
  );
  console.log("Successfully stored new tokens.");
};

export const storeNewTokens = async (
  accessToken: string,
  refreshToken: string
) => {
  try {
    return await AsyncStorage.multiSet([
      ["truelayer-auth-token", accessToken],
      ["truelayer-refresh-token", refreshToken]
    ]);
  } catch (error: unknown) {
    return Promise.reject({
      error: "Cannot store new tokens in AsyncStorage",
      errorMessage: `An error occurred when trying to store the access and refresh tokens in storage: ${error}`
    });
  }
};

export const getTokenFromStorage = async (tokenName: string) => {
  try {
    return await AsyncStorage.getItem(tokenName);
  } catch (error: unknown) {
    return Promise.reject({
      name: `Cannot fetch AsyncStorage ${tokenName} token`,
      message: `An error occurred when trying to fetch the token from storage: ${error}`
    });
  }
};
