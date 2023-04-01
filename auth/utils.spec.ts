import {AxiosHeaders} from "axios";

import {getNewToken, handleUnauthenticatedError} from "./utils";

import * as axiosConfig from "../axiosConfig";
import {AuthAPIErrorResponse} from "../types/trueLayer/authAPI/serverResponse";
import {DataAPIErrorResponse} from "../types/trueLayer/dataAPI/serverResponse";

// TODO: Note that, because `setup.ts` has dependencies on utils.ts,
// nothing in axiosConfig.ts or utils.ts can be mocked. I re-evaluate
// auth as a whole, and that would be the time to reconsider how these
// tests are done.
// jest.mock("../axiosConfig", () => ({
//   ...jest.requireActual("../axiosConfig"),
//   createDataAPIRequestInterceptor: jest.fn(() => {})
// }));

describe("getNewToken", () => {
  // TODO: Add test for error thrown by JS (e.g. network error). Maybe mock axios for all
  // unit + integration tests to do this, would help with the setup.ts problem above
  test("returns a new token on a successful call to the connect/token endpoint", async () => {
    const newToken = await getNewToken(
      axiosConfig.trueLayerAuthApi,
      new AxiosHeaders()
    );
    expect(newToken).toEqual("good-access-token");
  });

  test("logs an error to the console on an unsuccessful call to the connect/token endpoint", async () => {
    const consoleError = jest.spyOn(console, "error");

    const expectedErrorResponse: AuthAPIErrorResponse = {
      error_description:
        "Sorry, we are experiencing technical difficulties. Please try again later.",
      error: "internal_server_error",
      error_details: {}
    };
    await expect(
      getNewToken(
        axiosConfig.trueLayerAuthApi,
        new AxiosHeaders({"mock-return-connect-token": "500"})
      )
    ).rejects.toEqual(expectedErrorResponse);
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(
      "An error occurred fetching the token: ",
      expectedErrorResponse
    );
  });
});

describe("handleUnauthenticatedError", () => {
  test("calls function to create new interceptor", async () => {
    const createDataAPIRequestInterceptor = jest.spyOn(
      axiosConfig,
      "createDataAPIRequestInterceptor"
    );

    const headers = new AxiosHeaders({test: "headers"});
    await handleUnauthenticatedError(
      axiosConfig.trueLayerAuthApi,
      {
        error: "invalid_token"
      },
      headers
    );

    expect(createDataAPIRequestInterceptor).toHaveBeenCalledWith(
      "good-access-token",
      headers
    );
  });

  test("only prints the error to the console when no description is present", async () => {
    const expectedErrorResponse: DataAPIErrorResponse = {
      error: "invalid_token"
    };
    const consoleWarn = jest.spyOn(console, "warn");

    const headers = new AxiosHeaders({test: "headers"});
    await handleUnauthenticatedError(
      axiosConfig.trueLayerAuthApi,
      expectedErrorResponse,
      headers
    );

    expect(consoleWarn).toHaveBeenCalledTimes(2);
    expect(consoleWarn).toHaveBeenCalledWith(
      `The following authentication error occurred: ${expectedErrorResponse.error}\nAttempting to fetch a new token...`
    );
  });

  test("prints description to the console when the description is present", async () => {
    const expectedErrorResponse: DataAPIErrorResponse = {
      error_description: "The token expired at '2020-12-07 12:34:56Z'",
      error: "invalid_token"
    };
    const consoleWarn = jest.spyOn(console, "warn");

    const headers = new AxiosHeaders({test: "headers"});
    await handleUnauthenticatedError(
      axiosConfig.trueLayerAuthApi,
      expectedErrorResponse,
      headers
    );

    expect(consoleWarn).toHaveBeenCalledTimes(2);
    expect(consoleWarn).toHaveBeenCalledWith(
      `The following authentication error occurred: ${expectedErrorResponse.error} for the following reason: ${expectedErrorResponse.error_description}\nAttempting to fetch a new token...`
    );
  });

  test("does not print success message when getting new token fails", async () => {
    const consoleWarn = jest.spyOn(console, "warn");

    const expectedErrorResponse: DataAPIErrorResponse = {
      error_description: "The token expired at '2020-12-07 12:34:56Z'",
      error: "invalid_token"
    };
    const headers = new AxiosHeaders({
      test: "headers",
      "mock-return-connect-token": "400"
    });
    await expect(
      handleUnauthenticatedError(
        axiosConfig.trueLayerAuthApi,
        expectedErrorResponse,
        headers
      )
    ).rejects.toBeTruthy();

    expect(consoleWarn).toHaveBeenCalledTimes(1);
  });

  test("prints success message after getting new token to console", async () => {
    const expectedErrorResponse: DataAPIErrorResponse = {
      error_description: "The token expired at '2020-12-07 12:34:56Z'",
      error: "invalid_token"
    };
    const consoleWarn = jest.spyOn(console, "warn");

    const headers = new AxiosHeaders({test: "headers"});
    await handleUnauthenticatedError(
      axiosConfig.trueLayerAuthApi,
      expectedErrorResponse,
      headers
    );

    expect(consoleWarn).toHaveBeenCalledTimes(2);
    expect(consoleWarn).toHaveBeenLastCalledWith(
      "Successfully got a new token."
    );
  });
});
