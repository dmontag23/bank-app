import {AxiosHeaders} from "axios";
import {describe, expect, jest, test} from "@jest/globals";

import * as utils from "./authUtils";
import {
  handleTrueLayerAuthApiResponse,
  handleTrueLayerDataApiError,
  handleTrueLayerDataApiResponse
} from "./interceptors";

import {DataAPIErrorResponse} from "../types/trueLayer/dataAPI/serverResponse";

const BASE_AXIOS_RESPONSE_CONFIG = {
  data: "",
  status: 200,
  statusText: "Succeeded",
  headers: new AxiosHeaders(),
  config: {headers: new AxiosHeaders()}
};

jest.mock("./authUtils");

describe("TrueLayer auth api response interceptor", () => {
  test("returns destructured data", () => {
    const authApiResponse = handleTrueLayerAuthApiResponse({
      ...BASE_AXIOS_RESPONSE_CONFIG,
      data: "Response data"
    });

    expect(authApiResponse).toEqual("Response data");
  });
});

describe("TrueLayer data api response interceptor", () => {
  test("returns destructured string data", () => {
    const dataApiResponse = handleTrueLayerDataApiResponse<string>({
      ...BASE_AXIOS_RESPONSE_CONFIG,
      data: {results: ["Response data"], status: "Succeeded"}
    });

    expect(dataApiResponse).toEqual(["Response data"]);
  });
});

describe("TrueLayer data api error interceptor", () => {
  test("correctly processes a 401 Axios error", async () => {
    const consoleError = jest
      .spyOn(global.console, "error")
      .mockImplementation(() => {});
    const mockHeaders = new AxiosHeaders({
      test: "header"
    });
    const mockErrorData: DataAPIErrorResponse = {
      error: "invalid_token"
    };

    // assertions
    // a "response" field in the error indicates that the error
    // was returned from the server
    await expect(
      handleTrueLayerDataApiError({
        config: {
          headers: mockHeaders
        },
        response: {
          data: mockErrorData,
          status: 401
        }
      })
    ).rejects.toEqual(mockErrorData);
    expect(consoleError).not.toBeCalled();
    expect(utils.handleUnauthenticatedError).toBeCalledTimes(1);
    expect(utils.handleUnauthenticatedError).toBeCalledWith(
      mockErrorData,
      mockHeaders
    );
  });

  test("correctly processes a non-401 Axios error", async () => {
    const consoleError = jest
      .spyOn(global.console, "error")
      .mockImplementation(() => {});
    const mockHeaders = new AxiosHeaders({
      test: "header"
    });
    const mockErrorData: DataAPIErrorResponse = {
      error_description: "Access to a specific resource has been denied.",
      error: "access_denied",
      error_details: {}
    };

    // assertions
    // a "response" field in the error indicates that the error
    // was returned from the server
    await expect(
      handleTrueLayerDataApiError({
        config: {
          headers: mockHeaders
        },
        response: {
          data: mockErrorData,
          status: 403
        }
      })
    ).rejects.toEqual(mockErrorData);
    expect(utils.handleUnauthenticatedError).not.toBeCalled();
    expect(consoleError).toBeCalledTimes(1);
    expect(consoleError).toBeCalledWith(
      "The following error response was returned from the TrueLayer Data API: ",
      mockErrorData
    );
  });

  test("correctly processes a network error", async () => {
    const consoleError = jest
      .spyOn(global.console, "error")
      .mockImplementation(() => {});
    const mockErrorMessage = "Network error";
    const mockError = Error(mockErrorMessage);

    // assertions
    await expect(handleTrueLayerDataApiError(mockError)).rejects.toEqual(
      mockError
    );
    expect(utils.handleUnauthenticatedError).not.toBeCalled();
    expect(consoleError).toBeCalledTimes(1);
    expect(consoleError).toBeCalledWith(
      "The following unexpected error occurred: ",
      mockErrorMessage
    );
  });
});
