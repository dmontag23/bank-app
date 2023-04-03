// TODO: COME BACK AND USE SECURE STORAGE FOR THIS!!!

import {AxiosHeaders} from "axios";

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
import {DataAPIErrorResponse} from "../types/trueLayer/dataAPI/serverResponse";

// TODO: COME BACK AND USE SECURE STORAGE!!
export const getNewToken = async () => {
  try {
    const newAccessData = await trueLayerAuthApi.post<
      ConnectTokenPostRequest,
      ConnectTokenPostResponse
    >("connect/token", {
      grant_type: GrantType.REFRESH,
      client_id: `${config.integrations.trueLayer.clientId}`,
      client_secret: `${config.integrations.trueLayer.clientSecret}`,
      refresh_token: ""
    });
    return newAccessData.access_token;
    // TODO: Maybe use an interceptor here for the auth api instead?
    // Could possibly re-use what is there for the data api
  } catch (error: any) {
    const errorMessage = error.response ? error.response.data : error.message;
    console.error("An error occurred fetching the token: ", errorMessage);
    return Promise.reject(errorMessage);
  }
};

export const handleUnauthenticatedError = async (
  error: DataAPIErrorResponse,
  originalRequestHeaders: AxiosHeaders
) => {
  const errorMessage = `The following authentication error occurred: ${
    error.error
  }${
    error.error_description
      ? ` for the following reason: ${error.error_description}`
      : ""
  }\nAttempting to fetch a new token...`;
  console.warn(errorMessage);
  const newToken = await getNewToken();
  console.warn("Successfully got a new token.");
  createDataAPIRequestInterceptor(
    new AxiosHeaders({
      ...originalRequestHeaders,
      Authorization: `Bearer ${newToken}`
    })
  );
};
