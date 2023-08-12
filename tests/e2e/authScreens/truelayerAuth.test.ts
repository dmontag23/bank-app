import {by, element, expect} from "detox";
import {describe, it} from "@jest/globals";

import config from "../../../config.json";

describe("Truelayer auth screens", () => {
  it("should correctly show and press Truelayer connect button", async () => {
    await expect(
      element(by.text("Please connect to the following services"))
    ).toBeVisible();
    const connectToTruelayerButton = element(by.text("Connect to Truelayer"));
    await expect(connectToTruelayerButton).toBeVisible();
    await connectToTruelayerButton.tap();
    // tapping the button brings up the Truelayer web page
    // as these tests should be independent of any third party provider
    // nothing will be asserted on this page
  });

  it("should display unknown error from Truelayer auth page", async () => {
    await device.launchApp({
      newInstance: true,
      url: `${config.uri}/${config.integrations.trueLayer.callbackEndpoint}`
    });
    await expect(element(by.text("An error has occurred"))).toBeVisible();
    await expect(element(by.text("The error is unknown"))).toBeVisible();
    await expect(element(by.text("Try again"))).toBeVisible();
    await expect(element(by.text("Return to home screen"))).toBeVisible();
  });

  it("should display error from Truelayer auth page and allow user to try connecting again", async () => {
    await device.launchApp({
      newInstance: true,
      url: `${config.uri}/${config.integrations.trueLayer.callbackEndpoint}?error=access_denied`
    });
    await expect(element(by.text("An error has occurred"))).toBeVisible();
    await expect(
      element(
        by.text("Truelayer returned the following error code: access_denied")
      )
    ).toBeVisible();
    const tryAgainButton = element(by.text("Try again"));
    await expect(tryAgainButton).toBeVisible();
    await expect(element(by.text("Return to home screen"))).toBeVisible();
    await tryAgainButton.tap();
    // tapping the button brings up the Truelayer web page
    // as these tests should be independent of any third party provider
    // nothing will be asserted on this page
  });

  it("should allow user to return to home screen on error", async () => {
    await device.launchApp({
      newInstance: true,
      url: `${config.uri}/${config.integrations.trueLayer.callbackEndpoint}?error=access_denied`
    });
    await expect(element(by.text("An error has occurred"))).toBeVisible();
    await expect(
      element(
        by.text("Truelayer returned the following error code: access_denied")
      )
    ).toBeVisible();
    await expect(element(by.text("Try again"))).toBeVisible();
    const homeScreenButton = element(by.text("Return to home screen"));
    await expect(homeScreenButton).toBeVisible();
    await homeScreenButton.tap();
    await expect(
      element(by.text("Please connect to the following services"))
    ).toBeVisible();
  });

  it("should log in user upon getting correct token", async () => {
    await device.launchApp({
      newInstance: true,
      url: `${config.uri}/${config.integrations.trueLayer.callbackEndpoint}?code=truelayer-dummy-code&scope=accounts`
    });
    await expect(element(by.text("Please select a budget"))).toBeVisible();
  });
});
