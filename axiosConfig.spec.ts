import {AxiosHeaders} from "axios";

import * as utils from "./auth/utils";
import {
  createDataAPIRequestInterceptor,
  trueLayerAuthApi,
  trueLayerDataApi
} from "./axiosConfig";
import config from "./config.json";
import {DataAPIErrorResponse} from "./types/trueLayer/dataAPI/serverResponse";

describe("TrueLayer Auth Api", () => {
  describe("config", () => {
    type AuthAPIDummyGetSuccessReturn = {
      requestHeaders: Record<string, string>;
      url: string;
    };

    test("returns the correct url", async () => {
      const {url} = await trueLayerAuthApi.get<AuthAPIDummyGetSuccessReturn>(
        "/dummy"
      );

      expect(url).toEqual(
        `${config.integrations.trueLayer.sandboxAuthUrl}/dummy`
      );
    });

    test("returns the correct headers", async () => {
      const {requestHeaders} =
        await trueLayerAuthApi.get<AuthAPIDummyGetSuccessReturn>("/dummy");

      expect(requestHeaders).toHaveProperty("content-type", "application/json");
    });
  });
});

type DataAPIDummyGetSuccessReturn = {
  requestHeaders: Record<string, string>;
  url: string;
}[];

describe("TrueLayer Data Api", () => {
  describe("config", () => {
    test("returns the correct url", async () => {
      const [results] =
        await trueLayerDataApi.get<DataAPIDummyGetSuccessReturn>("/dummy");

      expect(results.url).toEqual(
        `${config.integrations.trueLayer.sandboxDataUrl}/dummy`
      );
    });

    test("returns the correct headers", async () => {
      const [results] =
        await trueLayerDataApi.get<DataAPIDummyGetSuccessReturn>("/dummy");

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
      const handleUnauthenticatedError = jest.spyOn(
        utils,
        "handleUnauthenticatedError"
      );

      const expectedErrorResponse: DataAPIErrorResponse = {
        error_description: "The token expired at '2020-12-07 12:34:56Z'",
        error: "invalid_token"
      };

      await expect(
        trueLayerDataApi.get("/dummy", {
          headers: {
            "mock-return-data-dummy": 401
          }
        })
      ).rejects.toEqual(expectedErrorResponse);
      expect(handleUnauthenticatedError).toHaveBeenCalled();
    });

    test("non-401 prints an error to the console and returns a rejected promise", async () => {
      const consoleError = jest.spyOn(console, "error");

      const expectedErrorResponse: DataAPIErrorResponse = {
        error_description: "Access to a specific resource has been denied.",
        error: "access_denied",
        error_details: {}
      };

      await expect(
        trueLayerDataApi.get("/dummy", {
          headers: {
            "mock-return-data-dummy": 403
          }
        })
      ).rejects.toEqual(expectedErrorResponse);
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenCalledWith(
        "The following error response was returned from the TrueLayer Data API: ",
        expectedErrorResponse
      );
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
      "/dummy"
    );

    expect(results.requestHeaders).toHaveProperty("test", "header");
    expect(results.requestHeaders).toHaveProperty(
      "authorization",
      "Bearer test-token"
    );
  });
});
