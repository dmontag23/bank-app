import {AxiosHeaders} from "axios";

import {handleUnauthenticatedError} from "./auth/utils";
import {
  createDataAPIRequestInterceptor,
  trueLayerAuthApi,
  trueLayerDataApi
} from "./axiosConfig";
import config from "./config.json";

// setup mocks and custom types
jest.mock("./auth/utils");
type DataAPIDummyGetSuccessReturn = {
  requestHeaders: Record<string, string>;
  url: string;
}[];

describe("TrueLayer Auth Api", () => {
  describe("config", () => {
    type DummyGetSuccessReturn = {
      requestHeaders: Record<string, string>;
      url: string;
    };
    test("returns the correct url", async () => {
      const {url} = await trueLayerAuthApi.get<DummyGetSuccessReturn>("/dummy");
      expect(url).toEqual(
        `${config.integrations.trueLayer.sandboxAuthUrl}/dummy`
      );
    });

    test("returns the correct headers", async () => {
      const {requestHeaders} =
        await trueLayerAuthApi.get<DummyGetSuccessReturn>("/dummy");
      expect(requestHeaders).toHaveProperty("content-type", "application/json");
    });
  });
});

describe("TrueLayer Data Api", () => {
  describe("config", () => {
    test("returns the correct url", async () => {
      const [results] =
        await trueLayerDataApi.get<DataAPIDummyGetSuccessReturn>("/dummy/200");
      expect(results.url).toEqual(
        `${config.integrations.trueLayer.sandboxDataUrl}/dummy/200`
      );
    });

    test("returns the correct headers", async () => {
      const [results] =
        await trueLayerDataApi.get<DataAPIDummyGetSuccessReturn>("/dummy/200");
      expect(results.requestHeaders).toHaveProperty(
        "content-type",
        "application/json"
      );
      expect(results.requestHeaders).toHaveProperty(
        "cache-control",
        "max-age=0"
      );
    });
  });
  describe("on an error response", () => {
    test("401 tries to refresh the token", async () => {
      const expectedErrorResponse = {
        error_description: "The token expired at '2020-12-07 12:34:56Z'",
        error: "invalid_token"
      };
      await expect(trueLayerDataApi.get("/dummy/401")).rejects.toEqual(
        expectedErrorResponse
      );
      expect(handleUnauthenticatedError).toHaveBeenCalled();
    });

    test("non-401 prints an error to the console and returns a rejected promise", async () => {
      const logSpy = jest.spyOn(console, "error");
      const expectedErrorResponse = {
        error_description: "Access to a specific resource has been denied.",
        error: "access_denied",
        error_details: {}
      };
      await expect(trueLayerDataApi.get("/dummy/403")).rejects.toEqual(
        expectedErrorResponse
      );
      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(
        "The following error response was returned from the TrueLayer Data API: ",
        expectedErrorResponse
      );
    });

    test("network error prints an error to the console and returns a rejected promise", async () => {
      const logSpy = jest.spyOn(console, "error");
      try {
        await trueLayerDataApi.get("/dummy/network-error");
      } catch (error: any) {
        expect(error).toHaveProperty("message", "Failed to connect");
        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith(
          "The following unexpected error occurred: ",
          error.message
        );
      }
    });
  });
});

describe("createDataAPIRequestInterceptor", () => {
  test("sets the correct request interceptor", async () => {
    createDataAPIRequestInterceptor(
      "test-token",
      new AxiosHeaders({test: "header"})
    );
    const [results] = await trueLayerDataApi.get<DataAPIDummyGetSuccessReturn>(
      "/dummy/200"
    );
    expect(results.requestHeaders).toHaveProperty("test", "header");
    expect(results.requestHeaders).toHaveProperty(
      "authorization",
      "Bearer test-token"
    );
  });
});
