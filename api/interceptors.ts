import {AxiosResponse} from "axios";

import {handleUnauthenticatedError} from "./authUtils";

import {
  DataAPIErrorResponse,
  DataAPISuccessResponse
} from "../types/trueLayer/dataAPI/serverResponse";

export const handleTrueLayerAuthApiResponse = (response: AxiosResponse) =>
  response.data;

// Note that forcing this function to return any is to get past a type error in
// axiosConfig.ts, because the response from interceptors needs to be of type AxiosResponse
// see https://github.com/axios/axios/issues/5117
export const handleTrueLayerDataApiResponse = <T = any>(
  response: AxiosResponse<DataAPISuccessResponse<T>>
): any => response.data.results;

export const handleTrueLayerDataApiError = async (error: any) => {
  // The request was made and the server responded with a status code
  // that falls out of the range of 2xx
  if (error.response) {
    const errorResponse = error.response.data as DataAPIErrorResponse;
    error.response.status === 401
      ? await handleUnauthenticatedError(errorResponse, error.config.headers)
      : console.error(
          "The following error response was returned from the TrueLayer Data API: ",
          errorResponse
        );
    return Promise.reject(errorResponse);
  } else {
    console.error("The following unexpected error occurred: ", error.message);
    return Promise.reject(error);
  }
};
