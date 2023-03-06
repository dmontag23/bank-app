import {rest} from "msw";

import {trueLayerDataApi} from "../../axiosConfig";
import config from "../../config.json";
import {
  ConnectTokenPostRequest,
  ConnectTokenPostResponse
} from "../../types/trueLayer/authAPI/auth";
import {AuthAPIErrorResponse} from "../../types/trueLayer/authAPI/serverResponse";
import {server} from "../mocks/server";

describe("authentication flow", () => {
  test("correctly gets an authorized user an access token if they get a 401 response", async () => {
    await expect(trueLayerDataApi.get("/dummy/resource")).rejects.toEqual({
      error: "invalid_token"
    });
    const [results] = await trueLayerDataApi.get("/dummy/resource");
    expect(results.requestHeaders).toHaveProperty(
      "authorization",
      "Bearer good-access-token"
    );
  });

  test("returns an error if the connect/token endpoint fails", async () => {
    const expectedError: AuthAPIErrorResponse = {error: "invalid_grant"};
    server.use(
      rest.post<
        ConnectTokenPostRequest,
        never,
        ConnectTokenPostResponse | AuthAPIErrorResponse
      >(
        `${config.integrations.trueLayer.sandboxAuthUrl}/connect/token`,
        async (_, res, ctx) => res(ctx.status(400), ctx.json(expectedError))
      )
    );

    try {
      await trueLayerDataApi.get("/dummy/resource");
    } catch (error: any) {
      expect(error.response.data).toEqual(expectedError);
    }

    server.resetHandlers();
  });
});
