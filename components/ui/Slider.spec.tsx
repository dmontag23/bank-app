import React from "react";
import {MD3LightTheme} from "react-native-paper";
import {fireEvent, render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import Slider from "./Slider";

describe("Slider component", () => {
  test("gets and sets value", () => {
    const mockSetValue = jest.fn();

    render(<Slider value={23} setValue={mockSetValue} />);

    const slider = screen.getByLabelText("slider");
    expect(slider).toBeVisible();
    expect(slider.props.value).toBe(23);

    fireEvent(slider, "onValueChange", 0);
    expect(mockSetValue).toBeCalledTimes(1);
    expect(mockSetValue).toBeCalledWith(0);
  });

  test("has correct style", () => {
    render(<Slider value={23} setValue={jest.fn()} />);

    const slider = screen.getByLabelText("slider");
    expect(slider.props).toEqual(
      expect.objectContaining({
        minimumTrackTintColor: MD3LightTheme.colors.primary,
        maximumTrackTintColor: MD3LightTheme.colors.inversePrimary,
        thumbTintColor: MD3LightTheme.colors.primary
      })
    );
  });
});
