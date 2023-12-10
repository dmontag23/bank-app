import {describe, expect, test} from "@jest/globals";

import {mapStarlingTransactionToInternalTransaction} from "./starlingMappings";

import {STARLING_FEED_ITEM_1} from "../../../mock-server/starling/data/feedData";
import {SpendingCategory} from "../../../types/starling/feedItems";
import {Category, Source} from "../../../types/transaction";

describe("mapStarlingTransactionToInternalTransaction", () => {
  // TODO: maybe all tests for all categories here?
  const categoryData = [
    {
      transaction: {
        ...STARLING_FEED_ITEM_1,
        spendingCategory: SpendingCategory.COFFEE
      },
      expectedTransCategory: Category.COFFEE
    },
    {
      transaction: {
        ...STARLING_FEED_ITEM_1,
        spendingCategory: SpendingCategory.NONE
      },
      expectedTransCategory: Category.UNKNOWN
    },
    {
      transaction: {
        ...STARLING_FEED_ITEM_1,
        spendingCategory: SpendingCategory.PERSONAL
      },
      expectedTransCategory: Category.HOME
    },
    {
      transaction: {
        ...STARLING_FEED_ITEM_1,
        // the typecast below is to ensure that any unexpected string, i.e.
        // any string that is not a spending category, gets classified as "unknown"
        // without getting type errors in mapStarlingTransactionToInternalTransaction
        spendingCategory: "I do not know what this is" as SpendingCategory
      },
      expectedTransCategory: Category.UNKNOWN
    }
  ];
  test.each(categoryData)(
    `correctly maps transactions`,
    ({transaction, expectedTransCategory}) => {
      const result = mapStarlingTransactionToInternalTransaction(transaction);

      expect(result).toEqual({
        id: transaction.feedItemUid,
        name: transaction.counterPartyName,
        description: transaction.spendingCategory,
        amount: transaction.amount.minorUnits / 100,
        category: expectedTransCategory,
        timestamp: new Date(transaction.transactionTime),
        source: Source.STARLING
      });
    }
  );
});
