import {MD3LightTheme, useTheme} from "react-native-paper";

// Create the theme to be used
export const theme = {
  ...MD3LightTheme,
  // TODO: Check these colors to see if they make sense for the react navigation theme
  colors: {
    ...MD3LightTheme.colors,
    card: MD3LightTheme.colors.surface,
    text: MD3LightTheme.colors.background,
    border: MD3LightTheme.colors.surface,
    notification: MD3LightTheme.colors.secondary,
    warning: "rgb(105, 95, 0)",
    warningContainer: "rgb(249, 229, 52)",
    warningOnContainer: "rgb(32, 28, 0)"
  }
};

export type AppTheme = typeof theme;

export const useAppTheme = () => useTheme<AppTheme>();
