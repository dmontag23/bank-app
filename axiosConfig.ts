import axios, {AxiosHeaders} from "axios";

import {handleUnauthenticatedError} from "./auth/utils";
import config from "./config.json";
import {DataAPIErrorResponse} from "./types/trueLayer/dataAPI/serverResponse";

// create instances for various apis
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
trueLayerAuthApi.interceptors.response.use(response => response.data);
// TODO: figure out how to properly type response.data here
// response.data is DataAPISuccessResponse but axios doesn't like that
// because "use" needs to return an AxiosResponse object by default
// so it might be necessary to override this type in axios.d.ts
trueLayerDataApi.interceptors.response.use(
  response => response.data.results,
  async error => {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (error.response) {
      const errorResponse = error.response.data as DataAPIErrorResponse;
      error.response.status === 401
        ? await handleUnauthenticatedError(
            trueLayerAuthApi,
            errorResponse,
            error.config.headers
          )
        : console.error(
            "The following error response was returned from the TrueLayer Data API: ",
            errorResponse
          );
      return Promise.reject(errorResponse);
    } else {
      console.error("The following unexpected error occurred: ", error.message);
      return Promise.reject(error);
    }
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
export const createDataAPIRequestInterceptor = (
  token: string,
  originalRequestHeaders: AxiosHeaders
) => {
  trueLayerDataApi.interceptors.request.clear();
  // TODO: May want to reconsider typing here as well (see comment above)
  trueLayerDataApi.interceptors.request.use(request => ({
    ...request,
    headers: new AxiosHeaders({
      ...originalRequestHeaders,
      Authorization: `Bearer ${token}`
    })
  }));
};
