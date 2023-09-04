import React from "react";
import {Linking} from "react-native";
import WebView from "react-native-webview";
import {fireEvent, render, screen, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {NavigationContainer} from "@react-navigation/native";

import {trueLayerAuthApi} from "../../api/axiosConfig";
import App from "../../App";
import RootScreens from "../../components/RootScreens";
import config from "../../config.json";
import {
  ConnectTokenPostRequest,
  ConnectTokenPostResponse
} from "../../types/trueLayer/authAPI/auth";

jest.mock("../../api/axiosConfig");

// mock the deep linking mechanism in order to be able to test it
jest.mock("react-native/Libraries/Linking/Linking");

describe("Root screen views - auth flow", () => {
  test("renders the third party connections screen as a default when not logged in", async () => {
    render(
      <NavigationContainer>
        <RootScreens />
      </NavigationContainer>
    );

    await waitFor(() =>
      expect(
        screen.getByText("Please connect to the following services")
      ).toBeVisible()
    );
    const connectButton = screen.getByText("Connect to Truelayer");
    expect(connectButton).toBeVisible();

    fireEvent.press(connectButton);

    expect(WebView).toBeCalledTimes(1);
    expect(WebView).toBeCalledWith(
      {
        hideKeyboardAccessoryView: true,
        source: {
          uri: config.integrations.trueLayer.authLink
        }
      },
      {}
    );
  });

  test("renders Truelayer error page and allows users to try logging in again", async () => {
    const deepLinkUrl = "bankapp://truelayer-callback?error=access_denied";

    // Mock Linking.getInitialURL to return the deep link URL
    // this will ensure the app starts as if it was opened with the specified url
    (
      Linking.getInitialURL as jest.MockedFunction<typeof Linking.getInitialURL>
    ).mockResolvedValue(deepLinkUrl);

    render(<App />);

    await waitFor(() =>
      expect(screen.getByText("An error has occurred")).toBeVisible()
    );
    expect(
      screen.getByText(
        "Truelayer returned the following error code: access_denied"
      )
    ).toBeVisible();
    expect(screen.getByText("Return to home screen")).toBeVisible();

    const tryAgainButton = screen.getByText("Try again");
    expect(tryAgainButton).toBeVisible();

    fireEvent.press(tryAgainButton);

    expect(WebView).toBeCalledTimes(1);
    expect(WebView).toBeCalledWith(
      {
        hideKeyboardAccessoryView: true,
        source: {
          uri: config.integrations.trueLayer.authLink
        }
      },
      {}
    );
  });

  test("renders unknown error page and allows users to return to the home screen", async () => {
    const deepLinkUrl = "bankapp://truelayer-callback";

    // Mock Linking.getInitialURL to return the deep link URL
    // this will ensure the app starts as if it was opened with the specified url
    (
      Linking.getInitialURL as jest.MockedFunction<typeof Linking.getInitialURL>
    ).mockResolvedValue(deepLinkUrl);

    render(<App />);

    await waitFor(() =>
      expect(screen.getByText("An error has occurred")).toBeVisible()
    );
    expect(screen.getByText("The error is unknown")).toBeVisible();
    expect(screen.getByText("Try again")).toBeVisible();

    const returnToHomeScreenButton = screen.getByText("Return to home screen");
    expect(returnToHomeScreenButton).toBeVisible();

    fireEvent.press(returnToHomeScreenButton);

    expect(
      screen.getByText("Please connect to the following services")
    ).toBeVisible();
    expect(screen.getByText("Connect to Truelayer")).toBeVisible();
  });

  test("displays error page on failed connect to Truelayer endpoint", async () => {
    (
      trueLayerAuthApi.post as jest.MockedFunction<
        typeof trueLayerAuthApi.post<
          ConnectTokenPostRequest,
          ConnectTokenPostResponse
        >
      >
    ).mockImplementation(async () =>
      Promise.reject("Cannot connect to the truelayer api")
    );

    const deepLinkUrl =
      "bankapp://truelayer-callback?code=truelayer-dummy-code&scope=accounts";

    // Mock Linking.getInitialURL to return the deep link URL
    // this will ensure the app starts as if it was opened with the specified url
    (
      Linking.getInitialURL as jest.MockedFunction<typeof Linking.getInitialURL>
    ).mockResolvedValue(deepLinkUrl);

    render(<App />);

    await waitFor(() =>
      expect(screen.getByText("An error has occurred")).toBeVisible()
    );
    expect(screen.getByText("The error is unknown")).toBeVisible();
  });

  test("stores valid Truelayer tokens and navigates to the home budgets page", async () => {
    const mockAccessToken = "valid-truelayer-access-token";
    const mockRefreshToken = "valid-truelayer-refresh-token";
    (
      trueLayerAuthApi.post as jest.MockedFunction<
        typeof trueLayerAuthApi.post<
          ConnectTokenPostRequest,
          ConnectTokenPostResponse
        >
      >
    ).mockImplementation(async () => ({
      access_token: mockAccessToken,
      expires_in: 3600,
      refresh_token: mockRefreshToken,
      token_type: "Bearer",
      scope: "info"
    }));

    const deepLinkUrl =
      "bankapp://truelayer-callback?code=truelayer-dummy-code&scope=accounts";

    // Mock Linking.getInitialURL to return the deep link URL
    // this will ensure the app starts as if it was opened with the specified url
    (
      Linking.getInitialURL as jest.MockedFunction<typeof Linking.getInitialURL>
    ).mockResolvedValue(deepLinkUrl);

    render(<App />);

    await waitFor(() =>
      expect(screen.getByText("Please select a budget")).toBeVisible()
    );
    expect(await AsyncStorage.getItem("truelayer-auth-token")).toBe(
      mockAccessToken
    );
    expect(await AsyncStorage.getItem("truelayer-refresh-token")).toBe(
      mockRefreshToken
    );
  });

  test("allows users to go back to the app on an unknown error page if a token already exists", async () => {
    const mockAccessToken = "dummy-truelayer-auth-token";
    const mockRefreshToken = "dummy-truelayer-refresh-token";
    await AsyncStorage.multiSet([
      ["truelayer-auth-token", mockAccessToken],
      ["truelayer-refresh-token", mockRefreshToken]
    ]);

    const deepLinkUrl = "bankapp://truelayer-callback";

    // Mock Linking.getInitialURL to return the deep link URL
    // this will ensure the app starts as if it was opened with the specified url
    (
      Linking.getInitialURL as jest.MockedFunction<typeof Linking.getInitialURL>
    ).mockResolvedValue(deepLinkUrl);

    render(<App />);

    await waitFor(() =>
      expect(screen.getByText("An error has occurred")).toBeVisible()
    );

    const returnToHomeScreenButton = screen.getByText("Return to home screen");
    expect(returnToHomeScreenButton).toBeVisible();

    fireEvent.press(returnToHomeScreenButton);

    expect(screen.getByText("Please select a budget")).toBeVisible();
    expect(await AsyncStorage.getItem("truelayer-auth-token")).toBe(
      mockAccessToken
    );
    expect(await AsyncStorage.getItem("truelayer-refresh-token")).toBe(
      mockRefreshToken
    );
  });

  test("allows users to try again an unknown error page if a token already exists", async () => {
    const mockAccessToken = "dummy-truelayer-auth-token";
    const mockRefreshToken = "dummy-truelayer-refresh-token";
    await AsyncStorage.multiSet([
      ["truelayer-auth-token", mockAccessToken],
      ["truelayer-refresh-token", mockRefreshToken]
    ]);

    const deepLinkUrl = "bankapp://truelayer-callback";

    // Mock Linking.getInitialURL to return the deep link URL
    // this will ensure the app starts as if it was opened with the specified url
    (
      Linking.getInitialURL as jest.MockedFunction<typeof Linking.getInitialURL>
    ).mockResolvedValue(deepLinkUrl);

    render(<App />);

    await waitFor(() =>
      expect(screen.getByText("An error has occurred")).toBeVisible()
    );

    const tryAgainButton = screen.getByText("Try again");
    expect(tryAgainButton).toBeVisible();

    fireEvent.press(tryAgainButton);

    expect(WebView).toBeCalledTimes(1);
    expect(WebView).toBeCalledWith(
      {
        hideKeyboardAccessoryView: true,
        source: {
          uri: config.integrations.trueLayer.authLink
        }
      },
      {}
    );
  });

  test("stores new tokens on reauthorization", async () => {
    const mockAccessToken = "dummy-truelayer-auth-token";
    const mockRefreshToken = "dummy-truelayer-refresh-token";
    await AsyncStorage.multiSet([
      ["truelayer-auth-token", mockAccessToken],
      ["truelayer-refresh-token", mockRefreshToken]
    ]);

    (
      trueLayerAuthApi.post as jest.MockedFunction<
        typeof trueLayerAuthApi.post<
          ConnectTokenPostRequest,
          ConnectTokenPostResponse
        >
      >
    ).mockImplementation(async () => ({
      access_token: "new-access-token",
      expires_in: 3600,
      refresh_token: "new-refresh-token",
      token_type: "Bearer",
      scope: "info"
    }));

    const deepLinkUrl =
      "bankapp://truelayer-callback?code=dummy-truelayer-code&scope=accounts";

    // Mock Linking.getInitialURL to return the deep link URL
    // this will ensure the app starts as if it was opened with the specified url
    (
      Linking.getInitialURL as jest.MockedFunction<typeof Linking.getInitialURL>
    ).mockResolvedValue(deepLinkUrl);

    render(<App />);

    await waitFor(() =>
      expect(screen.getByText("Please select a budget")).toBeVisible()
    );

    expect(await AsyncStorage.getItem("truelayer-auth-token")).toBe(
      "new-access-token"
    );
    expect(await AsyncStorage.getItem("truelayer-refresh-token")).toBe(
      "new-refresh-token"
    );
  });
});
