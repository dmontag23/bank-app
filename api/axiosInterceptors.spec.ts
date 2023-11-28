import {AxiosHeaders} from "axios";
import {describe, expect, jest, test} from "@jest/globals";

import {
  handleApiRequest,
  handleTrueLayerAuthAPIResponse,
  handleTrueLayerDataApiResponse
} from "./axiosInterceptors";
import {getTokenFromStorage} from "./utils";

jest.mock("./utils");

describe("handleApiRequest", () => {
  test("adds a token to the headers", async () => {
    (
      getTokenFromStorage as jest.MockedFunction<typeof getTokenFromStorage>
    ).mockResolvedValueOnce("mock-auth-token");

    const response = await handleApiRequest("mock-auth-token")({
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

describe("handleTrueLayerAuthAPIResponse", () => {
  const BASE_AXIOS_RESPONSE_CONFIG = {
    data: "",
    status: 200,
    statusText: "Succeeded",
    headers: new AxiosHeaders(),
    config: {headers: new AxiosHeaders()}
  };

  test("response interceptor returns destructured data", () => {
    const authApiResponse = handleTrueLayerAuthAPIResponse({
      ...BASE_AXIOS_RESPONSE_CONFIG,
      data: "Response data"
    });

    expect(authApiResponse).toEqual("Response data");
  });
});

describe("handleTruelayerDataAPIResponse", () => {
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
