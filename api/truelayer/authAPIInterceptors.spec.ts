import {AxiosHeaders} from "axios";
import {describe, expect, test} from "@jest/globals";

import {handleTrueLayerAuthAPIResponse} from "./authAPIInterceptors";

describe("Truelayer auth api interceptors", () => {
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
