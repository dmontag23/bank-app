// TODO: Create a unit test for this file?
import axios from "axios";

import {
  handleApiRequest,
  handleTrueLayerAuthAPIResponse,
  handleTrueLayerDataApiResponse
} from "./axiosInterceptors";
import {handleTruelayerError} from "./truelayer/truelayerAPIUtils";

import config from "../config.json";

export const starlingApi = axios.create({
  baseURL: config.integrations.starling.sandboxUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

export const trueLayerAuthApi = axios.create({
  baseURL: config.integrations.trueLayer.sandboxAuthUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

export const trueLayerDataApi = axios.create({
  baseURL: config.integrations.trueLayer.sandboxDataUrl,
  headers: {
    "Content-Type": "application/json",
    // ensures TrueLayer's cache is not used
    "Cache-Control": "max-age=0"
  }
});

// create request interceptors
starlingApi.interceptors.request.use(handleApiRequest("starling-auth-token"));

trueLayerDataApi.interceptors.request.use(
  handleApiRequest("truelayer-auth-token")
);

// create response interceptors
trueLayerAuthApi.interceptors.response.use(
  handleTrueLayerAuthAPIResponse,
  handleTruelayerError("Auth API")
);
trueLayerDataApi.interceptors.response.use(
  handleTrueLayerDataApiResponse,
  handleTruelayerError("Data API")
);
