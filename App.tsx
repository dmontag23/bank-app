import React, {useEffect} from "react";
import {AppState, AppStateStatus, Platform} from "react-native";
import {Portal} from "react-native-paper";
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
import {useAppTheme} from "./hooks/utils/useAppTheme";

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

  const theme = useAppTheme();

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
      theme={theme}>
      <Portal.Host>
        <RootScreens />
        <Toasts />
        <ErrorModal />
      </Portal.Host>
    </NavigationContainer>
  );
};

export default App;
