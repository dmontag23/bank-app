import {describe, expect, test} from "@jest/globals";

import {mapTrueLayerTransactionToInternalTransaction} from "./trueLayerMappings";

import {TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS} from "../../../mock-server/trueLayer/data/cardTransactionData";
import {Source} from "../../../types/transaction";

describe("mapTrueLayerTransactionToInternalTransaction", () => {
  const categoryData = [
    {
      transaction: {
        ...TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
        transaction_classification: ["Bills and Utilities"]
      },
      expectedTransCategory: "Bills"
    },
    {
      transaction: {
        ...TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
        transaction_classification: ["Food & Dining"]
      },
      expectedTransCategory: "Eating out"
    },
    {
      transaction: {
        ...TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
        transaction_classification: ["Shopping"]
      },
      expectedTransCategory: "Shopping"
    },
    {
      transaction: {
        ...TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
        transaction_classification: ["Entertainment", "Movies & DVDs"]
      },
      expectedTransCategory: "Entertainment"
    },
    {
      transaction: {
        ...TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
        transaction_classification: ["I don't know what this is", "Shopping"]
      },
      expectedTransCategory: "Unknown"
    }
  ];
  test.each(categoryData)(
    `correctly maps transactions`,
    ({transaction, expectedTransCategory}) => {
      const result = mapTrueLayerTransactionToInternalTransaction(transaction);

      expect(result).toEqual({
        id: "a15d8156569ba848d84c07c34d291bca",
        name: "PAY OFF CREDIT CARD BILL",
        description: transaction.transaction_classification[0],
        amount: 192.52,
        category: expectedTransCategory,
        timestamp: new Date(
          TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS.timestamp
        ),
        source: Source.TRUELAYER
      });
    }
  );
});
