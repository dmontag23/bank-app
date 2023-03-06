import {rest} from "msw";

import config from "../../../../config.json";
import {
  ConnectTokenPostRequest,
  ConnectTokenPostResponse
} from "../../../../types/trueLayer/authAPI/auth";
import {AuthAPIErrorResponse} from "../../../../types/trueLayer/authAPI/serverResponse";

const BASE_URL = config.integrations.trueLayer.sandboxAuthUrl;

export const trueLayerAuthApiHandlers = [
  rest.post<
    ConnectTokenPostRequest,
    never,
    ConnectTokenPostResponse | AuthAPIErrorResponse
  >(`${BASE_URL}/connect/token`, async (_, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json({
        access_token: "good-access-token",
        expires_in: 3600,
        refresh_token: "refresh-token",
        token_type: "Bearer",
        scope: "info"
      })
    )
  ),
  rest.get<
    null,
    {code: string},
    | {
        requestHeaders: Record<string, string>;
        url?: URL;
      }
    | AuthAPIErrorResponse
  >(`${BASE_URL}/dummy/:code`, async (req, res, ctx) => {
    switch (req.params.code) {
      case "200":
        return res(
          ctx.status(200),
          ctx.json({
            requestHeaders: req.headers.all(),
            url: req.url
          })
        );
      case "401":
        return res(
          ctx.status(401),
          ctx.json({
            error: "invalid_grant"
          })
        );
      case "network-error":
        return res.networkError("Failed to connect");
    }
  })
];
