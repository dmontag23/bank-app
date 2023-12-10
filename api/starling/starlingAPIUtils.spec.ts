import {AxiosHeaders, AxiosResponse} from "axios";
import {describe, expect, jest, test} from "@jest/globals";

import {handleStarlingError} from "./starlingAPIUtils";

import {StarlingErrorResponse} from "../../types/starling/error";
import {handleAxiosApiErrorResponse} from "../axiosInterceptors";

jest.mock("../axiosInterceptors");

describe("handleStarlingError", () => {
  test("extracts error correctly", async () => {
    const mockErrorResponse: StarlingErrorResponse = {
      error: "error",
      error_description: "error_description"
    };

    const response: AxiosResponse<StarlingErrorResponse> = {
      data: mockErrorResponse,
      status: 401,
      statusText: "invalid_token",
      headers: new AxiosHeaders(),
      config: {headers: new AxiosHeaders()}
    };

    handleStarlingError;

    expect(handleAxiosApiErrorResponse).toBeCalledTimes(1);
    expect(handleAxiosApiErrorResponse).toBeCalledWith(
      "Starling API",
      expect.any(Function)
    );

    const errorHandlingFn = (
      handleAxiosApiErrorResponse as jest.MockedFunction<
        typeof handleAxiosApiErrorResponse
      >
    ).mock.calls[0][1];

    await expect(errorHandlingFn(response)).resolves.toEqual({
      error: mockErrorResponse.error,
      errorMessage: mockErrorResponse.error_description
    });
  });
});
