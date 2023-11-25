import React from "react";
import {LayoutChangeEvent} from "react-native";
import {act, fireEvent, render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import ColorPicker from "./ColorPicker";
import HueSelector from "./HueSelector";

import Slider from "../ui/Slider";

jest.mock("./HueSelector");
jest.mock("../ui/Slider");

describe("ColorPicker component", () => {
  test("renders when width of container is larger than height", () => {
    render(<ColorPicker />);

    // set the container the hue selector will be visible in
    fireEvent(screen.getByLabelText("Outer hue selector"), "onLayout", {
      nativeEvent: {layout: {width: 200, height: 100}}
    } as LayoutChangeEvent);

    const innerHueSelector = screen.getByLabelText("Inner hue selector");

    fireEvent(innerHueSelector, "onLayout", {
      nativeEvent: {layout: {width: 200, height: 100}}
    } as LayoutChangeEvent);

    expect(innerHueSelector).toBeVisible();
    expect(innerHueSelector).toHaveStyle({flex: 1});

    expect(HueSelector).toBeCalledTimes(3);
    expect(HueSelector).toBeCalledWith(
      {
        saturation: 100,
        lightness: 50,
        iconName: undefined,
        onColorChange: expect.any(Function)
      },
      {}
    );
    const onColorChange =
      (HueSelector as jest.MockedFunction<typeof HueSelector>).mock.calls[0][0]
        .onColorChange ?? jest.fn();
    expect(onColorChange("dummy-color")).toBeUndefined();
    expect(Slider).toBeCalledTimes(6);
    expect(Slider).toBeCalledWith(
      {value: 100, setValue: expect.any(Function)},
      {}
    );
    expect(Slider).toBeCalledWith(
      {value: 50, setValue: expect.any(Function)},
      {}
    );

    // check that setting the saturation and lightness work as expected
    const sliderMockCalls = (Slider as jest.MockedFunction<typeof Slider>).mock
      .calls;
    const setSaturation = sliderMockCalls[0][0].setValue;
    const setLightness = sliderMockCalls[1][0].setValue;

    act(() => {
      setSaturation(10);
      setLightness(20);
    });

    expect(HueSelector).toBeCalledTimes(4);
    expect(HueSelector).toBeCalledWith(
      expect.objectContaining({saturation: 10, lightness: 20}),
      {}
    );
  });

  test("renders when height of container is larger than width", () => {
    render(<ColorPicker />);

    // set the container the hue selector will be visible in
    fireEvent(screen.getByLabelText("Outer hue selector"), "onLayout", {
      nativeEvent: {layout: {width: 50, height: 100}}
    } as LayoutChangeEvent);

    const innerHueSelector = screen.getByLabelText("Inner hue selector");

    fireEvent(innerHueSelector, "onLayout", {
      nativeEvent: {layout: {width: 200, height: 100}}
    } as LayoutChangeEvent);

    expect(innerHueSelector).toBeVisible();
    expect(innerHueSelector).toHaveStyle({width: 50, height: 50});
  });

  test("passes icon name to hue selector", () => {
    render(<ColorPicker iconName="wall" />);

    expect(HueSelector).toBeCalledTimes(1);
    expect(HueSelector).toBeCalledWith(
      expect.objectContaining({iconName: "wall"}),
      {}
    );
  });

  test("passes onColorChange handler to hue selector", () => {
    const mockHandleColorChange = jest.fn();

    render(<ColorPicker onColorChange={mockHandleColorChange} />);

    expect(HueSelector).toBeCalledTimes(1);
    expect(HueSelector).toBeCalledWith(
      expect.objectContaining({onColorChange: mockHandleColorChange}),
      {}
    );
  });
});
