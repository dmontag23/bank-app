import React, {useEffect} from "react";
import {AppState, AppStateStatus, Platform} from "react-native";
import {Portal, useTheme} from "react-native-paper";
import {
  LinkingOptions,
  NavigationContainer,
  ParamListBase
} from "@react-navigation/native";
import {focusManager} from "@tanstack/react-query";

import ErrorModal from "./components/errors/ErrorModal";
import RootScreens from "./components/RootScreens";
import CenteredLoadingSpinner from "./components/ui/CenteredLoadingSpinner";
import Toasts from "./components/ui/Toasts";
import config from "./config.json";

const App = () => {
  // refetch any queries anytime the user leaves the app and then returns
  // see https://tanstack.com/query/v4/docs/react/guides/window-focus-refetching
  const onAppStateChange = (status: AppStateStatus) => {
    if (Platform.OS !== "web") focusManager.setFocused(status === "active");
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);

  const theme = useTheme();

  const linking: LinkingOptions<ParamListBase> = {
    prefixes: [config.uri],
    config: {
      screens: {
        TruelayerAuthValidation: config.integrations.trueLayer.callbackEndpoint
      }
    }
  };

  return (
    <NavigationContainer
      linking={linking}
      fallback={<CenteredLoadingSpinner />}
      theme={{
        ...theme,
        // TODO: Check these colors to see if they make sense for the react navigation theme
        colors: {
          ...theme.colors,
          card: theme.colors.surface,
          text: theme.colors.background,
          border: theme.colors.surface,
          notification: theme.colors.secondary
        }
      }}>
      <Portal.Host>
        <RootScreens />
        <Toasts />
        <ErrorModal />
      </Portal.Host>
    </NavigationContainer>
  );
};

export default App;
