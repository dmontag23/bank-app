import "react-native-gesture-handler"; // needs to be the first import - see https://reactnavigation.org/docs/stack-navigator

import React from "react";
import {AppRegistry} from "react-native";
import {Provider as PaperProvider} from "react-native-paper";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

import App from "./App";
import {name as appName} from "./app.json";
import {theme} from "./hooks/utils/useAppTheme";
import {AddCategoryContextProvider} from "./store/add-category-context";
import {ErrorContextProvider} from "./store/error-context";
import {ToastContextProvider} from "./store/toast-context";
import {TruelayerAuthContextProvider} from "./store/truelayer-auth-context";

AppRegistry.registerComponent(appName, () => AppWrappers);

const AppWrappers = () => {
  // Create a client for TanStack Query
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TruelayerAuthContextProvider>
        <ToastContextProvider>
          <ErrorContextProvider>
            <AddCategoryContextProvider>
              {/* PaperProvider needs to be the innermost provider so that
              any context from any other providers is available to components 
              rendered inside a modal from the library */}
              <PaperProvider theme={theme}>
                <App />
              </PaperProvider>
            </AddCategoryContextProvider>
          </ErrorContextProvider>
        </ToastContextProvider>
      </TruelayerAuthContextProvider>
    </QueryClientProvider>
  );
};
