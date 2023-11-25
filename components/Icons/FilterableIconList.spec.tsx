import React from "react";
import MaterialCommunityIconsGlyphs from "react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json";
import {fireEvent, render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import FilterableIconList from "./FilterableIconList";
import ScrollableIconList from "./ScrollableIconList";

jest.mock("./ScrollableIconList");

describe("FilterableIconList component", () => {
  const SUPPORTED_ICONS = Object.keys(MaterialCommunityIconsGlyphs);

  test("renders all icons without filter", () => {
    render(<FilterableIconList />);

    expect(screen.getByLabelText("Search for an icon")).toBeVisible();
    expect(ScrollableIconList).toBeCalledTimes(1);
    expect(ScrollableIconList).toBeCalledWith(
      {icons: SUPPORTED_ICONS, onIconPress: undefined},
      {}
    );
  });

  test("passes onIconPress to scrollable icon list", () => {
    const mockOnIconPress = jest.fn();
    render(<FilterableIconList onIconPress={mockOnIconPress} />);

    expect(ScrollableIconList).toBeCalledTimes(1);
    expect(ScrollableIconList).toBeCalledWith(
      {icons: SUPPORTED_ICONS, onIconPress: mockOnIconPress},
      {}
    );
  });

  test("filters icons", () => {
    render(<FilterableIconList />);

    const iconFilterInput = screen.getByLabelText("Search for an icon");

    expect(iconFilterInput).toBeVisible();

    fireEvent.changeText(iconFilterInput, "  WaLlPAPer  ");

    expect(ScrollableIconList).toBeCalledTimes(2);
    expect(ScrollableIconList).toBeCalledWith(
      {icons: ["wallpaper"], onIconPress: undefined},
      {}
    );
  });
});
