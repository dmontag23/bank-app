import React, {ReactNode} from "react";
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

interface TanstackQueryTestWrapperProps {
  children: ReactNode;
}
export const tanstackQueryTestWrapper = ({
  children
}: TanstackQueryTestWrapperProps) => (
  <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
);
