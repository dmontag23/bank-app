import {describe, expect, jest, test} from "@jest/globals";
import {renderHook, waitFor} from "@testing-library/react-native";

import usePostTruelayerToken from "./usePostTruelayerToken";

import {trueLayerAuthApi} from "../../../axiosConfig";
import config from "../../../config.json";
import {TanstackQueryTestWrapper} from "../../../tests/mocks/utils";
import {
  ConnectTokenPostRequest,
  ConnectTokenPostResponse,
  GrantType
} from "../../../types/trueLayer/authAPI/auth";
import {AuthAPIErrorResponse} from "../../../types/trueLayer/authAPI/serverResponse";

jest.mock("../../../axiosConfig");

describe("usePostTruelayerToken", () => {
  test("returns correct data on a successful request", async () => {
    const mockResponseData: ConnectTokenPostResponse = {
      access_token: "",
      expires_in: 0,
      refresh_token: "",
      token_type: "",
      scope: "accounts"
    };
    (
      trueLayerAuthApi.post as jest.MockedFunction<
        typeof trueLayerAuthApi.post<
          ConnectTokenPostRequest,
          ConnectTokenPostResponse
        >
      >
    ).mockImplementation(async () => mockResponseData);

    const {result} = renderHook(() => usePostTruelayerToken(), {
      wrapper: TanstackQueryTestWrapper
    });
    result.current.mutate("dummy-code");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResponseData);
    expect(trueLayerAuthApi.post).toBeCalledTimes(1);
    expect(trueLayerAuthApi.post).toBeCalledWith("connect/token", {
      grant_type: GrantType.AUTHORIZATION_CODE,
      client_id: config.integrations.trueLayer.clientId,
      client_secret: config.integrations.trueLayer.clientSecret,
      redirect_uri: `${config.uri}${config.integrations.trueLayer.callbackEndpoint}`,
      code: "dummy-code"
    });
    expect(result.current.error).toBeNull();
  });

  test("returns an error message on a 400 status code response", async () => {
    const error: AuthAPIErrorResponse = {
      error: "invalid_grant"
    };
    (
      trueLayerAuthApi.post as jest.MockedFunction<
        typeof trueLayerAuthApi.post<
          ConnectTokenPostRequest,
          ConnectTokenPostResponse
        >
      >
    ).mockImplementation(async () => Promise.reject(error));

    const {result} = renderHook(() => usePostTruelayerToken(), {
      wrapper: TanstackQueryTestWrapper
    });
    result.current.mutate("error-code");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(trueLayerAuthApi.post).toBeCalledTimes(1);
    expect(trueLayerAuthApi.post).toBeCalledWith("connect/token", {
      grant_type: GrantType.AUTHORIZATION_CODE,
      client_id: config.integrations.trueLayer.clientId,
      client_secret: config.integrations.trueLayer.clientSecret,
      redirect_uri: `${config.uri}${config.integrations.trueLayer.callbackEndpoint}`,
      code: "error-code"
    });
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(error);
  });
});