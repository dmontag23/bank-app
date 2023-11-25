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

  it("should add a new category", async () => {
    // open the add category modal
    const addCategoryButton = element(by.text("Add category"));
    await expect(addCategoryButton).toBeVisible();
    await addCategoryButton.tap();

    // enter category name
    const categoryNameInput = element(by.label("Category name")).atIndex(0);
    await expect(categoryNameInput).toBeVisible();
    await categoryNameInput.typeText("Halloween");

    // search for an icon
    const searchInput = element(by.label("Search for an icon")).atIndex(0);
    await expect(searchInput).toBeVisible();
    await searchInput.typeText("   KiN ");

    // scroll to find the pumpkin icon and tap it
    const iconScrollView = element(by.label("Icon list"));
    await expect(iconScrollView).toBeVisible();
    await waitFor(element(by.text("pumpkin")))
      .toBeVisible()
      .whileElement(by.label("Icon list"))
      .scroll(400, "down");
    await element(by.text("pumpkin")).tap();

    // select the green color for the pumpkin
    const hueSelector = element(by.label("circle")).atIndex(2);
    await expect(hueSelector).toBeVisible();
    await hueSelector.swipe("down");

    // adjust the saturation slider
    const saturationSlider = element(by.label("slider")).atIndex(0);
    await expect(saturationSlider).toBeVisible();
    // adjustSliderToPosition should be used here but it does not trigger onValueChange
    // see https://github.com/callstack/react-native-slider/issues/351
    await saturationSlider.swipe("left", "fast", 0.2, 0.9);

    // adjust the lightness slider
    const lightnessSlider = element(by.label("slider")).atIndex(1);
    await expect(lightnessSlider).toBeVisible();
    // adjustSliderToPosition should be used here but it does not trigger onValueChange
    // see https://github.com/callstack/react-native-slider/issues/351
    await lightnessSlider.swipe("left", "fast", 0.1, 0.5);

    // save the category
    await element(by.text("Save")).tap();

    // navigate to the transactions screen
    await element(by.id("transactionsBottomNavButton")).tap();

    // click the chai pot transaction and check the halloween category exists
    await element(by.text("CHAI POT YUM")).tap();
    await waitFor(element(by.text("Halloween")))
      .toBeVisible()
      .whileElement(by.id("categoryListScrollView"))
      .scroll(400, "down");
  });

  it("should render all elements", async () => {
    await expect(element(by.text("Settings")).atIndex(0)).toBeVisible();
    await expect(element(by.text("Add category"))).toBeVisible();
    await expect(element(by.text("Reconnect to Truelayer"))).toBeVisible();
    await expect(element(by.text("Show Errors"))).toBeVisible();
  });

  it("should allow the user to reconnect to Truelayer", async () => {
    const reconnectButton = element(by.text("Reconnect to Truelayer"));
    await expect(reconnectButton).toBeVisible();

    await reconnectButton.tap();
    // tapping the button brings up the Truelayer web page
    // as these tests should be independent of any third party provider
    // nothing will be asserted on this page
  });

  it("should display all app errors", async () => {
    const showErrorsButton = element(by.text("Show Errors"));
    await expect(showErrorsButton).toBeVisible();

    await showErrorsButton.tap();

    await expect(element(by.text("Errors"))).toBeVisible();
  });
});
