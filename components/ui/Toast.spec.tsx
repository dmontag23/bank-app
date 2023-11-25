import React from "react";
import {MD3LightTheme} from "react-native-paper";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import Toast from "./Toast";

import {theme} from "../../hooks/utils/useAppTheme";
import ToastContext, {
  Toast as ToastObjectType,
  ToastType
} from "../../store/toast-context";

describe("Toast component", () => {
  const baseToast: ToastObjectType = {
    id: "id-1",
    message: "First message",
    type: ToastType.LOG
  };

  const toastTypes = [
    {
      toastType: ToastType.LOG,
      textColor: MD3LightTheme.colors.inverseOnSurface,
      surfaceColor: MD3LightTheme.colors.inverseSurface,
      buttonColor: MD3LightTheme.colors.inversePrimary
    },
    {
      toastType: ToastType.WARNING,
      textColor: theme.colors.warningOnContainer,
      surfaceColor: theme.colors.warningContainer,
      buttonColor: theme.colors.warning
    },
    {
      toastType: ToastType.ERROR,
      textColor: MD3LightTheme.colors.onErrorContainer,
      surfaceColor: MD3LightTheme.colors.errorContainer,
      buttonColor: MD3LightTheme.colors.error
    }
  ];
  test.each(toastTypes)(
    "correctly renders toasts",
    async ({toastType, textColor, surfaceColor, buttonColor}) => {
      const toast: ToastObjectType = {
        ...baseToast,
        type: toastType,
        action: {label: "Test button"}
      };

      render(
        <ToastContext.Provider
          value={{
            toasts: [],
            addToast: () => {},
            clearToast: () => {},
            clearAllToasts: () => {}
          }}>
          <Toast toast={toast} />
        </ToastContext.Provider>
      );

      const toastElement = screen.getByText("First message");
      await waitFor(() => expect(toastElement).toBeVisible());
      expect(toastElement).toHaveStyle({color: textColor});
      expect(screen.getByTestId("surface")).toHaveStyle({
        backgroundColor: surfaceColor
      });
      expect(screen.getByText("Test button")).toHaveStyle({color: buttonColor});
    }
  );

  test("toast disappears after 7 seconds", async () => {
    render(
      <ToastContext.Provider
        value={{
          toasts: [],
          addToast: () => {},
          clearToast: () => {},
          clearAllToasts: () => {}
        }}>
        <Toast toast={baseToast} />
      </ToastContext.Provider>
    );

    const toastElement = screen.getByText("First message");
    await waitFor(() => expect(toastElement).toBeVisible());
    // TODO: Come back and figure out why this is 6250 exactly and not 7000
    // Might be set by react-native-paper itself
    act(() => jest.advanceTimersByTime(6250));
    await waitFor(() => expect(toastElement).not.toBeOnTheScreen());
  });

  test("can dismiss toast by pressing cancel icon", async () => {
    const mockClearToast = jest.fn();

    render(
      <ToastContext.Provider
        value={{
          toasts: [],
          addToast: () => {},
          clearToast: mockClearToast,
          clearAllToasts: () => {}
        }}>
        <Toast toast={baseToast} />
      </ToastContext.Provider>
    );

    const cancelIcon = screen.getByLabelText("Close icon");
    await waitFor(() => expect(cancelIcon).toBeVisible());

    fireEvent.press(cancelIcon);

    await waitFor(() => expect(cancelIcon).not.toBeOnTheScreen());
    expect(mockClearToast).toBeCalledTimes(1);
    expect(mockClearToast).toBeCalledWith(baseToast.id);
  });

  test("can press action button on toast", async () => {
    const mockOnPressFn = jest.fn();
    const toast: ToastObjectType = {
      ...baseToast,
      action: {label: "Button to press", onPress: mockOnPressFn}
    };

    render(
      <ToastContext.Provider
        value={{
          toasts: [],
          addToast: () => {},
          clearToast: () => {},
          clearAllToasts: () => {}
        }}>
        <Toast toast={toast} />
      </ToastContext.Provider>
    );

    const actionButton = screen.getByText("Button to press");
    await waitFor(() => expect(actionButton).toBeVisible());

    fireEvent.press(actionButton);

    expect(mockOnPressFn).toBeCalledTimes(1);
  });
});
