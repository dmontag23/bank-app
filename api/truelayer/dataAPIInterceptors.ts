import {AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig} from "axios";

import {getTokenFromStorage} from "./truelayerAPIUtils";

import {DataAPISuccessResponse} from "../../types/trueLayer/dataAPI/serverResponse";

export const handleTrueLayerDataApiRequest = async (
  request: InternalAxiosRequestConfig
) => {
  const authToken = await getTokenFromStorage("truelayer-auth-token");
  return {
    ...request,
    headers: new AxiosHeaders({
      ...request.headers,
      Authorization: `Bearer ${authToken}`
    })
  };
};

// TODO: Note that forcing this function to return any is to get past a type error in
// axiosConfig.ts, because the response from interceptors needs to be of type AxiosResponse
// see https://github.com/axios/axios/issues/5117
export const handleTrueLayerDataApiResponse = <T = any>(
  response: AxiosResponse<DataAPISuccessResponse<T>>
): any => response.data.results;
