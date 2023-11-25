import express, {Request} from "express";

import {filterTransactionsByTimestamp} from "./utils";

import {TRUELAYER_MASTERCARD, TRUELAYER_VISA} from "../data/cardData";
import {
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_ENTERTAINMENT_TRANSACTION_MARCH_MINIMUM_FIELDS,
  TRUELAYER_ENTERTAINMENT_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
} from "../data/cardTransactionData";
import {ERROR_429_RESPONSE} from "../data/serverResponseData";

const truelayerDataRouter = express.Router();

truelayerDataRouter.get("/v1/cards", (req, res) =>
  res.status(200).json({
    results: [TRUELAYER_MASTERCARD, TRUELAYER_VISA],
    status: "Succeeded"
  })
);

truelayerDataRouter.get(
  "/v1/cards/:accountId/transactions",
  (
    req: Request<{accountId: string}, any, any, {from: string; to: string}>,
    res
  ) => {
    switch (req.headers["mock-return-card-transactions"]) {
      case "429":
        res.status(429).json(ERROR_429_RESPONSE);
        break;
      default:
        if (req.params.accountId === "mastercard-1")
          res.status(200).json({
            results: filterTransactionsByTimestamp(req, [
              TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
              TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
            ]),
            status: "Succeeded"
          });
        else
          res.status(200).json({
            results: filterTransactionsByTimestamp(req, [
              TRUELAYER_ENTERTAINMENT_TRANSACTION_MINIMUM_FIELDS
            ]),
            status: "Succeeded"
          });
    }
  }
);

truelayerDataRouter.get(
  "/v1/cards/:accountId/transactions/pending",
  (
    req: Request<{accountId: string}, any, any, {from: string; to: string}>,
    res
  ) => {
    switch (req.headers["mock-return-card-transactions"]) {
      default:
        if (req.params.accountId === "mastercard-1")
          res.status(200).json({
            results: [
              TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS
            ],
            status: "Succeeded"
          });
        else
          res.status(200).json({
            results: [TRUELAYER_ENTERTAINMENT_TRANSACTION_MARCH_MINIMUM_FIELDS],
            status: "Succeeded"
          });
    }
  }
);

export default truelayerDataRouter;
