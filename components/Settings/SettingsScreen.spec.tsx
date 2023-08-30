import React from "react";
import {MD3LightTheme} from "react-native-paper";
import {fireEvent, render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import SettingsScreen from "./SettingsScreen";

import ErrorContext from "../../store/error-context";

describe("SettingsScreen component", () => {
  test("renders all items without badge", () => {
    render(<SettingsScreen />);

    expect(screen.getByText("Settings")).toBeVisible();
    expect(screen.getByText("Show Errors")).toBeVisible();
    expect(screen.getByTestId("surface")).toHaveStyle({
      backgroundColor: MD3LightTheme.colors.secondaryContainer
    });
    expect(screen.queryByText("2")).toBeNull();
  });

  test("renders error badge", () => {
    render(
      <ErrorContext.Provider
        value={{
          errors: [
            {id: "1", error: ""},
            {id: "2", error: ""}
          ],
          addError: () => {},
          removeError: () => {},
          errorModal: {
            isVisible: false,
            showModal: () => {},
            hideModal: () => {}
          }
        }}>
        <SettingsScreen />
      </ErrorContext.Provider>
    );

    expect(screen.getByText("Show Errors")).toBeVisible();
    expect(screen.getByText("2")).toBeVisible();
  });

  test("can open the error modal", () => {
    const mockShowModalFn = jest.fn();

    render(
      <ErrorContext.Provider
        value={{
          errors: [],
          addError: () => {},
          removeError: () => {},
          errorModal: {
            isVisible: false,
            showModal: mockShowModalFn,
            hideModal: () => {}
          }
        }}>
        <SettingsScreen />
      </ErrorContext.Provider>
    );

    const showErrorsButton = screen.getByText("Show Errors");
    expect(showErrorsButton).toBeVisible();

    fireEvent.press(showErrorsButton);

    expect(mockShowModalFn).toBeCalledTimes(1);
    expect(mockShowModalFn).toBeCalledWith();
  });
});
