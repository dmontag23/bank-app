import React from "react";
import {describe, expect, test} from "@jest/globals";
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native";

import ErrorModal from "../../../components/errors/ErrorModal";
import SettingsScreen from "../../../components/Settings/SettingsScreen";
import {ErrorContextProvider} from "../../../store/error-context";
import {ComponentTestWrapper} from "../../mocks/utils";

describe("Settings Screen", () => {
  test("renders all items on the homepage", () => {
    render(<SettingsScreen />, {
      wrapper: ComponentTestWrapper
    });

    expect(screen.getByText("Settings")).toBeVisible();
    expect(screen.getByText("Show Errors")).toBeVisible();
  });

  test("can show all app errors", async () => {
    render(
      <ErrorContextProvider>
        <SettingsScreen />
        <ErrorModal />
      </ErrorContextProvider>,
      {
        wrapper: ComponentTestWrapper
      }
    );

    const showErrorsButton = screen.getByText("Show Errors");
    expect(showErrorsButton).toBeVisible();

    fireEvent.press(showErrorsButton);

    await waitFor(() => expect(screen.getByText("Errors")).toBeVisible());
  });
});
