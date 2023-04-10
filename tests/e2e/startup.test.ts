import {by, element, expect} from "detox";

describe("On app startup", () => {
  it("the budget page is selected", async () => {
    await expect(element(by.text("Bills"))).toBeVisible();
  });
});
