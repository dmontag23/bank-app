import express, {Request} from "express";

import {filterTransactionsByTimestamp} from "./utils/truelayerDataRouterUtils";

import {
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
} from "../trueLayer/dataAPI/data/cardTransactionData";
import {ERROR_429_RESPONSE} from "../trueLayer/dataAPI/data/serverResponseData";

const truelayerDataRouter = express.Router();

truelayerDataRouter.get(
  "/v1/cards/:accountId/transactions",
  (
    req: Request<{account_id: string}, any, any, {from: string; to: string}>,
    res
  ) => {
    switch (req.headers["mock-return-card-transactions"]) {
      case "429":
        res.status(429).json(ERROR_429_RESPONSE);
        break;
      default:
        res.status(200).json({
          results: filterTransactionsByTimestamp(req, [
            TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
            TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
          ]),
          status: "Succeeded"
        });
    }
  }
);

truelayerDataRouter.get(
  "/v1/cards/:accountId/transactions/pending",
  (
    req: Request<{account_id: string}, any, any, {from: string; to: string}>,
    res
  ) => {
    switch (req.headers["mock-return-card-transactions"]) {
      default:
        res.status(200).json({
          results: [TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS],
          status: "Succeeded"
        });
    }
  }
);

export default truelayerDataRouter;
