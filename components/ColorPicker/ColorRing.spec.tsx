import React from "react";
import {render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import ColorRing from "./ColorRing";
import {polarToCartesian, radiansToDegrees} from "./polarCoordinateConversions";

jest.mock("./polarCoordinateConversions");

describe("ColorRing component", () => {
  const precision = 15;

  test("renders without optional props", () => {
    const mockedPolarToCartesian = polarToCartesian as jest.MockedFunction<
      typeof polarToCartesian
    >;
    mockedPolarToCartesian
      .mockReturnValueOnce({x: 100, y: 50})
      .mockReturnValueOnce({x: 0, y: 50})
      .mockReturnValue({x: 0, y: 0});

    const mockRadiansToDegrees = radiansToDegrees as jest.MockedFunction<
      typeof radiansToDegrees
    >;
    mockRadiansToDegrees.mockReturnValue(0);

    render(<ColorRing ringWidth={10} radius={50} />);

    expect(mockedPolarToCartesian).toBeCalledTimes(24);
    // half ring start
    expect(mockedPolarToCartesian).toBeCalledWith({
      coordinate: {radius: 45, angle: 0},
      origin: {x: 50, y: 50}
    });
    // half ring end
    expect(mockedPolarToCartesian).toBeCalledWith({
      coordinate: {radius: 45, angle: Math.PI},
      origin: {x: 50, y: 50}
    });

    expect(mockRadiansToDegrees).toBeCalledTimes(22);
    const intervals = Array.from({length: 22}, (_, i) =>
      i >= 11 ? ((i - 1) / 10) * Math.PI : (i / 10) * Math.PI
    );
    intervals.map((radian, i) => {
      expect(mockedPolarToCartesian).toBeCalledWith({
        coordinate: expect.objectContaining({radius: 0.5}),
        origin: {x: 0.5, y: 0}
      });
      expect(
        mockedPolarToCartesian.mock.calls[i + 2][0].coordinate.angle
      ).toBeCloseTo(radian, precision);
      expect(mockRadiansToDegrees.mock.calls[i][0]).toBeCloseTo(
        radian,
        precision
      );
    });

    expect(screen.getByLabelText("Lower semicircle")).toHaveProp(
      "d",
      "M 100 50 A40 40 1 0 1 0 50"
    );

    expect(screen.getByLabelText("Upper semicircle")).toHaveProp(
      "d",
      "M 0 50 A40 40 1 0 1 100 50"
    );
  });

  test("renders with optional props", () => {
    const mockedPolarToCartesian = polarToCartesian as jest.MockedFunction<
      typeof polarToCartesian
    >;
    mockedPolarToCartesian
      .mockReturnValueOnce({x: 150, y: 150})
      .mockReturnValueOnce({x: 50, y: 150})
      .mockReturnValue({x: 0, y: 0});

    const mockRadiansToDegrees = radiansToDegrees as jest.MockedFunction<
      typeof radiansToDegrees
    >;
    mockRadiansToDegrees.mockReturnValue(0);

    render(
      <ColorRing
        ringWidth={10}
        radius={50}
        center={{x: 100, y: 150}}
        saturation={50}
        lightness={10}
      />
    );

    expect(mockedPolarToCartesian).toBeCalledTimes(24);
    // half ring start
    expect(mockedPolarToCartesian).toBeCalledWith({
      coordinate: {radius: 45, angle: 0},
      origin: {x: 100, y: 150}
    });
    // half ring end
    expect(mockedPolarToCartesian).toBeCalledWith({
      coordinate: {radius: 45, angle: Math.PI},
      origin: {x: 100, y: 150}
    });

    expect(mockRadiansToDegrees).toBeCalledTimes(22);
    const intervals = Array.from({length: 22}, (_, i) =>
      i >= 11 ? ((i - 1) / 10) * Math.PI : (i / 10) * Math.PI
    );
    intervals.map((radian, i) => {
      expect(mockedPolarToCartesian).toBeCalledWith({
        coordinate: expect.objectContaining({radius: 0.5}),
        origin: {x: 0.5, y: 0}
      });
      expect(
        mockedPolarToCartesian.mock.calls[i + 2][0].coordinate.angle
      ).toBeCloseTo(radian, precision);
      expect(mockRadiansToDegrees.mock.calls[i][0]).toBeCloseTo(
        radian,
        precision
      );
    });

    expect(screen.getByLabelText("Lower semicircle")).toHaveProp(
      "d",
      "M 150 150 A40 40 1 0 1 50 150"
    );

    expect(screen.getByLabelText("Upper semicircle")).toHaveProp(
      "d",
      "M 50 150 A40 40 1 0 1 150 150"
    );
  });
});
