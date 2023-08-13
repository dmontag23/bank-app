import React from "react";
import WebView from "react-native-webview";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {createStackNavigator} from "@react-navigation/stack";
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native";

import {trueLayerAuthApi} from "../../axiosConfig";
import AuthScreens from "../../components/AuthScreens/AuthScreens";
import ThirdPartyConnections from "../../components/AuthScreens/ThirdPartyConnections";
import TruelayerAuthValidation from "../../components/AuthScreens/Truelayer/TruelayerAuthValidation";
import TruelayerWebAuth from "../../components/AuthScreens/Truelayer/TruelayerWebAuth";
import config from "../../config.json";
import {TruelayerAuthContextProvider} from "../../store/truelayer-auth-context";
import {TruelayerAuthStackParamList} from "../../types/screens";
import {
  AuthRedirectResponse,
  ConnectTokenPostRequest,
  ConnectTokenPostResponse
} from "../../types/trueLayer/authAPI/auth";
import {ComponentTestWrapper} from "../mocks/utils";

jest.mock("../../axiosConfig");

describe("Auth screen views", () => {
  // creating a mock navigator here because you can only access the
  // Truelayer auth validation screen from a callback
  const MockStackNavigator =
    createStackNavigator<TruelayerAuthStackParamList>();
  const renderMockAuthScreens = (
    params: Partial<AuthRedirectResponse> | undefined
  ) => (
    <TruelayerAuthContextProvider>
      <MockStackNavigator.Navigator>
        <MockStackNavigator.Screen
          name="TruelayerAuthValidation"
          component={TruelayerAuthValidation}
          initialParams={params}
        />
        <MockStackNavigator.Screen
          name="ThirdPartyConnections"
          component={ThirdPartyConnections}
        />
        <MockStackNavigator.Screen
          name="TruelayerWebAuth"
          component={TruelayerWebAuth}
        />
      </MockStackNavigator.Navigator>
    </TruelayerAuthContextProvider>
  );

  test("renders the third party connections screen as a default", () => {
    render(
      <TruelayerAuthContextProvider>
        <AuthScreens />
      </TruelayerAuthContextProvider>,
      {wrapper: ComponentTestWrapper}
    );

    expect(
      screen.getByText("Please connect to the following services")
    ).toBeVisible();
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

  test("does not render Truelayer connect button if logged in", async () => {
    await AsyncStorage.setItem(
      "truelayer-auth-token",
      "dummy-truelayer-auth-token"
    );

    render(
      <TruelayerAuthContextProvider>
        <AuthScreens />
      </TruelayerAuthContextProvider>,
      {wrapper: ComponentTestWrapper}
    );

    expect(
      screen.getByText("Please connect to the following services")
    ).toBeVisible();
    await waitFor(() =>
      expect(screen.queryByText("Connect to Truelayer")).toBeNull()
    );
  });

  test("renders Truelayer error page and allows users to try logging in again", () => {
    render(renderMockAuthScreens({error: "access_denied"}), {
      wrapper: ComponentTestWrapper
    });

    expect(screen.getByText("An error has occurred")).toBeVisible();
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
    render(renderMockAuthScreens(undefined), {wrapper: ComponentTestWrapper});

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
      renderMockAuthScreens({code: "truelayer-dummy-code", scope: "accounts"}),
      {wrapper: ComponentTestWrapper}
    );

    expect(screen.getByText("An error has occurred")).toBeVisible();
    expect(screen.getByText("The error is unknown")).toBeVisible();
  });

  test("stores valid Truelayer tokens and renders loading spinner", async () => {
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
      renderMockAuthScreens({code: "truelayer-dummy-code", scope: "accounts"}),
      {wrapper: ComponentTestWrapper}
    );

    await waitFor(() =>
      expect(screen.getByTestId("loadingSpinner")).toBeVisible()
    );
    expect(await AsyncStorage.getItem("truelayer-auth-token")).toBe(
      mockAccessToken
    );
    expect(await AsyncStorage.getItem("truelayer-refresh-token")).toBe(
      mockRefreshToken
    );
  });
});