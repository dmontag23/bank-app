import express from "express";

import {
  CARD_TRANSACTION_ALL_FIELDS,
  CARD_TRANSACTION_REQUIRED_FIELDS
} from "../trueLayer/dataAPI/data/cardData";
import {ERROR_429_RESPONSE} from "../trueLayer/dataAPI/data/serverResponseData";

const truelayerDataRouter = express.Router();

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
