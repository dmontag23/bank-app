import React, {ReactNode} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

export const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // do not enable the cache so that jest
      // exits as soon as it has finished executing
      cacheTime: 0,
      // turns retries off so that tests
      // do not timeout if you want to test
      // a query that errors
      retry: false
    },
    mutations: {
      cacheTime: 0,
      retry: false
    }
  }
});

interface TanstackQueryTestWrapperProps {
  children: ReactNode;
}
export const tanstackQueryTestWrapper = ({
  children
}: TanstackQueryTestWrapperProps) => (
  <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
);
