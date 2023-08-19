import React, {useContext} from "react";
import {Portal, useTheme} from "react-native-paper";
import {
  LinkingOptions,
  NavigationContainer,
  ParamListBase
} from "@react-navigation/native";

import AuthScreens from "./components/AuthScreens/AuthScreens";
import ErrorModal from "./components/errors/ErrorModal";
import LoggedInScreens from "./components/LoggedInScreens";
import CenteredLoadingSpinner from "./components/ui/CenteredLoadingSpinner";
import Toasts from "./components/ui/Toasts";
import config from "./config.json";
import TruelayerAuthContext from "./store/truelayer-auth-context";

const App = () => {
  const theme = useTheme();

  const {isLoading, authToken: truelayerAuthToken} =
    useContext(TruelayerAuthContext);

  const linking: LinkingOptions<ParamListBase> = {
    prefixes: [config.uri],
    config: {
      screens: {
        TruelayerAuthValidation: config.integrations.trueLayer.callbackEndpoint
      }
    }
  };

  if (isLoading) return <CenteredLoadingSpinner />;

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
        {truelayerAuthToken ? <LoggedInScreens /> : <AuthScreens />}
        <Toasts />
        <ErrorModal />
      </Portal.Host>
    </NavigationContainer>
  );
};

export default App;
