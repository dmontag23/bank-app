import React, {ReactNode} from "react";
import {act, renderHook} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import {NavigationContainer, useNavigation} from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";

import useRefetchOnFocus from "./useRefetchOnFocus";

describe("useRefetchOnFocus", () => {
  test("defaults to a no-op function", async () => {
    const customWrapper = (children: ReactNode) => (
      <NavigationContainer>{children}</NavigationContainer>
    );

    renderHook(() => useRefetchOnFocus(), {customWrapper});
  });

  test("re-fetches whenever screen is re-focused", async () => {
    const mockRefetch = jest.fn();
    const MockStackNavigator = createStackNavigator();

    const customWrapper = (children: ReactNode) => (
      <NavigationContainer>
        <MockStackNavigator.Navigator>
          <MockStackNavigator.Screen name="Empty">
            {() => <>{children}</>}
          </MockStackNavigator.Screen>
          <MockStackNavigator.Screen name="ScreenToFocus">
            {() => {
              useRefetchOnFocus(mockRefetch);
              return <></>;
            }}
          </MockStackNavigator.Screen>
        </MockStackNavigator.Navigator>
      </NavigationContainer>
    );

    const {result} = renderHook(
      () =>
        useNavigation<
          StackNavigationProp<{Empty: undefined; ScreenToFocus: undefined}>
        >(),
      {customWrapper}
    );

    expect(mockRefetch).not.toBeCalled();

    act(() => {
      result.current.navigate("ScreenToFocus");
    });

    expect(mockRefetch).toBeCalledTimes(1);

    act(() => {
      result.current.navigate("Empty");
    });

    expect(mockRefetch).toBeCalledTimes(1);

    act(() => {
      result.current.navigate("ScreenToFocus");
    });

    expect(mockRefetch).toBeCalledTimes(2);
  });
});
