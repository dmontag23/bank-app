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
  >(`${BASE_URL}/connect/token`, async (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json({
        access_token: "access-token",
        expires_in: 3600,
        refresh_token: "refresh-token",
        token_type: "Bearer",
        scope: "info"
      })
    )
  ),
  rest.get(`${BASE_URL}/dummy`, async (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json({
        requestHeaders: req.headers.all(),
        url: req.url
      })
    )
  )
];
