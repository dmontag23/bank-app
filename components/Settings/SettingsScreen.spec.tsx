import React, {ReactNode} from "react";
import {MD3LightTheme} from "react-native-paper";
import {fireEvent, render, renderHook, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import {MaterialBottomTabScreenProps} from "@react-navigation/material-bottom-tabs";
import {
  CompositeScreenProps,
  NavigationContainer,
  useNavigation
} from "@react-navigation/native";
import {StackScreenProps} from "@react-navigation/stack";

import SettingsScreen from "./SettingsScreen";

import ErrorContext from "../../store/error-context";
import {LoggedInTabParamList, RootStackParamList} from "../../types/screens";

describe("SettingsScreen component", () => {
  test("renders all items without badge", () => {
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
    expect(screen.getByText("Reconnect to Truelayer")).toBeVisible();
    expect(screen.getByText("Show Errors")).toBeVisible();
    expect(screen.getByTestId("surface")).toHaveStyle({
      backgroundColor: MD3LightTheme.colors.secondaryContainer
    });
    expect(screen.queryByText("2")).toBeNull();
  });

  test("renders error badge", () => {
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
      <ErrorContext.Provider
        value={{
          errors: [
            {id: "1", error: ""},
            {id: "2", error: ""}
          ],
          addError: () => {},
          removeError: () => {},
          errorModal: {
            isVisible: false,
            showModal: () => {},
            hideModal: () => {}
          }
        }}>
        <SettingsScreen
          route={{key: "", name: "Settings"}}
          navigation={result.current.navigation}
        />
      </ErrorContext.Provider>
    );

    expect(screen.getByText("Show Errors")).toBeVisible();
    expect(screen.getByText("2")).toBeVisible();
  });

  test("can open the error modal", () => {
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

    const mockShowModalFn = jest.fn();

    render(
      <ErrorContext.Provider
        value={{
          errors: [],
          addError: () => {},
          removeError: () => {},
          errorModal: {
            isVisible: false,
            showModal: mockShowModalFn,
            hideModal: () => {}
          }
        }}>
        <SettingsScreen
          route={{key: "", name: "Settings"}}
          navigation={result.current.navigation}
        />
      </ErrorContext.Provider>
    );

    const showErrorsButton = screen.getByText("Show Errors");
    expect(showErrorsButton).toBeVisible();

    fireEvent.press(showErrorsButton);

    expect(mockShowModalFn).toBeCalledTimes(1);
    expect(mockShowModalFn).toBeCalledWith();
  });

  test("can navigate to external truelayer auth page", () => {
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

    const mockReplace = jest.fn();

    render(
      <SettingsScreen
        route={{key: "", name: "Settings"}}
        navigation={{...result.current.navigation, replace: mockReplace}}
      />
    );

    const connectToTruelayerButton = screen.getByText("Reconnect to Truelayer");
    expect(connectToTruelayerButton).toBeVisible();

    fireEvent.press(connectToTruelayerButton);

    expect(mockReplace).toBeCalledTimes(1);
    expect(mockReplace).toBeCalledWith("TruelayerWebAuth");
  });
});
