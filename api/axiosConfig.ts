// TODO: Create a unit test for this file?
import Config from "react-native-config";
import axios from "axios";

import {
  handleAxiosApiRequest,
  handleAxiosApiResponse
} from "./axiosInterceptors";
import {handleStarlingError} from "./starling/starlingAPIUtils";
import {handleTruelayerError} from "./truelayer/truelayerAPIUtils";

import {DataAPISuccessResponse} from "../types/trueLayer/dataAPI/serverResponse";

const baseHeaders = {
  "Content-Type": "application/json"
};

export const starlingApi = axios.create({
  baseURL: Config.STARLING_API_URL,
  headers: baseHeaders
});

export const trueLayerAuthApi = axios.create({
  baseURL: Config.TRUELAYER_AUTH_API_URL,
  headers: baseHeaders
});
export const trueLayerDataApi = axios.create({
  baseURL: Config.TRUELAYER_DATA_API_URL,
  headers: {
    ...baseHeaders,
    // ensures Truelayer's cache is not used
    "Cache-Control": "max-age=0"
  }
});

// create request interceptors
starlingApi.interceptors.request.use(
  handleAxiosApiRequest({authToken: Config.STARLING_API_AUTH_TOKEN})
);

trueLayerDataApi.interceptors.request.use(
  handleAxiosApiRequest({storageAuthTokenKey: "truelayer-auth-token"})
);

// create response interceptors
starlingApi.interceptors.response.use(
  handleAxiosApiResponse,
  handleStarlingError
);

trueLayerAuthApi.interceptors.response.use(
  handleAxiosApiResponse,
  handleTruelayerError("Auth API")
);
// TODO: Note that forcing this function to return type any is to get past a type error in
// axiosConfig.ts, because the response from interceptors needs to be of type AxiosResponse
// see https://github.com/axios/axios/issues/5117
trueLayerDataApi.interceptors.response.use(
  (response): any =>
    handleAxiosApiResponse<DataAPISuccessResponse<any>>(response).results,
  handleTruelayerError("Data API")
);
