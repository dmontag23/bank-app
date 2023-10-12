import React, {ReactNode} from "react";
import {act, renderHook} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import {NavigationContainer, useNavigation} from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationProp
} from "@react-navigation/stack";

import useOnFocus from "./useOnFocus";

describe("useOnFocus", () => {
  test("executes callback whenever screen is re-focused", async () => {
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
              useOnFocus(mockRefetch);
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
