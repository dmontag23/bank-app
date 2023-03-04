import {rest} from "msw";

import {
  CARD_TRANSACTION_ALL_FIELDS,
  CARD_TRANSACTION_REQUIRED_FIELDS
} from "./data/cardData";
import {ERROR_429_RESPONSE} from "./data/serverResponseData";

import config from "../../../../config.json";
import {CardTransaction} from "../../../../types/trueLayer/dataAPI/cards";
import {
  DataAPIErrorResponse,
  DataAPISuccessResponse
} from "../../../../types/trueLayer/dataAPI/serverResponse";

const BASE_URL = config.integrations.trueLayer.sandboxDataUrl;

// dummy handler
const dummyHandlers = [
  rest.get<
    null,
    {code: string},
    | DataAPISuccessResponse<{
        requestHeaders: Record<string, string>;
        url: URL;
      }>
    | DataAPIErrorResponse
  >(`${BASE_URL}/dummy/:code`, async (req, res, ctx) => {
    switch (req.params.code) {
      case "200":
        return res(
          ctx.status(200),
          ctx.json({
            results: [{requestHeaders: req.headers.all(), url: req.url}],
            status: "Succeeded"
          })
        );
      case "401":
        return res(
          ctx.status(401),
          ctx.json({
            error_description: "The token expired at '2020-12-07 12:34:56Z'",
            error: "invalid_token"
          })
        );
      case "403":
        return res(
          ctx.status(403),
          ctx.json({
            error_description: "Access to a specific resource has been denied.",
            error: "access_denied",
            error_details: {}
          })
        );
      case "network-error":
        return res.networkError("Failed to connect");
    }
  })
];

// transaction handlers
const transactionHandlers = [
  rest.get<
    null,
    {accountId: string},
    DataAPISuccessResponse<CardTransaction> | DataAPIErrorResponse
  >(`${BASE_URL}/data/v1/cards/:accountId/transactions`, (req, res, ctx) => {
    switch (req.params.accountId) {
      case "200":
        return res(
          ctx.status(200),
          ctx.json({
            results: [
              CARD_TRANSACTION_ALL_FIELDS,
              CARD_TRANSACTION_REQUIRED_FIELDS
            ],
            status: "Succeeded"
          })
        );
      case "429":
        return res(ctx.status(429), ctx.json(ERROR_429_RESPONSE));
    }
  })
];

export const handlers = [...dummyHandlers, ...transactionHandlers];
