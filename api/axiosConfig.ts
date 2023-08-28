import axios from "axios";

import {handleTrueLayerAuthAPIResponse} from "./truelayer/authAPIInterceptors";
import {
  handleTrueLayerDataApiRequest,
  handleTrueLayerDataApiResponse
} from "./truelayer/dataAPIInterceptors";
import {handleTruelayerError} from "./truelayer/truelayerAPIUtils";

import config from "../config.json";

export const trueLayerAuthApi = axios.create({
  baseURL: `${config.integrations.trueLayer.sandboxAuthUrl}/`,
  headers: {
    "Content-Type": "application/json"
  }
});

export const trueLayerDataApi = axios.create({
  baseURL: `${config.integrations.trueLayer.sandboxDataUrl}/data`,
  headers: {
    "Content-Type": "application/json",
    // ensures TrueLayer's cache is not used
    "Cache-Control": "max-age=0"
  }
});

// create request interceptors
trueLayerDataApi.interceptors.request.use(handleTrueLayerDataApiRequest);

// create response interceptors
trueLayerAuthApi.interceptors.response.use(
  handleTrueLayerAuthAPIResponse,
  handleTruelayerError("Auth API")
);
trueLayerDataApi.interceptors.response.use(
  handleTrueLayerDataApiResponse,
  handleTruelayerError("Data API")
);
