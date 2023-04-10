import {by, element, expect} from "detox";

describe("Transactions page", () => {
  beforeEach(async () => {
    // Note: Tap does not currently work on android API 33.
    // See https://github.com/wix/Detox/issues/3762
    await element(by.id("bottomNavigationTransactions")).tap();
  });
  it("should show all transactions text", async () => {
    await expect(element(by.text("All transactions"))).toBeVisible();
  });
});
