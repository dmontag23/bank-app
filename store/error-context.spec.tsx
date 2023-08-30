import React, {ReactNode, useContext} from "react";
import {Button} from "react-native-paper";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import ErrorContext, {ErrorContextProvider} from "./error-context";
import ToastContext, {Toast, ToastType} from "./toast-context";

import {AppError} from "../types/errors";

describe("ErrorContext", () => {
  const appError: AppError = {id: "id-1", error: "Test error"};

  test("defaults values correctly", () => {
    const {result} = renderHook(() => useContext(ErrorContext));

    expect(result.current.errors).toEqual([]);
    expect(result.current.addError).toEqual(expect.any(Function));
    expect(result.current.removeError).toEqual(expect.any(Function));
    expect(result.current.addError(appError)).toBeUndefined();
    expect(result.current.removeError(appError.id)).toBeUndefined();

    expect(result.current.errorModal.isVisible).toBe(false);
    expect(result.current.errorModal.showModal).toEqual(expect.any(Function));
    expect(result.current.errorModal.hideModal).toEqual(expect.any(Function));
    expect(result.current.errorModal.showModal()).toBeUndefined();
    expect(result.current.errorModal.hideModal()).toBeUndefined();
    expect(result.current.errorModal.selectedErrorId).toBeUndefined();
  });

  test("ErrorContextProvider shows and hides error modal", async () => {
    const customWrapper = (children: ReactNode) => (
      <ErrorContextProvider>{children}</ErrorContextProvider>
    );

    const {result} = renderHook(() => useContext(ErrorContext), {
      customWrapper
    });

    expect(result.current.errorModal.isVisible).toBe(false);
    expect(result.current.errorModal.selectedErrorId).toBeUndefined();

    // show the modal
    act(() => result.current.errorModal.showModal("test-error-id"));
    await waitFor(() => expect(result.current.errorModal.isVisible).toBe(true));
    expect(result.current.errorModal.selectedErrorId).toBe("test-error-id");

    // hide the modal
    act(() => result.current.errorModal.hideModal());
    await waitFor(() =>
      expect(result.current.errorModal.isVisible).toBe(false)
    );
  });

  test("ErrorContextProvider adds an error with error modal visible and removes error", async () => {
    const mockAddToast = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ToastContext.Provider
        value={{
          toasts: [],
          addToast: mockAddToast,
          clearToast: () => {},
          clearAllToasts: () => {}
        }}>
        <ErrorContextProvider>{children}</ErrorContextProvider>
      </ToastContext.Provider>
    );

    const {result} = renderHook(() => useContext(ErrorContext), {
      customWrapper
    });

    expect(result.current.errors).toEqual([]);

    // add the error
    act(() => result.current.errorModal.showModal());
    act(() => result.current.addError(appError));

    await waitFor(() => expect(result.current.errors).toEqual([appError]));
    expect(result.current.errorModal.isVisible).toBe(true);
    expect(mockAddToast).toBeCalledTimes(0);

    // remove the error
    act(() => result.current.removeError(appError.id));
    expect(result.current.errors).toEqual([]);
  });

  test("ErrorContextProvider adds an error when error modal not visible", async () => {
    const mockAddToast = jest.fn<(toast: Toast) => void>();
    const mockClearAllToasts = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ToastContext.Provider
        value={{
          toasts: [],
          addToast: mockAddToast,
          clearToast: () => {},
          clearAllToasts: mockClearAllToasts
        }}>
        <ErrorContextProvider>{children}</ErrorContextProvider>
      </ToastContext.Provider>
    );

    const {result} = renderHook(() => useContext(ErrorContext), {
      customWrapper
    });

    expect(result.current.errors).toEqual([]);

    act(() => result.current.addError(appError));

    await waitFor(() => expect(result.current.errors).toEqual([appError]));
    expect(result.current.errorModal.isVisible).toBe(false);
    expect(mockAddToast).toBeCalledTimes(1);
    expect(mockAddToast).toBeCalledWith({
      id: appError.id,
      message: `An error occurred: ${appError.error}`,
      type: ToastType.ERROR,
      action: {
        label: "Show details",
        onPress: expect.any(Function)
      }
    });

    // test the on press function
    const onPressFunction =
      mockAddToast.mock.calls[0][0].action?.onPress ?? (() => {});

    render(<Button onPress={onPressFunction}>Test</Button>);
    fireEvent.press(screen.getByText("Test"));
    expect(result.current.errorModal.selectedErrorId).toBe(appError.id);
    expect(result.current.errorModal.isVisible).toBe(true);
    expect(mockClearAllToasts).toBeCalledTimes(1);
    expect(mockClearAllToasts).toBeCalledWith();
  });
});
