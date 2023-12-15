import React, {ReactNode} from "react";
import WebView from "react-native-webview";
import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor
} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {MaterialBottomTabScreenProps} from "@react-navigation/material-bottom-tabs";
import {
  CompositeScreenProps,
  NavigationContainer,
  useNavigation
} from "@react-navigation/native";
import {StackScreenProps} from "@react-navigation/stack";

import ErrorModal from "../../../components/errors/ErrorModal";
import RootScreens from "../../../components/RootScreens";
import SettingsScreen from "../../../components/Settings/SettingsScreen";
import Config from "../../../config.json";
import {LoggedInTabParamList, RootStackParamList} from "../../../types/screens";

describe("Settings Screen", () => {
  test("renders all items on the homepage", () => {
    const customWrapper = (children: ReactNode) => (
      <NavigationContainer>{children}</NavigationContainer>
    );

    const {result} = renderHook(
      () =>
        useNavigation<
          CompositeScreenProps<
            MaterialBottomTabScreenProps<LoggedInTabParamList, "Settings">,
            StackScreenProps<RootStackParamList>
          >
        >(),
      {customWrapper}
    );

    render(
      <SettingsScreen
        route={{key: "", name: "Settings"}}
        navigation={result.current.navigation}
      />
    );

    expect(screen.getByText("Settings")).toBeVisible();
    expect(screen.getByText("Add category")).toBeVisible();
    expect(screen.getByText("Reconnect to Truelayer")).toBeVisible();
    expect(screen.getByText("Show Errors")).toBeVisible();
  });

  test("can show all app errors", async () => {
    const customWrapper = (children: ReactNode) => (
      <NavigationContainer>{children}</NavigationContainer>
    );

    const {result} = renderHook(
      () =>
        useNavigation<
          CompositeScreenProps<
            MaterialBottomTabScreenProps<LoggedInTabParamList, "Settings">,
            StackScreenProps<RootStackParamList>
          >
        >(),
      {customWrapper}
    );

    render(
      <>
        <SettingsScreen
          route={{key: "", name: "Settings"}}
          navigation={result.current.navigation}
        />
        <ErrorModal />
      </>
    );

    const showErrorsButton = screen.getByText("Show Errors");
    expect(showErrorsButton).toBeVisible();

    fireEvent.press(showErrorsButton);

    await waitFor(() => expect(screen.getByText("Errors")).toBeVisible());
  });

  test("can reconnect to Truelayer", async () => {
    await AsyncStorage.setItem("truelayer-auth-token", "dummy-truelayer-token");

    render(
      <NavigationContainer>
        <RootScreens />
      </NavigationContainer>
    );

    // navigate to the settings screen
    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: "Settings"
        })
      ).toBeVisible()
    );
    const settingsButton = screen.getByRole("button", {
      name: "Settings"
    });
    // TODO: investigate why fireEvent.press does not work here
    fireEvent(settingsButton, "click");

    const getTruelayerButton = screen.getByText("Reconnect to Truelayer");
    expect(getTruelayerButton).toBeVisible();

    fireEvent.press(getTruelayerButton);

    expect(WebView).toBeCalledTimes(1);
    expect(WebView).toBeCalledWith(
      {
        hideKeyboardAccessoryView: true,
        source: {
          uri: Config.TRUELAYER_OAUTH_URL
        }
      },
      {}
    );
  });

  // TODO: Come back and add a test for the error badge
});
