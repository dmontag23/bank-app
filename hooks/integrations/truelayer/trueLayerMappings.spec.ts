import {
  mapTrueLayerCategoryToInternalCategory,
  mapTrueLayerTransactionToInternalTransaction
} from "./trueLayerMappings";

import {TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS} from "../../../tests/mocks/trueLayer/dataAPI/data/cardData";
import {TransactionCategory} from "../../../types/transaction";

describe("mapTrueLayerCategoryToInternalCategory", () => {
  const categoryData = [
    {
      categoryList: ["Bills and Utilities"],
      expectedTransCategory: TransactionCategory.BILLS
    },
    {
      categoryList: ["Food & Dining"],
      expectedTransCategory: TransactionCategory.EATING_OUT
    },
    {
      categoryList: ["Shopping", "Test"],
      expectedTransCategory: TransactionCategory.ENTERTAINMENT
    },
    {
      categoryList: ["I don't know what this is", "Shopping"],
      expectedTransCategory: TransactionCategory.UNKNOWN
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
      TransactionCategory.BILLS
    );
    expect(result).toEqual({
      id: "truelayer-a15d8156569ba848d84c07c34d291bca",
      name: "PAY OFF CREDIT CARD BILL",
      description: "Bills and Utilities",
      amount: 192.52,
      category: TransactionCategory.BILLS
    });
  });
});
