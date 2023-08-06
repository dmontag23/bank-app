import "react-native-gesture-handler"; // needs to be the first import - see https://reactnavigation.org/docs/stack-navigator

import React from "react";
import {AppRegistry} from "react-native";
import {Provider as PaperProvider} from "react-native-paper";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

import App from "./App";
import {name as appName} from "./app.json";

AppRegistry.registerComponent(appName, () => AppWrappers);

const AppWrappers = () => {
  // Create a client for TanStack Query
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {/* PaperProvider needs to be the innermost provider so that
      any context from any other providers is available to components rendered inside
      a modal from the library */}
      <PaperProvider>
        <App />
      </PaperProvider>
    </QueryClientProvider>
  );
};
