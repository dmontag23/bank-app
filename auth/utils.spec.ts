import {AxiosHeaders} from "axios";
import {rest} from "msw";

import {getNewToken, handleUnauthenticatedError} from "./utils";

import {
  createDataAPIRequestInterceptor,
  trueLayerAuthApi
} from "../axiosConfig";
import config from "../config.json";
import {server} from "../tests/mocks/server";
import {
  ConnectTokenPostRequest,
  ConnectTokenPostResponse
} from "../types/trueLayer/authAPI/auth";
import {
  AuthAPIErrorResponse,
  ErrorCategory
} from "../types/trueLayer/authAPI/serverResponse";

jest.mock("../axiosConfig", () => ({
  ...jest.requireActual("../axiosConfig"),
  createDataAPIRequestInterceptor: jest.fn(() => {})
}));

describe("getNewToken", () => {
  test("returns a new token on a successful call to the connect/token endpoint", async () => {
    const newToken = await getNewToken(trueLayerAuthApi);
    expect(newToken).toEqual("access-token");
  });
  test("logs an error to the console on an unsuccessful call to the connect/token endpoint", async () => {
    const expectedErrorResponse = {
      error_description:
        "Sorry, we are experiencing technical difficulties. Please try again later.",
      error: "internal_server_error" as ErrorCategory,
      error_details: {}
    };

    // setup mocks & spies
    const logSpy = jest.spyOn(console, "error");
    server.use(
      rest.post<
        ConnectTokenPostRequest,
        never,
        ConnectTokenPostResponse | AuthAPIErrorResponse
      >(
        `${config.integrations.trueLayer.sandboxAuthUrl}/connect/token`,
        async (_, res, ctx) =>
          res(ctx.status(500), ctx.json(expectedErrorResponse))
      )
    );

    try {
      await getNewToken(trueLayerAuthApi);
    } catch (error: any) {
      expect(error.response.data).toEqual(expectedErrorResponse);
      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(
        "An error occurred fetching the token: ",
        error.message
      );
    }

    server.resetHandlers();
  });
});

describe("handleUnauthenticatedError", () => {
  test("calls function to create new interceptor", async () => {
    const headers = new AxiosHeaders({test: "headers"});
    await handleUnauthenticatedError(
      trueLayerAuthApi,
      {
        error: "invalid_token"
      },
      headers
    );
    expect(createDataAPIRequestInterceptor).toHaveBeenCalledWith(
      "access-token",
      headers
    );
  });
  test("only prints the error to the console when no description is present", async () => {
    const expectedErrorResponse = {
      error: "invalid_token"
    };
    const logSpy = jest.spyOn(console, "warn");
    const headers = new AxiosHeaders({test: "headers"});
    await handleUnauthenticatedError(
      trueLayerAuthApi,
      expectedErrorResponse,
      headers
    );
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(
      `The following authentication error occurred: ${expectedErrorResponse.error}\nAttempting to fetch a new token...`
    );
  });
  test("prints description to the console when the description is present", async () => {
    const expectedErrorResponse = {
      error_description: "The token expired at '2020-12-07 12:34:56Z'",
      error: "invalid_token"
    };
    const logSpy = jest.spyOn(console, "warn");
    const headers = new AxiosHeaders({test: "headers"});
    await handleUnauthenticatedError(
      trueLayerAuthApi,
      expectedErrorResponse,
      headers
    );
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(
      `The following authentication error occurred: ${expectedErrorResponse.error} for the following reason: ${expectedErrorResponse.error_description}\nAttempting to fetch a new token...`
    );
  });
});
