import axios, {AxiosHeaders} from "axios";

import {
  handleTrueLayerAuthApiResponse,
  handleTrueLayerDataApiError,
  handleTrueLayerDataApiResponse
} from "./api/interceptors";
import config from "./config.json";

export const trueLayerAuthApi = axios.create({
  baseURL: `${config.integrations.trueLayer.sandboxAuthUrl}/`,
  headers: {
    "Content-Type": "application/json"
  }
});

export const trueLayerDataApi = axios.create({
  baseURL: `${config.integrations.trueLayer.sandboxDataUrl}/`,
  headers: {
    "Content-Type": "application/json",
    // ensures TrueLayer's cache is not used
    "Cache-Control": "max-age=0"
  }
});

// create response interceptors
trueLayerAuthApi.interceptors.response.use(handleTrueLayerAuthApiResponse);
trueLayerDataApi.interceptors.response.use(
  handleTrueLayerDataApiResponse,
  handleTrueLayerDataApiError
);

// TODO: Come back and re-think the approach to adding tokens
// to the request here. This function involves mutation of the
// axios instance to first remove any pre-existing interceptors,
// and then to replace those interceptors with new interceptors that
// have the correct token (via the headers passed in).
// This goes against the functional programming paradigm and also
// introduces a closure, which can be hard to reason about. It also makes this
// hard or impossible to test, like all the code in this file.
// A better approach may be to introduce a wrapper on the api that handles
// both errors and tokens, etc.
export const createDataAPIRequestInterceptor = (headers: AxiosHeaders) => {
  trueLayerDataApi.interceptors.request.clear();
  trueLayerDataApi.interceptors.request.use(request => ({
    ...request,
    headers
  }));
};
