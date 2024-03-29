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
    const date = PAY_BILL_CARD_TRANSACTION.timestamp.toDateString().slice(4);
    const time = PAY_BILL_CARD_TRANSACTION.timestamp.toLocaleTimeString(
      "en-GB",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }
    );

    await expect(
      element(by.text(`${date} at ${time}  -  Savings`))
    ).toBeVisible();
  });

  it("can refetch transactions", async () => {
    // get the first transaction on the list
    const firstTrx = element(by.text("PAY OFF CREDIT CARD BILL"));
    await expect(firstTrx).toBeVisible();
    // pull to refresh
    await firstTrx.swipe("down");

    // TODO: Add an assertion here that some new transactions are now visible after loading
    // This will require the ability to add and remove transactions
    // from the mock server, possible via an api that the mock server
    // exposes
  });
});
