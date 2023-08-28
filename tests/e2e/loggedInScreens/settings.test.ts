import {by, element, expect} from "detox";
import {beforeEach, describe, it} from "@jest/globals";

import {logIn} from "../utils/utils";

describe("Settings page", () => {
  beforeEach(async () => {
    await logIn();
    // Note: Tap does not currently work on android API 33.
    // See https://github.com/wix/Detox/issues/3762
    await element(by.id("settingsBottomNavButton")).tap();
  });

  it("should show settings title", async () => {
    await expect(element(by.text("Settings")).atIndex(0)).toBeVisible();
  });
});
