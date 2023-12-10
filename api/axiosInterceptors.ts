import {
  AxiosError,
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
  isAxiosError
} from "axios";

import {getTokenFromStorage} from "./utils";

import {IntegrationErrorResponse} from "../types/errors";

export const handleAxiosApiRequest =
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

export const handleAxiosApiResponse = <T>(response: AxiosResponse<T>) =>
  response.data;

export const handleAxiosApiErrorResponse =
  <T>(
    service: string,
    callback: (response: AxiosResponse<T>) => Promise<{
      error: string;
      errorMessage: string;
    }>
  ) =>
  async (serverError: Error | AxiosError) => {
    console.error(
      `A ${service} error has occurred: `,
      isAxiosError(serverError) ? JSON.stringify(serverError) : serverError
    );

    const errorToReturn: IntegrationErrorResponse = {
      error: "",
      service
    };

    if (isAxiosError<T>(serverError)) {
      const errorResponse = serverError.response;
      if (errorResponse) {
        const {
          error: errorFromCallback,
          errorMessage: errorMessageFromCallback
        } = await callback(errorResponse);
        return Promise.reject({
          ...errorToReturn,
          error: errorFromCallback.length
            ? errorFromCallback
            : serverError.name,
          errorMessage: errorMessageFromCallback.length
            ? errorMessageFromCallback
            : serverError.message,
          status: errorResponse.status,
          ...(errorResponse.config.url
            ? {url: errorResponse.config.url}
            : serverError.config?.url
            ? {url: serverError.config.url}
            : {})
        });
      }

      return Promise.reject({
        ...errorToReturn,
        error: serverError.name,
        errorMessage: serverError.message,
        ...(serverError.status ? {status: serverError.status} : {}),
        ...(serverError.config?.url ? {url: serverError.config.url} : {})
      });
    }

    return Promise.reject({
      ...errorToReturn,
      error: serverError.name,
      errorMessage: serverError.message
    });
  };
