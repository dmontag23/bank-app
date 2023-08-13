import React, {ReactNode} from "react";
import {Provider} from "react-native-paper";
import {expect} from "@jest/globals";
import {NavigationContainer} from "@react-navigation/native";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

export const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ensures jest exits as soon as it has finished executing
      cacheTime: Infinity,
      // turns retries off so that tests
      // do not timeout if you want to test
      // a query that errors
      retry: false
    },
    mutations: {
      cacheTime: Infinity,
      retry: false
    }
  }
});

type TanstackQueryTestWrapperProps = {
  children: ReactNode;
};

export const TanstackQueryTestWrapper = ({
  children
}: TanstackQueryTestWrapperProps) => (
  <NavigationContainer>
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  </NavigationContainer>
);

type ComponentTestWrapperProps = {
  children: ReactNode;
};

export const ComponentTestWrapper = ({children}: ComponentTestWrapperProps) => (
  <NavigationContainer>
    <QueryClientProvider client={testQueryClient}>
      <Provider>{children}</Provider>
    </QueryClientProvider>
  </NavigationContainer>
);

export const navigationObject = {
  addListener: expect.any(Function),
  canGoBack: expect.any(Function),
  dispatch: expect.any(Function),
  getId: expect.any(Function),
  getParent: expect.any(Function),
  getState: expect.any(Function),
  goBack: expect.any(Function),
  isFocused: expect.any(Function),
  jumpTo: expect.any(Function),
  navigate: expect.any(Function),
  removeListener: expect.any(Function),
  reset: expect.any(Function),
  setOptions: expect.any(Function),
  setParams: expect.any(Function)
};
