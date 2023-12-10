import express, {Request} from "express";

import {STARLING_ACCOUNT_1} from "../data/accountData";
import {STARLING_FEED_ITEM_1, STARLING_FEED_ITEM_2} from "../data/feedData";

const starlingRouter = express.Router();

starlingRouter.get("/v2/accounts", (req, res) =>
  res.status(200).json({accounts: [STARLING_ACCOUNT_1]})
);

starlingRouter.get(
  "/v2/feed/account/:accountId/category/:categoryId/transactions-between",
  (
    req: Request<
      {accountId: string; categoryId: string},
      any,
      any,
      {minTransactionTimestamp: string; maxTransactionTimestamp: string}
    >,
    res
  ) =>
    res.status(200).json({
      feedItems: [STARLING_FEED_ITEM_1, STARLING_FEED_ITEM_2].filter(
        transaction => {
          const trxTime = transaction.transactionTime;
          return (
            req.query.minTransactionTimestamp <= trxTime &&
            trxTime <= req.query.maxTransactionTimestamp
          );
        }
      )
    })
);

export default starlingRouter;
