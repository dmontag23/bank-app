import express from "express";

import {
  CARD_TRANSACTION_ALL_FIELDS,
  CARD_TRANSACTION_REQUIRED_FIELDS
} from "../trueLayer/dataAPI/data/cardData";
import {ERROR_429_RESPONSE} from "../trueLayer/dataAPI/data/serverResponseData";

const truelayerDataRouter = express.Router();

truelayerDataRouter.get("/dummy", (req, res) => {
  const successResponse = {
    results: [
      {
        requestHeaders: req.headers,
        url: `${req.protocol}://${req.hostname}${req.originalUrl}`
      }
    ],
    status: "Succeeded"
  };
  if (req.headers.authorization === "Bearer good-access-token") {
    return res.status(200).json(successResponse);
  }
  switch (req.headers["mock-return-data-dummy"]) {
    case "401":
      res.status(401).json({
        error_description: "The token expired at '2020-12-07 12:34:56Z'",
        error: "invalid_token"
      });
      break;
    case "403":
      res.status(403).json({
        error_description: "Access to a specific resource has been denied.",
        error: "access_denied",
        error_details: {}
      });
      break;
    default:
      res.status(200).json(successResponse);
  }
});

truelayerDataRouter.get("/v1/cards/:accountId/transactions", (req, res) => {
  switch (req.headers["mock-return-card-transactions"]) {
    case "429":
      res.status(429).json(ERROR_429_RESPONSE);
      break;
    default:
      res.status(200).json({
        results: [
          CARD_TRANSACTION_ALL_FIELDS,
          CARD_TRANSACTION_REQUIRED_FIELDS
        ],
        status: "Succeeded"
      });
  }
});

export default truelayerDataRouter;
