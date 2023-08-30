import React, {ReactNode} from "react";
import {fireEvent, render, renderHook, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import {NavigationContainer, useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";

import TruelayerAuthValidation from "./TruelayerAuthValidation";

import usePostTruelayerToken from "../../../hooks/integrations/truelayer/usePostTruelayerToken";
import useStoreTruelayerTokens from "../../../hooks/integrations/truelayer/useStoreTruelayerTokens";
import {TruelayerAuthStackParamList} from "../../../types/screens";
import CenteredLoadingSpinner from "../../ui/CenteredLoadingSpinner";

jest.mock("../../../hooks/integrations/truelayer/usePostTruelayerToken");
jest.mock("../../../hooks/integrations/truelayer/useStoreTruelayerTokens");
jest.mock("../../ui/CenteredLoadingSpinner");

describe("TruelayerAuthValidation component", () => {
  test("renders loading spinner when post to tokens is loading", () => {
    // setup mocks
    const mockExchangeCodeForAuthTokens = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (usePostTruelayerToken as jest.MockedFunction<any>).mockImplementation(
      () => ({
        mutate: mockExchangeCodeForAuthTokens,
        isLoading: true,
        isSuccess: false,
        data: undefined
      })
    );
    (useStoreTruelayerTokens as jest.MockedFunction<any>).mockImplementation(
      () => ({
        mutate: () => {},
        isLoading: false,
        isSuccess: false
      })
    );

    const customWrapper = (children: ReactNode) => (
      <NavigationContainer>{children}</NavigationContainer>
    );

    const {result} = renderHook(
      () =>
        useNavigation<
          StackNavigationProp<
            TruelayerAuthStackParamList,
            "TruelayerAuthValidation"
          >
        >(),
      {customWrapper}
    );

    render(
      <TruelayerAuthValidation
        route={{
          key: "",
          name: "TruelayerAuthValidation",
          params: {code: "test-code", scope: "accounts"}
        }}
        navigation={result.current}
      />
    );

    expect(mockExchangeCodeForAuthTokens).toBeCalledTimes(1);
    expect(mockExchangeCodeForAuthTokens).toBeCalledWith("test-code");

    expect(CenteredLoadingSpinner).toBeCalledTimes(1);
    expect(CenteredLoadingSpinner).toBeCalledWith({}, {});
  });

  test("renders loading spinner when storing tokens", () => {
    // setup mocks
    const mockExchangeCodeForAuthTokens = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (usePostTruelayerToken as jest.MockedFunction<any>).mockImplementation(
      () => ({
        mutate: mockExchangeCodeForAuthTokens,
        isLoading: false,
        isSuccess: true,
        data: {
          access_token: "",
          expires_in: 0,
          token_type: "",
          scope: ""
        }
      })
    );
    (useStoreTruelayerTokens as jest.MockedFunction<any>).mockImplementation(
      () => ({
        mutate: () => {},
        isLoading: true,
        isSuccess: false
      })
    );

    const customWrapper = (children: ReactNode) => (
      <NavigationContainer>{children}</NavigationContainer>
    );

    const {result} = renderHook(
      () =>
        useNavigation<
          StackNavigationProp<
            TruelayerAuthStackParamList,
            "TruelayerAuthValidation"
          >
        >(),
      {customWrapper}
    );

    render(
      <TruelayerAuthValidation
        route={{
          key: "",
          name: "TruelayerAuthValidation",
          params: {code: "test-code", scope: "accounts"}
        }}
        navigation={result.current}
      />
    );

    expect(mockExchangeCodeForAuthTokens).toBeCalledTimes(1);
    expect(mockExchangeCodeForAuthTokens).toBeCalledWith("test-code");

    expect(CenteredLoadingSpinner).toBeCalledTimes(1);
    expect(CenteredLoadingSpinner).toBeCalledWith({}, {});
  });

  test("renders page on truelayer auth error", () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (usePostTruelayerToken as jest.MockedFunction<any>).mockImplementation(
      () => ({
        mutate: () => {},
        isLoading: false,
        isSuccess: false,
        data: undefined
      })
    );
    (useStoreTruelayerTokens as jest.MockedFunction<any>).mockImplementation(
      () => ({
        mutate: () => {},
        isLoading: false,
        isSuccess: false
      })
    );

    const customWrapper = (children: ReactNode) => (
      <NavigationContainer>{children}</NavigationContainer>
    );

    const {result} = renderHook(
      () =>
        useNavigation<
          StackNavigationProp<
            TruelayerAuthStackParamList,
            "TruelayerAuthValidation"
          >
        >(),
      {customWrapper}
    );

    const mockReplaceFunction = jest.fn();

    render(
      <TruelayerAuthValidation
        route={{
          key: "",
          name: "TruelayerAuthValidation",
          params: {error: "access_denied"}
        }}
        navigation={{...result.current, replace: mockReplaceFunction}}
      />
    );

    // test the text
    expect(screen.getByText("An error has occurred")).toBeVisible();
    expect(
      screen.getByText(
        "Truelayer returned the following error code: access_denied"
      )
    ).toBeVisible();

    // test the buttons
    const tryAgainButton = screen.getByText("Try again");
    expect(tryAgainButton).toBeVisible();
    fireEvent.press(tryAgainButton);
    expect(mockReplaceFunction).toBeCalledTimes(1);
    expect(mockReplaceFunction).toBeCalledWith("TruelayerWebAuth");

    const homeScreenButton = screen.getByText("Return to home screen");
    expect(homeScreenButton).toBeVisible();
    fireEvent.press(homeScreenButton);
    expect(mockReplaceFunction).toBeCalledTimes(2);
    expect(mockReplaceFunction).toBeCalledWith("ThirdPartyConnections");
  });

  test("renders page on unknown error", () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (usePostTruelayerToken as jest.MockedFunction<any>).mockImplementation(
      () => ({
        mutate: () => {},
        isLoading: false,
        isSuccess: false,
        data: undefined
      })
    );
    (useStoreTruelayerTokens as jest.MockedFunction<any>).mockImplementation(
      () => ({
        mutate: () => {},
        isLoading: false,
        isSuccess: false
      })
    );

    const customWrapper = (children: ReactNode) => (
      <NavigationContainer>{children}</NavigationContainer>
    );

    const {result} = renderHook(
      () =>
        useNavigation<
          StackNavigationProp<
            TruelayerAuthStackParamList,
            "TruelayerAuthValidation"
          >
        >(),
      {customWrapper}
    );

    const mockReplaceFunction = jest.fn();

    render(
      <TruelayerAuthValidation
        route={{
          key: "",
          name: "TruelayerAuthValidation",
          params: {code: "", scope: "accounts"}
        }}
        navigation={{...result.current, replace: mockReplaceFunction}}
      />
    );

    expect(screen.getByText("An error has occurred")).toBeVisible();
    expect(screen.getByText("The error is unknown")).toBeVisible();
  });

  test("renders loading spinner on successful calls to post and store tokens with no refresh token", () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (usePostTruelayerToken as jest.MockedFunction<any>).mockImplementation(
      () => ({
        mutate: () => {},
        isLoading: false,
        isSuccess: true,
        data: {
          access_token: "test-access-token",
          expires_in: 0,
          token_type: "",
          scope: ""
        }
      })
    );
    const mockStoreTruelayerTokens = jest.fn();
    (useStoreTruelayerTokens as jest.MockedFunction<any>).mockImplementation(
      () => ({
        mutate: mockStoreTruelayerTokens,
        isLoading: false,
        isSuccess: true
      })
    );

    const customWrapper = (children: ReactNode) => (
      <NavigationContainer>{children}</NavigationContainer>
    );

    const {result} = renderHook(
      () =>
        useNavigation<
          StackNavigationProp<
            TruelayerAuthStackParamList,
            "TruelayerAuthValidation"
          >
        >(),
      {customWrapper}
    );

    render(
      <TruelayerAuthValidation
        route={{
          key: "",
          name: "TruelayerAuthValidation",
          params: {code: "", scope: "accounts"}
        }}
        navigation={result.current}
      />
    );

    expect(mockStoreTruelayerTokens).toBeCalledTimes(1);
    expect(mockStoreTruelayerTokens).toBeCalledWith({
      authToken: "test-access-token",
      refreshToken: ""
    });

    expect(CenteredLoadingSpinner).toBeCalledTimes(1);
    expect(CenteredLoadingSpinner).toBeCalledWith({}, {});
  });

  test("makes correct call to store auth and refresh tokens", () => {
    // setup mocks
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (usePostTruelayerToken as jest.MockedFunction<any>).mockImplementation(
      () => ({
        mutate: () => {},
        isLoading: false,
        isSuccess: true,
        data: {
          access_token: "test-access-token",
          refresh_token: "test-refresh-token",
          expires_in: 0,
          token_type: "",
          scope: ""
        }
      })
    );
    const mockStoreTruelayerTokens = jest.fn();
    (useStoreTruelayerTokens as jest.MockedFunction<any>).mockImplementation(
      () => ({
        mutate: mockStoreTruelayerTokens,
        isLoading: false,
        isSuccess: true
      })
    );

    const customWrapper = (children: ReactNode) => (
      <NavigationContainer>{children}</NavigationContainer>
    );

    const {result} = renderHook(
      () =>
        useNavigation<
          StackNavigationProp<
            TruelayerAuthStackParamList,
            "TruelayerAuthValidation"
          >
        >(),
      {customWrapper}
    );

    render(
      <TruelayerAuthValidation
        route={{
          key: "",
          name: "TruelayerAuthValidation",
          params: {code: "", scope: "accounts"}
        }}
        navigation={result.current}
      />
    );

    expect(mockStoreTruelayerTokens).toBeCalledTimes(1);
    expect(mockStoreTruelayerTokens).toBeCalledWith({
      authToken: "test-access-token",
      refreshToken: "test-refresh-token"
    });
  });
});
