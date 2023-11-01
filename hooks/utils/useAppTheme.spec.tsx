import React, {ReactNode} from "react";
import {MD3LightTheme, Provider as PaperProvider} from "react-native-paper";
import {renderHook} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";

import {theme, useAppTheme} from "./useAppTheme";

describe("useAppTheme", () => {
  test("has correct custom colors", () => {
    const customColors = {
      card: MD3LightTheme.colors.surface,
      text: MD3LightTheme.colors.background,
      border: MD3LightTheme.colors.surface,
      notification: MD3LightTheme.colors.secondary,
      warning: "rgb(105, 95, 0)",
      warningContainer: "rgb(249, 229, 52)",
      warningOnContainer: "rgb(32, 28, 0)"
    };

    const customWrapper = (children: ReactNode) => (
      <PaperProvider theme={theme}>{children}</PaperProvider>
    );

    const {result} = renderHook(() => useAppTheme(), {customWrapper});

    expect(result.current.colors).toMatchObject(customColors);
  });
});
