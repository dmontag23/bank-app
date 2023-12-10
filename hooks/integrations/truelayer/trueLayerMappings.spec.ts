import {describe, expect, test} from "@jest/globals";

import {mapTrueLayerTransactionToInternalTransaction} from "./trueLayerMappings";

import {TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS} from "../../../mock-server/trueLayer/data/cardTransactionData";
import {Category, Source} from "../../../types/transaction";
import {TruelayerTransactionClassification} from "../../../types/trueLayer/dataAPI/cards";

describe("mapTrueLayerTransactionToInternalTransaction", () => {
  // TODO: maybe all tests for all categories here?
  const categoryData = [
    {
      transaction: {
        ...TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
        transaction_classification: [
          TruelayerTransactionClassification.BILLS_AND_UTILITIES
        ]
      },
      expectedTransCategory: Category.BILLS
    },
    {
      transaction: {
        ...TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
        transaction_classification: [
          TruelayerTransactionClassification.FOOD_AND_DINING
        ]
      },
      expectedTransCategory: Category.EATING_OUT
    },
    {
      transaction: {
        ...TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
        transaction_classification: [
          TruelayerTransactionClassification.SHOPPING
        ]
      },
      expectedTransCategory: Category.SHOPPING
    },
    {
      transaction: {
        ...TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
        transaction_classification: [
          TruelayerTransactionClassification.ENTERTAINMENT,
          "Movies & DVDs"
        ]
      },
      expectedTransCategory: Category.ENTERTAINMENT
    },
    {
      transaction: {
        ...TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
        transaction_classification: [
          "I don't know what this is",
          Category.SHOPPING
        ]
      },
      expectedTransCategory: Category.UNKNOWN
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
