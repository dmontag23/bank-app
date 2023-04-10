import {by, element, expect} from "detox";

describe("Budget page", () => {
  beforeEach(async () => {
    // Note: Tap does not currently work on android API 33.
    // See https://github.com/wix/Detox/issues/3762
    await element(by.id("bottomNavigationBudgets")).tap();
  });

  it("should show correct elements for a budget item", async () => {
    await expect(element(by.text("Bills"))).toBeVisible();
    await expect(element(by.text("PAY OFF CREDIT CARD BILL"))).toBeVisible();
  });

  it("should swipe to next budget item", async () => {
    await element(by.text("Bills")).swipe("left");
    await expect(element(by.text("Fun"))).toBeVisible();
    await expect(element(by.text("CHIPOTLE AIRPORT BLVD"))).toBeVisible();
  });
});
