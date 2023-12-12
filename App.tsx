import React, {useEffect} from "react";
import {AppState, AppStateStatus, Platform} from "react-native";
import Config from "react-native-config";
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
import {INITIAL_CATEGORY_MAP} from "./constants";
import useStoreCategoryMap from "./hooks/transactions/useStoreCategoryMap";
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

  // pre-populate async storage with pre-defined transaction categories
  // TODO: Maybe find a better way to initially populate this data
  const {mutate: storeTransactionCategory} = useStoreCategoryMap({
    showWarningOnDuplicateCategory: false
  });

  useEffect(() => {
    storeTransactionCategory(INITIAL_CATEGORY_MAP);
  }, [storeTransactionCategory]);

  const theme = useAppTheme();

  const linking: LinkingOptions<ParamListBase> = {
    prefixes: [Config.URI],
    config: {
      screens: {
        TruelayerAuthValidation: Config.TRUELAYER_CALLBACK_ENDPOINT
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
