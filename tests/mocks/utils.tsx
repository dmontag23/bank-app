import React, {ReactNode} from "react";
import {Provider} from "react-native-paper";
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
  <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
);

type ComponentTestWrapperProps = {
  children: ReactNode;
};

export const ComponentTestWrapper = ({children}: ComponentTestWrapperProps) => (
  <QueryClientProvider client={testQueryClient}>
    <Provider>{children}</Provider>
  </QueryClientProvider>
);
