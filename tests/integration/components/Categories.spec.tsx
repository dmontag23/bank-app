import React from "react";
import {PanGesture} from "react-native-gesture-handler";
import nock from "nock";
import {
  fireGestureHandler,
  getByGestureTestId
} from "react-native-gesture-handler/jest-utils";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import {NavigationContainer} from "@react-navigation/native";

import LoggedInScreens from "../../../components/LoggedInScreens";
import config from "../../../config.json";
import {TRUELAYER_MASTERCARD} from "../../../mock-server/truelayer/data/cardData";
import {TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS} from "../../../mock-server/truelayer/data/cardTransactionData";

describe("Categories", () => {
  test("can add a category", async () => {
    nock(config.integrations.trueLayer.sandboxDataUrl)
      .get("/v1/cards")
      .reply(200, {
        results: [TRUELAYER_MASTERCARD],
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
      .reply(200, {
        results: [TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS],
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions/pending"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions\/pending/)
      .reply(200, {
        results: [],
        status: "Succeeded"
      });

    render(
      <NavigationContainer>
        <LoggedInScreens />
      </NavigationContainer>
    );

    // check the budgets scene is rendered by default
    await waitFor(() =>
      expect(screen.getByText("Please select a budget")).toBeVisible()
    );

    // navigate to the settings screen
    // TODO: investigate why fireEvent.press does not work here
    fireEvent(screen.getByRole("button", {name: "Settings"}), "click");

    // open the add category modal
    const addCategoryButton = screen.getByText("Add category");
    expect(addCategoryButton).toBeVisible();
    fireEvent.press(addCategoryButton);
    await waitFor(() => expect(screen.getByText("Save")).toBeVisible());
    const saveButton = screen.getByText("Save");
    expect(screen.getAllByText("Add category")).toHaveLength(2);

    // enter the category name
    const categoryNameInput = screen.getByLabelText("Category name");
    expect(categoryNameInput).toBeVisible();
    fireEvent.changeText(categoryNameInput, "Bf thangs");

    const iconNameInput = screen.getByLabelText("Search for an icon");
    expect(iconNameInput).toBeVisible();
    fireEvent.changeText(iconNameInput, "  FiRe  ");

    // press icon
    const fireIcon = screen.getByText("fire");
    expect(fireIcon).toBeVisible();
    fireEvent.press(fireIcon);

    // set the color of the icon background
    fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
      {translationX: 0, translationY: 0},
      {translationX: -50, translationY: -50}
    ]);
    const sliders = screen.getAllByLabelText("slider");
    const saturationSlider = sliders[0];
    const lightnessSlider = sliders[1];

    // set the saturation
    expect(saturationSlider).toBeVisible();
    fireEvent(saturationSlider, "onValueChange", 80);

    // set the lightness
    expect(lightnessSlider).toBeVisible();
    fireEvent(lightnessSlider, "onValueChange", 60);

    // save the category
    await waitFor(() => jest.runAllTimers());
    act(() => fireEvent.press(saveButton));
    await waitFor(() => expect(saveButton).not.toBeOnTheScreen());

    // navigate to the transactions screen
    // TODO: investigate why fireEvent.press does not work here
    fireEvent(screen.getByRole("button", {name: "Transactions"}), "click");

    await waitFor(() =>
      expect(
        screen.getByText(
          TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS.description
        )
      ).toBeVisible()
    );

    // click on the transaction
    fireEvent.press(
      screen.getByText(
        TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS.description
      )
    );
    await waitFor(() =>
      expect(screen.getByText("Select a category")).toBeVisible()
    );

    // check that the text and icon have been saved correctly
    expect(screen.getByText("Bf thangs")).toBeVisible();
    const icon = within(
      screen.getByTestId("categoryListScrollView")
    ).getByTestId("category-avatar");
    expect(icon).toHaveStyle({backgroundColor: "hsl(225, 80%, 60%)"});
    expect(icon.children[0]).toHaveProp("source", "fire");
  });
});
