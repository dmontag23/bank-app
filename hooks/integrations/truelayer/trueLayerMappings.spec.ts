import {describe, expect, test} from "@jest/globals";

import {
  mapTrueLayerCategoryToInternalCategory,
  mapTrueLayerTransactionToInternalTransaction
} from "./trueLayerMappings";

import {TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS} from "../../../mock-server/trueLayer/data/cardTransactionData";

describe("mapTrueLayerCategoryToInternalCategory", () => {
  const categoryData = [
    {
      categoryList: ["Bills and Utilities"],
      expectedTransCategory: "Bills"
    },
    {
      categoryList: ["Food & Dining"],
      expectedTransCategory: "Eating out"
    },
    {
      categoryList: ["Shopping"],
      expectedTransCategory: "Shopping"
    },
    {
      categoryList: ["Entertainment", "Movies & DVDs"],
      expectedTransCategory: "Entertainment"
    },
    {
      categoryList: ["I don't know what this is", "Shopping"],
      expectedTransCategory: "Unknown"
    }
  ];
  test.each(categoryData)(
    `correctly maps categories`,
    async ({categoryList, expectedTransCategory}) => {
      const result = mapTrueLayerCategoryToInternalCategory(categoryList);

      expect(result).toEqual(expectedTransCategory);
    }
  );
});

describe("mapTrueLayerTransactionToInternalTransaction", () => {
  test("correctly maps a TrueLayer transaction to an internal transaction", async () => {
    const result = mapTrueLayerTransactionToInternalTransaction(
      TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
      "Bills"
    );
    expect(result).toEqual({
      id: "a15d8156569ba848d84c07c34d291bca",
      name: "PAY OFF CREDIT CARD BILL",
      description: "Bills and Utilities",
      amount: 192.52,
      category: "Bills",
      timestamp: new Date(
        TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS.timestamp
      )
    });
  });
});
