import {trueLayerDataApi} from "../../axiosConfig";
import {AuthAPIErrorResponse} from "../../types/trueLayer/authAPI/serverResponse";

describe("authentication flow", () => {
  type DataSuccessResponse = {
    requestHeaders: Record<string, string>;
    url: URL;
  }[];

  test("correctly gets an authorized user an access token if they get a 401 response", async () => {
    await expect(
      trueLayerDataApi.get("/dummy", {
        headers: {
          "mock-return-data-dummy": 401
        }
      })
    ).rejects.toEqual({
      error_description: "The token expired at '2020-12-07 12:34:56Z'",
      error: "invalid_token"
    });
    const [results] = await trueLayerDataApi.get<DataSuccessResponse>("/dummy");
    expect(results.requestHeaders).toHaveProperty(
      "authorization",
      "Bearer good-access-token"
    );
  });

  test("returns an error if the connect/token endpoint fails", async () => {
    const expectedError: AuthAPIErrorResponse = {error: "invalid_grant"};

    await expect(
      trueLayerDataApi.get("/dummy", {
        headers: {
          "mock-return-data-dummy": 401,
          "mock-return-connect-token": 400
        }
      })
    ).rejects.toEqual(expectedError);
  });
});
