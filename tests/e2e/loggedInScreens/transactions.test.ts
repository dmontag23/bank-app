import {by, element, expect} from "detox";
import {beforeEach, describe, it} from "@jest/globals";

import {STARLING_FEED_ITEM_1} from "../../../mock-server/starling/data/feedData";
import {
  EATING_OUT_CARD_TRANSACTION,
  PAY_BILL_CARD_TRANSACTION
} from "../../mocks/data/transactions";
import {logIn} from "../utils/utils";

describe("Transactions page", () => {
  beforeEach(async () => {
    await logIn();
    // Note: Tap does not currently work on android API 33.
    // See https://github.com/wix/Detox/issues/3762
    await element(by.id("transactionsBottomNavButton")).tap();
  });

  it("should show all transactions", async () => {
    await expect(element(by.text("Transactions")).atIndex(0)).toBeVisible();

    // starling transactions
    await expect(
      element(by.text(STARLING_FEED_ITEM_1.counterPartyName))
    ).toBeVisible();

    // truelayer transactions
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
    await waitFor(element(by.text("Savings")))
      .toBeVisible()
      .whileElement(by.id("categoryListScrollView"))
      .scroll(400, "down");
    await element(by.text("Savings")).tap();
    await expect(modalTitle).not.toBeVisible();
    await expect(
      element(by.text("1 Jan 2023 at 00:00  -  Savings"))
    ).toBeVisible();
  });

  // TODO: Add e2e test to test refetching of transactions.
  // This will require the ability to add and remove transactions
  // from the mock server, possible via an api that the mock server
  // exposes
});
