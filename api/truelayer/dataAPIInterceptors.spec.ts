import {AxiosHeaders} from "axios";
import {describe, expect, jest, test} from "@jest/globals";

import {
  handleTrueLayerDataApiRequest,
  handleTrueLayerDataApiResponse
} from "./dataAPIInterceptors";
import {getTokenFromStorage} from "./truelayerAPIUtils";

jest.mock("./truelayerAPIUtils", () => ({
  handleTruelayerError: jest.fn(),
  getTokenFromStorage: jest.fn()
}));

describe("TrueLayer data API interceptors", () => {
  test("request interceptor adds a token to the headers", async () => {
    (
      getTokenFromStorage as jest.MockedFunction<typeof getTokenFromStorage>
    ).mockImplementation(async () => "mock-auth-token");

    const response = await handleTrueLayerDataApiRequest({
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
  });

  test("response interceptor returns destructured results string data", () => {
    const dataApiResponse = handleTrueLayerDataApiResponse<string>({
      status: 200,
      statusText: "Succeeded",
      headers: new AxiosHeaders(),
      config: {headers: new AxiosHeaders()},
      data: {results: ["Response data"], status: "Succeeded"}
    });

    expect(dataApiResponse).toEqual(["Response data"]);
  });
});
