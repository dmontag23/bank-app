import {by, element, expect} from "detox";
import {beforeEach, describe, it} from "@jest/globals";

import {TransactionCategory} from "../../types/transaction";
import {
  EATING_OUT_CARD_TRANSACTION,
  PAY_BILL_CARD_TRANSACTION
} from "../mocks/data/transactions";

describe("Transactions page", () => {
  beforeEach(async () => {
    // Note: Tap does not currently work on android API 33.
    // See https://github.com/wix/Detox/issues/3762
    await element(by.id("transactionsBottomNavButton")).tap();
  });

  it("should show all transactions", async () => {
    await expect(element(by.text("Transactions")).atIndex(0)).toBeVisible();
    await expect(
      element(by.text(EATING_OUT_CARD_TRANSACTION.name))
    ).toBeVisible();
    await expect(
      element(by.text(PAY_BILL_CARD_TRANSACTION.name))
    ).toBeVisible();
  });

  it("should update a transaction category successfully", async () => {
    const billsTransaction = await element(
      by.text(PAY_BILL_CARD_TRANSACTION.name)
    );
    await expect(billsTransaction).toBeVisible();

    // tap the transaction row to bring up the modal
    await billsTransaction.tap();
    const modalTitle = element(by.text("Select a category"));
    await expect(modalTitle).toBeVisible();

    // select a new category from the modal
    await element(by.text("SAVINGS")).tap();
    await expect(modalTitle).not.toBeVisible();
    await expect(element(by.text(TransactionCategory.SAVINGS))).toBeVisible();
  });
});
