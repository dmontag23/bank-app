import {by, element, expect} from "detox";
import {beforeEach, describe, it} from "@jest/globals";

import Config from "../../../config.json";
import {logIn} from "../utils/utils";

describe("Truelayer auth screens without previous token", () => {
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
      url: `${Config.URI}${Config.TRUELAYER_CALLBACK_ENDPOINT}`
    });
    await expect(element(by.text("An error has occurred"))).toBeVisible();
    await expect(element(by.text("The error is unknown"))).toBeVisible();
    await expect(element(by.text("Try again"))).toBeVisible();
    await expect(element(by.text("Return to home screen"))).toBeVisible();
  });

  it("should display error from Truelayer auth page and allow user to try connecting again", async () => {
    await device.launchApp({
      newInstance: true,
      url: `${Config.URI}${Config.TRUELAYER_CALLBACK_ENDPOINT}?error=access_denied`
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

  it("should allow user to return to the home screen on error", async () => {
    await device.launchApp({
      newInstance: true,
      url: `${Config.URI}${Config.TRUELAYER_CALLBACK_ENDPOINT}?error=access_denied`
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
      url: `${Config.URI}${Config.TRUELAYER_CALLBACK_ENDPOINT}?code=truelayer-dummy-code&scope=accounts`
    });
    await expect(element(by.text("Please select a budget"))).toBeVisible();
  });
});

describe("Truelayer auth screens with previous token", () => {
  beforeEach(async () => {
    await logIn();
  });

  it("should allow the user to return to the app after receiving a truelayer error", async () => {
    await device.launchApp({
      newInstance: true,
      url: `${Config.URI}${Config.TRUELAYER_CALLBACK_ENDPOINT}?error=access_denied`
    });
    await expect(element(by.text("An error has occurred"))).toBeVisible();
    await expect(
      element(
        by.text("Truelayer returned the following error code: access_denied")
      )
    ).toBeVisible();
    const returnToHomeScreenButton = element(by.text("Return to home screen"));
    await expect(returnToHomeScreenButton).toBeVisible();

    await returnToHomeScreenButton.tap();

    await expect(element(by.text("Please select a budget"))).toBeVisible();
  });

  it("should allow the user to retry auth after receiving an unknown error", async () => {
    await device.launchApp({
      newInstance: true,
      url: `${Config.URI}${Config.TRUELAYER_CALLBACK_ENDPOINT}`
    });
    await expect(element(by.text("An error has occurred"))).toBeVisible();
    await expect(element(by.text("The error is unknown"))).toBeVisible();
    const tryAgainButton = element(by.text("Try again"));
    await expect(tryAgainButton).toBeVisible();

    await tryAgainButton.tap();
    // tapping the button brings up the Truelayer web page
    // as these tests should be independent of any third party provider
    // nothing will be asserted on this page
  });

  it("should log in user upon getting correct token", async () => {
    await device.launchApp({
      newInstance: true,
      url: `${Config.URI}${Config.TRUELAYER_CALLBACK_ENDPOINT}?code=another-access-code&scope=accounts`
    });
    await expect(element(by.text("Please select a budget"))).toBeVisible();
  });
});
