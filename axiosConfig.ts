import axios, {AxiosHeaders} from "axios";

import config from "./config.json";
import {ConnectTokenPostResponse} from "./types/trueLayer/authAPI/auth";
import {DataAPIErrorResponse} from "./types/trueLayer/dataAPI/serverResponse";

// create instances for various apis
const trueLayerAuthApi = axios.create({
  baseURL: `${config.integrations.trueLayer.sandboxAuthUrl}/`,
  headers: {
    "Content-Type": "application/json"
  }
});
const trueLayerDataApi = axios.create({
  baseURL: `${config.integrations.trueLayer.sandboxDataUrl}/`,
  headers: {
    "Content-Type": "application/json",
    // ensures TrueLayer's cache is not used
    "Cache-Control": "max-age=0"
  }
});

// create response interceptors
trueLayerAuthApi.interceptors.response.use(response => response.data);
trueLayerDataApi.interceptors.response.use(
  response => response.data.results,
  async error => {
    const originalRequest = error.config;
    if (axios.isAxiosError(error) && error.response) {
      const errorResponse = error.response.data as DataAPIErrorResponse;
      error.response.status === 401
        ? await handleUnauthenticatedError(errorResponse, originalRequest)
        : console.error(
            "The following axios error occured: ",
            error.response.data
          );
    } else {
      console.log("IN ELSE CASE", error);
    }
    return Promise.reject(error);
  }
);

// helper functions

// TODO: Come back and re-think the approach to adding tokens
// to the request here. This function involves mutation of the
// axios instance to first remove any pre-existing interceptors,
// and then to replace those interceptors with new interceptors that
// have the correct token. This goes against the functional programming
// paradigm and also introduces a closure, which can be hard to reason about.
// A better approach may be to introduce a wrapper on the api that handles
// both errors and tokens, etc.
const createDataAPIRequestInterceptor = (
  token: string,
  originalRequest: any = {}
) => {
  trueLayerDataApi.interceptors.request.clear();
  trueLayerDataApi.interceptors.request.use(request => ({
    ...request,
    headers: new AxiosHeaders({
      ...originalRequest.headers,
      Authorization: `Bearer ${token}`
    })
  }));
};

// TODO: COME BACK AND USE SECURE STORAGE FOR THIS!!!
// TODO: COME BACK AND PUT THIS IN ITS OWN HOOK!!!!!
const getNewToken = async () => {
  try {
    const newAccessData = await trueLayerAuthApi.post<
      ConnectTokenPostResponse,
      ConnectTokenPostResponse
    >("connect/token", {
      grant_type: "refresh_token",
      client_id: `${config.integrations.trueLayer.clientId}`,
      client_secret: `${config.integrations.trueLayer.clientSecret}`,
      refresh_token:
        "9DEDC159A0450A0CB18CF71D53E6CAFCB0ECDD087E70E9FBA6E384965262CD41"
    });
    return newAccessData.access_token;
  } catch (error) {
    console.error("An error occured fetching the token ", error);
  }
};

const handleUnauthenticatedError = async (
  error: DataAPIErrorResponse,
  originalRequest: any = {}
) => {
  const errorMessage = `The following authentication error occured: ${
    error.error
  } ${
    error.error_description &&
    `for the following reason: ${error.error_description}`
  }\nAttempting to fetch a new token...`;
  console.log(errorMessage);
  const newToken = (await getNewToken()) ?? "";
  createDataAPIRequestInterceptor(newToken, originalRequest);
};

export default trueLayerDataApi;
