import {by, element, expect} from "detox";
import {beforeEach, describe, it} from "@jest/globals";

describe("Settings page", () => {
  beforeEach(async () => {
    // Note: Tap does not currently work on android API 33.
    // See https://github.com/wix/Detox/issues/3762
    await element(by.id("settingsBottomNavButton")).tap();
  });

  it("should show all settings text", async () => {
    await expect(element(by.text("All settings"))).toBeVisible();
  });
});
