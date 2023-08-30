import React from "react";
import {fireEvent, render, screen, waitFor} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";

import ErrorModal from "../../../components/errors/ErrorModal";
import SettingsScreen from "../../../components/Settings/SettingsScreen";

describe("Settings Screen", () => {
  test("renders all items on the homepage", () => {
    render(<SettingsScreen />);

    expect(screen.getByText("Settings")).toBeVisible();
    expect(screen.getByText("Show Errors")).toBeVisible();
  });

  test("can show all app errors", async () => {
    render(
      <>
        <SettingsScreen />
        <ErrorModal />
      </>
    );

    const showErrorsButton = screen.getByText("Show Errors");
    expect(showErrorsButton).toBeVisible();

    fireEvent.press(showErrorsButton);

    await waitFor(() => expect(screen.getByText("Errors")).toBeVisible());
  });
});
