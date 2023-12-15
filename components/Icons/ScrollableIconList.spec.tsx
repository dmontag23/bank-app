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

  test("sets the item layout", () => {
    render(
      <ScrollableIconList icons={["credit-card"]} onIconPress={jest.fn()} />
    );

    const iconList = screen.getByLabelText("Icon list");
    expect(iconList).toBeDefined();

    const getItemLayoutResult = iconList.props.getItemLayout(undefined, 1);
    expect(getItemLayoutResult).toEqual({length: 104, offset: 104, index: 1});
  });
});
