import {
  mapTrueLayerTransactionClassificationToInternalCategory,
  mapTrueLayerTransactionToInternalTransaction
} from "./trueLayerMappings";

import {CARD_TRANSACTION_ALL_FIELDS} from "../../../tests/mocks/trueLayer/dataAPI/data/cardData";
import {TransactionCategory} from "../../../types/transaction";

describe("mapTrueLayerTransactionClassificationToInternalCategory", () => {
  const categoryData = [
    {
      categoryList: ["Bills and Utilities"],
      expectedTransCategory: TransactionCategory.BILLS
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
      const result =
        mapTrueLayerTransactionClassificationToInternalCategory(categoryList);

      expect(result).toEqual(expectedTransCategory);
    }
  );
});

describe("mapTrueLayerTransactionToInternalTransaction", () => {
  test("correctly maps a TrueLayer transaction to an internal transaction", async () => {
    const result = mapTrueLayerTransactionToInternalTransaction(
      CARD_TRANSACTION_ALL_FIELDS
    );
    expect(result).toEqual({
      name: "PAY OFF CREDIT CARD BILL",
      description: "Bills & Utilities",
      amount: 192.52,
      category: TransactionCategory.BILLS
    });
  });
});
