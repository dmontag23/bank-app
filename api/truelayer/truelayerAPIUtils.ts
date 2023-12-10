import {AxiosResponse} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// TODO: this is needed in order to be able to unit test these functions
// Might want to find a better way to do this and consider eliminating unit tests altogether in favor
// of integration tests as recommended by the react testing library
// see https://stackoverflow.com/questions/45111198/how-to-mock-functions-in-the-same-module-using-jest
import * as truelayerAPIUtils from "./truelayerAPIUtils";

import config from "../../config.json";
import {
  ConnectTokenPostRequest,
  ConnectTokenPostResponse,
  GrantType
} from "../../types/trueLayer/authAPI/auth";
import {AuthAPIErrorResponse} from "../../types/trueLayer/authAPI/serverResponse";
import {isCommonTruelayerAPIError} from "../../types/trueLayer/common";
import {DataAPIErrorResponse} from "../../types/trueLayer/dataAPI/serverResponse";
import {trueLayerAuthApi} from "../axiosConfig";
import {handleAxiosApiErrorResponse} from "../axiosInterceptors";
import {getTokenFromStorage} from "../utils";

export const handleTruelayerError = (apiName: string) => {
  const extractError = async (
    response: AxiosResponse<AuthAPIErrorResponse | DataAPIErrorResponse>
  ) => {
    if (response.status === 401 && apiName === "Data API")
      await truelayerAPIUtils.getNewToken();

    return isCommonTruelayerAPIError(response.data)
      ? {
          error: response.data.error,
          errorMessage: `${response.data.error_description ?? ""} ${
            Object.keys(response.data.error_details ?? {}).length
              ? JSON.stringify(response.data.error_details)
              : ""
          }`.trim()
        }
      : // the only other type the error can possibly be here is
        // DataAPIErrorResponseWithType
        {
          error: response.data.title,
          errorMessage: `${response.data.detail ?? ""} see ${
            response.data.type
          }`.trim()
        };
  };

  return handleAxiosApiErrorResponse(`Truelayer ${apiName}`, extractError);
};

export const getNewToken = async () => {
  console.log("Attempting to fetch a new token...");

  const refreshToken = await getTokenFromStorage("truelayer-refresh-token");
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
