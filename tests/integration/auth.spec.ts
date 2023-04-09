import {AxiosHeaders} from "axios";

import {handleTrueLayerDataApiError} from "../../api/interceptors";
import {
  createDataAPIRequestInterceptor,
  trueLayerAuthApi
} from "../../axiosConfig";
import {ConnectTokenPostResponse} from "../../types/trueLayer/authAPI/auth";
import {AuthAPIErrorResponse} from "../../types/trueLayer/authAPI/serverResponse";
import {DataAPIErrorResponse} from "../../types/trueLayer/dataAPI/serverResponse";

jest.mock("../../axiosConfig");

describe("authentication flow", () => {
  test("correctly gets an authorized user an access token if they get a 401 response", async () => {
    // setup mocks
    const mockToken = "good-access-token";
    const mockConnectTokenResponse: ConnectTokenPostResponse = {
      access_token: mockToken,
      expires_in: 3600,
      refresh_token: "refresh-token",
      token_type: "Bearer",
      scope: "info"
    };
    const mockTrueLayerAuthApi = trueLayerAuthApi as jest.MockedObject<
      typeof trueLayerAuthApi
    >;
    mockTrueLayerAuthApi.post.mockImplementationOnce(
      async () => mockConnectTokenResponse
    );
    const mockHeaders = {test: "headers"};
    const mockUnauthenticatedResponse: DataAPIErrorResponse = {
      error_description: "The token expired at '2020-12-07 12:34:56Z'",
      error: "invalid_token"
    };

    // assertions
    await expect(
      handleTrueLayerDataApiError({
        config: {
          headers: mockHeaders
        },
        response: {
          data: mockUnauthenticatedResponse,
          status: 401
        }
      })
    ).rejects.toEqual(mockUnauthenticatedResponse);
    expect(createDataAPIRequestInterceptor).toBeCalledTimes(1);
    expect(createDataAPIRequestInterceptor).toBeCalledWith(
      new AxiosHeaders({
        ...mockHeaders,
        Authorization: `Bearer ${mockToken}`
      })
    );
  });

  test("returns an error if the connect/token endpoint fails", async () => {
    // setup mocks
    const authApiError: AuthAPIErrorResponse = {error: "invalid_grant"};
    const mockTrueLayerAuthApi = trueLayerAuthApi as jest.MockedObject<
      typeof trueLayerAuthApi
    >;
    mockTrueLayerAuthApi.post.mockImplementationOnce(async () =>
      Promise.reject({response: {data: authApiError, status: 500}})
    );
    const mockHeaders = {test: "headers"};
    const mockUnauthenticatedResponse: DataAPIErrorResponse = {
      error_description: "The token expired at '2020-12-07 12:34:56Z'",
      error: "invalid_token"
    };

    // assertions
    await expect(
      handleTrueLayerDataApiError({
        config: {
          headers: mockHeaders
        },
        response: {
          data: mockUnauthenticatedResponse,
          status: 401
        }
      })
    ).rejects.toEqual(authApiError);
    expect(createDataAPIRequestInterceptor).not.toBeCalled();
  });
});
