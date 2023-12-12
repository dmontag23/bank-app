import {AxiosError, AxiosHeaders, AxiosResponse} from "axios";
import {describe, expect, jest, test} from "@jest/globals";

import {
  handleAxiosApiErrorResponse,
  handleAxiosApiRequest,
  handleAxiosApiResponse
} from "./axiosInterceptors";
import {getTokenFromStorage} from "./utils";

import {IntegrationErrorResponse} from "../types/errors";
import {DataAPIErrorResponse} from "../types/trueLayer/dataAPI/serverResponse";

jest.mock("./utils");

describe("handleAxiosApiRequest", () => {
  test("adds passed in auth token to headers", async () => {
    const response = await handleAxiosApiRequest({authToken: "dummy-token"})({
      headers: new AxiosHeaders({header1: "header-1"}),
      baseURL: "dummy-url"
    });

    expect(response).toEqual({
      baseURL: "dummy-url",
      headers: new AxiosHeaders({
        header1: "header-1",
        Authorization: `Bearer dummy-token`
      })
    });

    expect(getTokenFromStorage).not.toBeCalled();
  });

  test("does not add token to headers if it does not exist in storage", async () => {
    (
      getTokenFromStorage as jest.MockedFunction<typeof getTokenFromStorage>
    ).mockResolvedValueOnce("");

    const response = await handleAxiosApiRequest({})({
      headers: new AxiosHeaders({header1: "header-1"}),
      baseURL: "dummy-url"
    });

    expect(response).toEqual({
      baseURL: "dummy-url",
      headers: new AxiosHeaders({
        header1: "header-1",
        Authorization: `Bearer `
      })
    });

    expect(getTokenFromStorage).toBeCalledTimes(1);
    expect(getTokenFromStorage).toBeCalledWith("");
  });

  test("adds a token to the headers from storage", async () => {
    (
      getTokenFromStorage as jest.MockedFunction<typeof getTokenFromStorage>
    ).mockResolvedValueOnce("mock-auth-token");

    const response = await handleAxiosApiRequest({
      storageAuthTokenKey: "mock-auth-token"
    })({
      headers: new AxiosHeaders({header1: "header-1"}),
      baseURL: "dummy-url"
    });

    expect(response).toEqual({
      baseURL: "dummy-url",
      headers: new AxiosHeaders({
        header1: "header-1",
        Authorization: `Bearer mock-auth-token`
      })
    });

    expect(getTokenFromStorage).toBeCalledTimes(1);
    expect(getTokenFromStorage).toBeCalledWith("mock-auth-token");
  });
});

describe("handleAxiosApiResponse", () => {
  const BASE_AXIOS_RESPONSE_CONFIG = {
    data: "",
    status: 200,
    statusText: "Succeeded",
    headers: new AxiosHeaders(),
    config: {headers: new AxiosHeaders()}
  };

  test("response interceptor returns destructured data", () => {
    const response = handleAxiosApiResponse({
      ...BASE_AXIOS_RESPONSE_CONFIG,
      data: "Response data"
    });

    expect(response).toEqual("Response data");
  });
});

describe("handleAxiosApiErrorResponse", () => {
  test("handles regular Javascript error", async () => {
    const consoleError = jest.spyOn(console, "error");
    const errorMessage = "This is a test error message";
    const serviceName = "Mock service";

    const errorHandlingFn = await handleAxiosApiErrorResponse(
      serviceName,
      async () => ({error: "", errorMessage: ""})
    );

    const mockError = new Error(errorMessage);

    const expectedAppError: IntegrationErrorResponse = {
      error: "Error",
      errorMessage: errorMessage,
      service: serviceName
    };

    await expect(errorHandlingFn(mockError)).rejects.toEqual(expectedAppError);

    expect(consoleError).toBeCalledTimes(1);
    expect(consoleError).toBeCalledWith(
      `A ${serviceName} error has occurred: `,
      mockError
    );
  });

  test("handles axios error without a response, status, or url", async () => {
    const consoleError = jest.spyOn(console, "error");
    const errorMessage = "Mock axios error";
    const serviceName = "Mock service";

    const errorHandlingFn = await handleAxiosApiErrorResponse(
      serviceName,
      async () => ({error: "", errorMessage: ""})
    );

    const mockError = new AxiosError(errorMessage);

    const expectedAppError: IntegrationErrorResponse = {
      error: "AxiosError",
      errorMessage: errorMessage,
      service: serviceName
    };

    await expect(errorHandlingFn(mockError)).rejects.toEqual(expectedAppError);

    expect(consoleError).toBeCalledTimes(1);
    expect(consoleError).toBeCalledWith(
      `A ${serviceName} error has occurred: `,
      JSON.stringify(mockError)
    );
  });

  test("handles axios error without a response but with status and url", async () => {
    const consoleError = jest.spyOn(console, "error");
    const errorMessage = "Mock axios error";
    const status = 404;
    const url = "Mock url";
    const serviceName = "Mock service";

    const errorHandlingFn = await handleAxiosApiErrorResponse(
      serviceName,
      async () => ({error: "", errorMessage: ""})
    );

    const mockError: AxiosError = {
      name: "AxiosError",
      message: errorMessage,
      status,
      config: {
        headers: new AxiosHeaders(),
        url
      },
      isAxiosError: true,
      toJSON: () => ({})
    };

    const expectedAppError: IntegrationErrorResponse = {
      error: "AxiosError",
      errorMessage: errorMessage,
      service: serviceName,
      status,
      url
    };

    await expect(errorHandlingFn(mockError)).rejects.toEqual(expectedAppError);

    expect(consoleError).toBeCalledTimes(1);
    expect(consoleError).toBeCalledWith(
      `A ${serviceName} error has occurred: `,
      JSON.stringify(mockError)
    );
  });

  test("handles axios error with a response and config url", async () => {
    const consoleError = jest.spyOn(console, "error");
    const error = "Mock error";
    const errorMessage = "Mock error message";
    const serviceName = "Mock service";

    const errorHandlingFn = await handleAxiosApiErrorResponse(
      serviceName,
      async () => ({error, errorMessage})
    );

    const mockErrorResponse: DataAPIErrorResponse = {
      error: "not_found",
      error_description: "Cannot find the page"
    };

    const status = 404;
    const url = "Mock url";

    const response: AxiosResponse = {
      data: mockErrorResponse,
      status,
      statusText: "Not found",
      headers: new AxiosHeaders(),
      config: {headers: new AxiosHeaders()}
    };

    const mockError: AxiosError = {
      name: "AxiosError",
      message: "Axios error message",
      response,
      status,
      config: {
        headers: new AxiosHeaders(),
        url
      },
      isAxiosError: true,
      toJSON: () => ({})
    };

    const expectedAppError: IntegrationErrorResponse = {
      error,
      errorMessage,
      service: serviceName,
      status,
      url
    };

    await expect(errorHandlingFn(mockError)).rejects.toEqual(expectedAppError);

    expect(consoleError).toBeCalledTimes(1);
    expect(consoleError).toBeCalledWith(
      `A ${serviceName} error has occurred: `,
      JSON.stringify(mockError)
    );
  });

  test("handles axios error with a response and response url", async () => {
    const consoleError = jest.spyOn(console, "error");
    const error = "Mock error";
    const errorMessage = "Mock error message";
    const serviceName = "Mock service";

    const errorHandlingFn = await handleAxiosApiErrorResponse(
      serviceName,
      async () => ({error, errorMessage})
    );

    const mockErrorResponse: DataAPIErrorResponse = {
      error: "not_found",
      error_description: "Cannot find the page"
    };

    const status = 404;
    const url = "Response url";

    const response: AxiosResponse = {
      data: mockErrorResponse,
      status,
      statusText: "Not found",
      headers: new AxiosHeaders(),
      config: {headers: new AxiosHeaders(), url}
    };

    const mockError: AxiosError = {
      name: "AxiosError",
      message: "Axios error message",
      response,
      status,
      config: {
        headers: new AxiosHeaders(),
        url: "Config url"
      },
      isAxiosError: true,
      toJSON: () => ({})
    };

    const expectedAppError: IntegrationErrorResponse = {
      error,
      errorMessage,
      service: serviceName,
      status,
      url
    };

    await expect(errorHandlingFn(mockError)).rejects.toEqual(expectedAppError);

    expect(consoleError).toBeCalledTimes(1);
    expect(consoleError).toBeCalledWith(
      `A ${serviceName} error has occurred: `,
      JSON.stringify(mockError)
    );
  });

  test("handles axios error with a response and no urls or callback errors", async () => {
    const consoleError = jest.spyOn(console, "error");
    const serviceName = "Mock service";

    const errorHandlingFn = await handleAxiosApiErrorResponse(
      serviceName,
      async () => ({error: "", errorMessage: ""})
    );

    const mockErrorResponse: DataAPIErrorResponse = {
      error: "not_found",
      error_description: "Cannot find the page"
    };

    const status = 404;

    const response: AxiosResponse = {
      data: mockErrorResponse,
      status,
      statusText: "Not found",
      headers: new AxiosHeaders(),
      config: {headers: new AxiosHeaders()}
    };

    const mockError: AxiosError = {
      name: "AxiosError",
      message: "Axios error message",
      response,
      status,
      config: {
        headers: new AxiosHeaders()
      },
      isAxiosError: true,
      toJSON: () => ({})
    };

    const expectedAppError: IntegrationErrorResponse = {
      error: "AxiosError",
      errorMessage: "Axios error message",
      service: serviceName,
      status
    };

    await expect(errorHandlingFn(mockError)).rejects.toEqual(expectedAppError);

    expect(consoleError).toBeCalledTimes(1);
    expect(consoleError).toBeCalledWith(
      `A ${serviceName} error has occurred: `,
      JSON.stringify(mockError)
    );
  });
});
