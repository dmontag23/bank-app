import React from "react";
import {LayoutChangeEvent} from "react-native";
import {PanGesture} from "react-native-gesture-handler";
import {
  fireGestureHandler,
  getByGestureTestId
} from "react-native-gesture-handler/jest-utils";
import {fireEvent, render, screen, waitFor} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";

import ColorPicker from "../../../components/ColorPicker/ColorPicker";

describe("ColorPicker", () => {
  test("selects color at 90 degree angle", async () => {
    render(<ColorPicker />);

    // set the window size to display the selector in
    fireEvent(screen.getByLabelText("Hue selector"), "onLayout", {
      nativeEvent: {layout: {width: 153, height: 153}}
    } as LayoutChangeEvent);

    const selectorCircle = screen.getAllByLabelText("circle")[0];
    expect(selectorCircle).toBeVisible();
    await waitFor(() =>
      expect(selectorCircle).toHaveAnimatedStyle({
        transform: [{translateX: 144}, {translateY: 76.5}]
      })
    );

    // move the color selector clockwise by 90 degrees
    fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
      {translationX: 0, translationY: 0},
      {translationX: -67.5, translationY: 67.5}
    ]);

    expect(selectorCircle).toHaveAnimatedStyle({
      backgroundColor: "hsl(90, 100%, 50%)",
      transform: [{translateX: 76.5}, {translateY: 144}]
    });
    const innerCircle = screen.getAllByLabelText("circle")[0];
    expect(innerCircle).toHaveAnimatedStyle({
      backgroundColor: "hsl(90, 100%, 50%)"
    });
  });

  test("can adjust the saturation", async () => {
    render(<ColorPicker />);

    // set the window size to display the selector in
    fireEvent(screen.getByLabelText("Hue selector"), "onLayout", {
      nativeEvent: {layout: {width: 153, height: 153}}
    } as LayoutChangeEvent);

    const selectorCircle = screen.getAllByLabelText("circle")[0];
    await waitFor(() =>
      expect(selectorCircle).toHaveAnimatedStyle({
        transform: [{translateX: 144}, {translateY: 76.5}]
      })
    );

    // move the saturation color slider to 20%
    const saturationSlider = screen.getAllByLabelText("slider")[0];
    expect(saturationSlider).toHaveProp("value", 100);
    fireEvent(saturationSlider, "onValueChange", 20);
    expect(saturationSlider).toHaveProp("value", 20);
    await waitFor(() =>
      expect(selectorCircle).toHaveAnimatedStyle({
        backgroundColor: "hsl(0, 20%, 50%)"
      })
    );
    const innerCircle = screen.getAllByLabelText("circle")[0];
    expect(innerCircle).toHaveAnimatedStyle({
      backgroundColor: "hsl(0, 20%, 50%)"
    });
  });

  test("can adjust the lightness", async () => {
    render(<ColorPicker />);

    // set the window size to display the selector in
    fireEvent(screen.getByLabelText("Hue selector"), "onLayout", {
      nativeEvent: {layout: {width: 153, height: 153}}
    } as LayoutChangeEvent);

    const selectorCircle = screen.getAllByLabelText("circle")[0];
    await waitFor(() =>
      expect(selectorCircle).toHaveAnimatedStyle({
        transform: [{translateX: 144}, {translateY: 76.5}]
      })
    );

    // move the saturation color slider to 20%
    const lightnessSlider = screen.getAllByLabelText("slider")[1];
    expect(lightnessSlider).toHaveProp("value", 50);
    fireEvent(lightnessSlider, "onValueChange", 10);
    expect(lightnessSlider).toHaveProp("value", 10);
    await waitFor(() =>
      expect(selectorCircle).toHaveAnimatedStyle({
        backgroundColor: "hsl(0, 100%, 10%)"
      })
    );
    const innerCircle = screen.getAllByLabelText("circle")[0];
    expect(innerCircle).toHaveAnimatedStyle({
      backgroundColor: "hsl(0, 100%, 10%)"
    });
  });

  test("can pass in an icon", async () => {
    render(<ColorPicker iconName="wall" />);

    // set the window size to display the selector in
    fireEvent(screen.getByLabelText("Hue selector"), "onLayout", {
      nativeEvent: {layout: {width: 153, height: 153}}
    } as LayoutChangeEvent);

    const selectorCircle = screen.getAllByLabelText("circle")[0];
    await waitFor(() =>
      expect(selectorCircle).toHaveAnimatedStyle({
        transform: [{translateX: 144}, {translateY: 76.5}]
      })
    );

    expect(screen.getByLabelText("circleIcon")).toHaveStyle({
      left: 54,
      top: 54
    });
  });
});
