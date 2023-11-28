import {AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig} from "axios";

import {getTokenFromStorage} from "./utils";

import {DataAPISuccessResponse} from "../types/trueLayer/dataAPI/serverResponse";

export const handleApiRequest =
  (storageAuthTokenKey: string) =>
  async (request: InternalAxiosRequestConfig) => {
    const authToken = await getTokenFromStorage(storageAuthTokenKey);
    return {
      ...request,
      headers: new AxiosHeaders({
        ...request.headers,
        Authorization: `Bearer ${authToken}`
      })
    };
  };

// TODO: Type this better
export const handleTrueLayerAuthAPIResponse = (response: AxiosResponse) =>
  response.data;

// TODO: Note that forcing this function to return any is to get past a type error in
// axiosConfig.ts, because the response from interceptors needs to be of type AxiosResponse
// see https://github.com/axios/axios/issues/5117
export const handleTrueLayerDataApiResponse = <T = any>(
  response: AxiosResponse<DataAPISuccessResponse<T>>
): any => response.data.results;
