import React from "react";
import WebView from "react-native-webview";
import {fireEvent, render, screen, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";

import {trueLayerAuthApi} from "../../api/axiosConfig";
import ThirdPartyConnections from "../../components/AuthScreens/ThirdPartyConnections";
import TruelayerAuthValidation from "../../components/AuthScreens/Truelayer/TruelayerAuthValidation";
import TruelayerWebAuth from "../../components/AuthScreens/Truelayer/TruelayerWebAuth";
import RootScreens from "../../components/RootScreens";
import config from "../../config.json";
import {RootStackParamList} from "../../types/screens";
import {
  AuthRedirectResponse,
  ConnectTokenPostRequest,
  ConnectTokenPostResponse
} from "../../types/trueLayer/authAPI/auth";

jest.mock("../../api/axiosConfig");

describe("Root screen views - auth flow", () => {
  // creating a mock navigator here because you can only access the
  // Truelayer auth validation screen from a callback
  const MockStackNavigator = createStackNavigator<RootStackParamList>();
  const renderMockAuthScreens = (
    params: Partial<AuthRedirectResponse> | undefined
  ) => (
    <NavigationContainer>
      <MockStackNavigator.Navigator>
        <MockStackNavigator.Screen
          name="TruelayerAuthValidation"
          component={TruelayerAuthValidation}
          initialParams={params}
        />
        <MockStackNavigator.Screen
          name="AppViews"
          component={ThirdPartyConnections}
        />
        <MockStackNavigator.Screen
          name="TruelayerWebAuth"
          component={TruelayerWebAuth}
        />
      </MockStackNavigator.Navigator>
    </NavigationContainer>
  );

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
    render(renderMockAuthScreens({error: "access_denied"}));

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

  test("renders unknown error page and allows users to return to the home screen", () => {
    render(renderMockAuthScreens(undefined));

    expect(screen.getByText("An error has occurred")).toBeVisible();
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

  // TODO: Maybe find a way to use deep linking here instead of creating a mock
  // stack navigator
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

    render(
      renderMockAuthScreens({code: "truelayer-dummy-code", scope: "accounts"})
    );

    await waitFor(() =>
      expect(screen.getByText("An error has occurred")).toBeVisible()
    );
    expect(screen.getByText("The error is unknown")).toBeVisible();
  });

  // TODO: Maybe find a way to use deep linking here instead of creating a mock
  // stack navigator
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

    render(
      renderMockAuthScreens({code: "truelayer-dummy-code", scope: "accounts"})
    );

    // this goes back to the Third Party Auth screen because of how the mock auth
    // screen function is setup. Normally it should go the the main budgets screen
    await waitFor(() =>
      expect(
        screen.getByText("Please connect to the following services")
      ).toBeVisible()
    );
    expect(await AsyncStorage.getItem("truelayer-auth-token")).toBe(
      mockAccessToken
    );
    expect(await AsyncStorage.getItem("truelayer-refresh-token")).toBe(
      mockRefreshToken
    );
  });
});
