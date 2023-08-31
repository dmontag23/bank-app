// created this file following the instructions from https://testing-library.com/docs/react-testing-library/setup/
import React, {ReactElement, ReactNode} from "react";
import {Provider as PaperProvider} from "react-native-paper";
import {expect} from "@jest/globals";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {
  render,
  renderHook,
  RenderHookOptions,
  RenderOptions
} from "@testing-library/react-native";

import {ErrorContextProvider} from "../store/error-context";
import {ToastContextProvider} from "../store/toast-context";
import {TruelayerAuthContextProvider} from "../store/truelayer-auth-context";

type ProvidersProps = {
  children: ReactNode;
};

const Providers = ({children}: ProvidersProps) => (
  <QueryClientProvider client={createQueryClient()}>
    <TruelayerAuthContextProvider>
      <ToastContextProvider>
        <ErrorContextProvider>
          <PaperProvider>{children}</PaperProvider>
        </ErrorContextProvider>
      </ToastContextProvider>
    </TruelayerAuthContextProvider>
  </QueryClientProvider>
);

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, {wrapper: Providers, ...options});

// ensures a new query client is created for each test
export const createQueryClient = () =>
  new QueryClient({
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

const HookWrapper = (
  children: ReactNode,
  queryClient?: QueryClient,
  customWrapper?: (children: ReactNode) => JSX.Element
) => (
  <QueryClientProvider client={queryClient ?? createQueryClient()}>
    {customWrapper ? customWrapper(children) : children}
  </QueryClientProvider>
);

type CustomRenderHookOptionsProps<Result> = {
  queryClient?: QueryClient;
  customWrapper?: (children: ReactNode) => JSX.Element;
  options?: Omit<RenderHookOptions<Result>, "wrapper">;
};

const customRenderHook = <Result, Props>(
  renderCallback: () => Props,
  options?: CustomRenderHookOptionsProps<Result>
) =>
  renderHook(renderCallback, {
    wrapper: ({children}) =>
      HookWrapper(children, options?.queryClient, options?.customWrapper),
    ...options?.options
  });

// re-export everything
export * from "@testing-library/react-native";

// override render method
export {customRender as render};

// override renderHook method
export {customRenderHook as renderHook};

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
