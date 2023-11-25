import React from "react";
import {LayoutChangeEvent, View} from "react-native";
import {PanGesture} from "react-native-gesture-handler";
import {
  fireGestureHandler,
  getByGestureTestId
} from "react-native-gesture-handler/jest-utils";
import {
  fireEvent,
  reanimatedStyleProp,
  render,
  screen,
  waitFor
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import ColorRing from "./ColorRing";
import HueSelector from "./HueSelector";
import {
  cartesianToPolar,
  polarToCartesian,
  radiansToDegrees
} from "./polarCoordinateConversions";
import ReanimatedCircle from "./ReanimatedCircle";

jest.mock("./ColorRing");
jest.mock("./polarCoordinateConversions");
jest.mock("./ReanimatedCircle");

describe("HueSelector component", () => {
  test("renders selector where width is greater than height", async () => {
    // GestureDetector needs to have a child element or the test will fail,
    // which is why ReanimatedCircle needs to return a mock element
    (
      ReanimatedCircle as jest.MockedFunction<typeof ReanimatedCircle>
    ).mockReturnValue(<View />);

    (polarToCartesian as jest.MockedFunction<typeof polarToCartesian>)
      .mockReturnValueOnce({x: 0, y: 0})
      .mockReturnValueOnce({x: 0, y: 0})
      .mockReturnValueOnce({x: 150, y: 144});
    (radiansToDegrees as jest.MockedFunction<typeof radiansToDegrees>)
      .mockReturnValueOnce(45)
      .mockReturnValueOnce(45)
      .mockReturnValueOnce(45)
      .mockReturnValueOnce(45)
      .mockReturnValueOnce(60)
      .mockReturnValueOnce(60);

    render(<HueSelector />);

    // set the container the hue selector will be visible in
    const hueSelector = screen.getByLabelText("Hue selector");
    fireEvent(hueSelector, "onLayout", {
      nativeEvent: {layout: {width: 300, height: 153}}
    } as LayoutChangeEvent);
    expect(hueSelector).toBeVisible();

    // check all the util functions have been called correctly
    await waitFor(() => expect(polarToCartesian).toBeCalledTimes(3));
    expect(polarToCartesian).toBeCalledWith({
      coordinate: {radius: 0, angle: 0},
      origin: {x: 0, y: 0}
    });
    expect(polarToCartesian).toBeCalledWith({
      coordinate: {radius: 67.5, angle: 0},
      origin: {x: 150, y: 76.5}
    });

    expect(radiansToDegrees).toBeCalledTimes(6);
    expect(radiansToDegrees).toBeCalledWith(0);

    // check the components to render are called correctly
    expect(ColorRing).toBeCalledTimes(2);
    expect(ColorRing).toBeCalledWith(
      {
        ringWidth: 0,
        radius: 0,
        center: {x: 0, y: 0},
        saturation: 100,
        lightness: 50
      },
      {}
    );
    expect(ColorRing).toBeCalledWith(
      {
        ringWidth: 4.5,
        radius: 69.75,
        center: {x: 150, y: 76.5},
        saturation: 100,
        lightness: 50
      },
      {}
    );

    expect(ReanimatedCircle).toBeCalledTimes(4);
    expect(ReanimatedCircle).toBeCalledWith(
      expect.objectContaining({
        circle: {radius: 0},
        style: [
          {borderColor: "black", borderWidth: 1},
          reanimatedStyleProp(
            {
              backgroundColor: "hsl(45, 100%, 50%)",
              transform: [{translateX: 0}, {translateY: 0}]
            },
            true
          )
        ]
      }),
      {}
    );
    expect(ReanimatedCircle).toBeCalledWith(
      expect.objectContaining({
        circle: {radius: 0, center: {x: 0, y: 0}},
        iconName: undefined,
        style: [
          {position: "absolute"},
          reanimatedStyleProp({backgroundColor: "hsl(45, 100%, 50%)"}, true)
        ]
      }),
      {}
    );
    expect(ReanimatedCircle).toBeCalledWith(
      expect.objectContaining({
        circle: {radius: 9},
        style: [
          {borderColor: "black", borderWidth: 1},
          reanimatedStyleProp({
            backgroundColor: "hsl(60, 100%, 50%)",
            transform: [{translateX: 150}, {translateY: 144}]
          })
        ]
      }),
      {}
    );
    expect(ReanimatedCircle).toBeCalledWith(
      expect.objectContaining({
        circle: {radius: 45, center: {x: 150, y: 76.5}},
        iconName: undefined,
        style: [
          {position: "absolute"},
          reanimatedStyleProp({backgroundColor: "hsl(60, 100%, 50%)"})
        ]
      }),
      {}
    );
  });

  test("renders selector where height is greater than width", async () => {
    // GestureDetector needs to have a child element or the test will fail,
    // which is why ReanimatedCircle needs to return a mock element
    (
      ReanimatedCircle as jest.MockedFunction<typeof ReanimatedCircle>
    ).mockReturnValue(<View />);

    (polarToCartesian as jest.MockedFunction<typeof polarToCartesian>)
      .mockReturnValueOnce({x: 0, y: 0})
      .mockReturnValueOnce({x: 0, y: 0})
      .mockReturnValueOnce({x: 144, y: 150});
    (radiansToDegrees as jest.MockedFunction<typeof radiansToDegrees>)
      .mockReturnValueOnce(45)
      .mockReturnValueOnce(45)
      .mockReturnValueOnce(45)
      .mockReturnValueOnce(60)
      .mockReturnValueOnce(60);

    const mockOnColorChange = jest.fn();

    render(<HueSelector onColorChange={mockOnColorChange} />);

    // set the container the hue selector will be visible in
    const hueSelector = screen.getByLabelText("Hue selector");
    fireEvent(hueSelector, "onLayout", {
      nativeEvent: {layout: {width: 153, height: 300}}
    } as LayoutChangeEvent);
    expect(hueSelector).toBeVisible();

    // check all the util functions have been called correctly
    await waitFor(() => expect(polarToCartesian).toBeCalledTimes(3));
    expect(polarToCartesian).toBeCalledWith({
      coordinate: {radius: 0, angle: 0},
      origin: {x: 0, y: 0}
    });
    expect(polarToCartesian).toBeCalledWith({
      coordinate: {radius: 67.5, angle: 0},
      origin: {x: 76.5, y: 150}
    });

    expect(radiansToDegrees).toBeCalledTimes(5);
    expect(radiansToDegrees).toBeCalledWith(0);

    // check the components to render are called correctly
    expect(ColorRing).toBeCalledTimes(2);
    expect(ColorRing).toBeCalledWith(
      {
        ringWidth: 0,
        radius: 0,
        center: {x: 0, y: 0},
        saturation: 100,
        lightness: 50
      },
      {}
    );
    expect(ColorRing).toBeCalledWith(
      {
        ringWidth: 4.5,
        radius: 69.75,
        center: {x: 76.5, y: 150},
        saturation: 100,
        lightness: 50
      },
      {}
    );

    expect(ReanimatedCircle).toBeCalledTimes(4);
    expect(ReanimatedCircle).toBeCalledWith(
      expect.objectContaining({
        circle: {radius: 0},
        style: [
          {borderColor: "black", borderWidth: 1},
          reanimatedStyleProp(
            {
              backgroundColor: "hsl(45, 100%, 50%)",
              transform: [{translateX: 0}, {translateY: 0}]
            },
            true
          )
        ]
      }),
      {}
    );
    expect(ReanimatedCircle).toBeCalledWith(
      expect.objectContaining({
        circle: {radius: 0, center: {x: 0, y: 0}},
        iconName: undefined,
        style: [
          {position: "absolute"},
          reanimatedStyleProp({backgroundColor: "hsl(45, 100%, 50%)"}, true)
        ]
      }),
      {}
    );
    expect(ReanimatedCircle).toBeCalledWith(
      expect.objectContaining({
        circle: {radius: 9},
        style: [
          {borderColor: "black", borderWidth: 1},
          reanimatedStyleProp({
            backgroundColor: "hsl(60, 100%, 50%)",
            transform: [{translateX: 144}, {translateY: 150}]
          })
        ]
      }),
      {}
    );
    expect(ReanimatedCircle).toBeCalledWith(
      expect.objectContaining({
        circle: {radius: 45, center: {x: 76.5, y: 150}},
        iconName: undefined,
        style: [
          {position: "absolute"},
          reanimatedStyleProp({backgroundColor: "hsl(60, 100%, 50%)"})
        ]
      }),
      {}
    );

    expect(mockOnColorChange).toBeCalledTimes(2);
    expect(mockOnColorChange).toBeCalledWith("hsl(45, 100%, 50%)");
    expect(mockOnColorChange).toBeCalledWith("hsl(60, 100%, 50%)");
  });

  test("renders with non-default props", async () => {
    // GestureDetector needs to have a child element or the test will fail,
    // which is why ReanimatedCircle needs to return a mock element
    (
      ReanimatedCircle as jest.MockedFunction<typeof ReanimatedCircle>
    ).mockReturnValue(<View />);
    (
      polarToCartesian as jest.MockedFunction<typeof polarToCartesian>
    ).mockReturnValueOnce({x: 0, y: 0});

    render(<HueSelector saturation={10} lightness={20} iconName="wall" />);

    expect(ColorRing).toBeCalledTimes(1);
    expect(ColorRing).toBeCalledWith(
      {
        ringWidth: 0,
        radius: 0,
        center: {x: 0, y: 0},
        saturation: 10,
        lightness: 20
      },
      {}
    );

    expect(ReanimatedCircle).toBeCalledTimes(2);
    expect(ReanimatedCircle).toBeCalledWith(
      expect.objectContaining({
        iconName: "wall"
      }),
      {}
    );
  });

  test("can use pan gesture", async () => {
    // GestureDetector needs to have a child element or the test will fail,
    // which is why ReanimatedCircle needs to return a mock element
    (
      ReanimatedCircle as jest.MockedFunction<typeof ReanimatedCircle>
    ).mockReturnValue(<View />);
    (polarToCartesian as jest.MockedFunction<typeof polarToCartesian>)
      .mockReturnValueOnce({x: 0, y: 0})
      .mockReturnValueOnce({x: 0, y: 0})
      .mockReturnValueOnce({x: 0, y: 0})
      .mockReturnValueOnce({x: 10, y: 10})
      .mockReturnValueOnce({x: 60, y: 60});
    (
      cartesianToPolar as jest.MockedFunction<typeof cartesianToPolar>
    ).mockReturnValueOnce({radius: 67.5, angle: Math.PI / 4});

    render(<HueSelector />);

    // set the container the hue selector will be visible in
    fireEvent(screen.getByLabelText("Hue selector"), "onLayout", {
      nativeEvent: {layout: {width: 153, height: 153}}
    } as LayoutChangeEvent);

    await waitFor(() => expect(polarToCartesian).toBeCalledTimes(3));

    fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
      {translationX: 0, translationY: 0},
      {translationX: 50, translationY: 50}
    ]);

    await waitFor(() => expect(polarToCartesian).toBeCalledTimes(5));
    expect(polarToCartesian).toBeCalledWith({
      coordinate: {radius: 67.5, angle: 0},
      origin: {x: 76.5, y: 76.5}
    });
    expect(polarToCartesian).toBeCalledWith({
      coordinate: {radius: 67.5, angle: Math.PI / 4},
      origin: {x: 76.5, y: 76.5}
    });

    expect(cartesianToPolar).toBeCalledTimes(1);
    expect(cartesianToPolar).toBeCalledWith({
      coordinate: {x: 60, y: 60},
      origin: {x: 76.5, y: 76.5}
    });
  });
});
