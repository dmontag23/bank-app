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
    expect(newToken).toEqual("good-access-token");
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
      "good-access-token",
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

    expect(logSpy).toHaveBeenCalledTimes(2);
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

    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenCalledWith(
      `The following authentication error occurred: ${expectedErrorResponse.error} for the following reason: ${expectedErrorResponse.error_description}\nAttempting to fetch a new token...`
    );
  });

  test("does not print success message when getting new token fails", async () => {
    const expectedErrorResponse = {
      error_description: "The token expired at '2020-12-07 12:34:56Z'",
      error: "invalid_token"
    };
    const logSpy = jest.spyOn(console, "warn");
    const headers = new AxiosHeaders({test: "headers"});

    // TODO: Come back and re-look at this
    // Should probably mock getNewToken somehow instead of using it, but this seems hard
    // See https://stackoverflow.com/questions/45111198/how-to-mock-functions-in-the-same-module-using-jest
    // Maybe use spy and have a call to reset all jest mocks after each test?
    server.use(
      rest.post<
        ConnectTokenPostRequest,
        never,
        ConnectTokenPostResponse | AuthAPIErrorResponse
      >(
        `${config.integrations.trueLayer.sandboxAuthUrl}/connect/token`,
        async (_, res, ctx) =>
          res(ctx.status(400), ctx.json({error: "invalid_grant"}))
      )
    );

    await expect(
      handleUnauthenticatedError(
        trueLayerAuthApi,
        expectedErrorResponse,
        headers
      )
    ).rejects.toBeTruthy();

    expect(logSpy).toHaveBeenCalledTimes(1);

    server.resetHandlers();
  });

  test("prints success message after getting new token to console", async () => {
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

    expect(logSpy).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenLastCalledWith("Successfully got a new token.");
  });
});
