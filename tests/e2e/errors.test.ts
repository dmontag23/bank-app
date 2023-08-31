import {by, element, expect} from "detox";
import {beforeEach, describe, it} from "@jest/globals";

import {logIn} from "./utils/utils";

describe("Error modal", () => {
  beforeEach(async () => {
    await logIn();
    // Note: Tap does not currently work on android API 33.
    // See https://github.com/wix/Detox/issues/3762
    await element(by.id("settingsBottomNavButton")).tap();
  });

  it("should render all elements", async () => {
    await element(by.text("Show Errors")).tap();

    await expect(element(by.text("Errors"))).toBeVisible();
    await expect(
      element(by.text("No detected errors in the app 🥳"))
    ).toBeVisible();
  });

  it("should close successfully using close button", async () => {
    await element(by.text("Show Errors")).tap();

    const modalTitle = element(by.text("Errors"));
    await expect(modalTitle).toBeVisible();

    const closeButton = element(by.text("Close"));
    await expect(closeButton).toBeVisible();

    await closeButton.tap();

    await expect(modalTitle).not.toExist();
  });
});

// TODO: See if it is possible to write detox e2e tests for error conditions
// It is not trivial - it may require somehow mocking modules following https://wix.github.io/Detox/docs/guide/mocking
// but note that these mocks would then apply to all Detox tests, so it is not obvious how to do dynamic mocking.
// Another option could be to use the launch args of the app to launch the app in "error mode", but this would
// likely mean modifying the app code just to be able to test it, which isn't nice.
// Also worth following https://github.com/wix/Detox/issues/3986
