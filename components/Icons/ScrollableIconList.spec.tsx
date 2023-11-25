import React from "react";
import {fireEvent, render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import ScrollableIconList from "./ScrollableIconList";

describe("ScrollableIconList component", () => {
  test("renders no icon text with empty icon list", () => {
    render(<ScrollableIconList icons={[]} />);

    expect(screen.getByText("No icons found")).toBeVisible();
  });

  test("calls no-op onIconPress when icon is clicked", () => {
    render(<ScrollableIconList icons={["credit-card"]} />);

    fireEvent(screen.getByLabelText("Icon list"), "getItemLayout");

    const creditCardIcon = screen.getByText("credit-card");
    expect(creditCardIcon).toBeVisible();

    fireEvent.press(creditCardIcon);
  });

  test("calls onIconPress when icon is clicked", () => {
    const mockOnIconPress = jest.fn();

    render(
      <ScrollableIconList
        icons={["credit-card"]}
        onIconPress={mockOnIconPress}
      />
    );

    const creditCardIcon = screen.getByText("credit-card");
    expect(creditCardIcon).toBeVisible();

    fireEvent.press(creditCardIcon);

    expect(mockOnIconPress).toBeCalledTimes(1);
    expect(mockOnIconPress).toBeCalledWith("credit-card");
  });
});
