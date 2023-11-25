import {Request} from "express";

import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";

export const filterTransactionsByTimestamp = (
  req: Request<{accountId: string}, any, any, {from: string; to: string}>,
  transactions: CardTransaction[]
) =>
  transactions.filter(transaction => {
    if (!req.query.from || !req.query.to) return true;
    const trxTimestamp = new Date(transaction.timestamp);
    const from = new Date(req.query.from);
    const to = new Date(req.query.to);
    return from <= trxTimestamp && trxTimestamp <= to;
  });
