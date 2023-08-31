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

  it("should render all elements", async () => {
    await expect(element(by.text("Settings")).atIndex(0)).toBeVisible();
    await expect(element(by.text("Show Errors"))).toBeVisible();
  });

  it("should display all app errors", async () => {
    const showErrorsButton = element(by.text("Show Errors"));
    await expect(showErrorsButton).toBeVisible();

    await showErrorsButton.tap();

    await expect(element(by.text("Errors"))).toBeVisible();
  });
});
