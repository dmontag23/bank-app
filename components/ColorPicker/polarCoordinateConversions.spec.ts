import {describe, expect, test} from "@jest/globals";

import {
  cartesianToPolar,
  polarToCartesian,
  radiansToDegrees
} from "./polarCoordinateConversions";

describe("polarCoordinateConversions", () => {
  describe("cartesianToPolar", () => {
    test("converts coordinate without origin", () => {
      expect(cartesianToPolar({coordinate: {x: 10, y: 10}})).toEqual({
        radius: Math.sqrt(200),
        angle: Math.PI / 4
      });
    });

    test("converts coordinate with origin", () => {
      expect(
        cartesianToPolar({coordinate: {x: 10, y: 10}, origin: {x: 10, y: 5}})
      ).toEqual({
        radius: 5,
        angle: Math.PI / 2
      });
    });
  });

  describe("polarToCartesian", () => {
    // the number of decimal places to check for accuracy in the conversion
    const precision = 14;
    test("converts coordinate without origin", () => {
      const cartesianCoordinate = polarToCartesian({
        coordinate: {radius: 2, angle: (4 * Math.PI) / 3}
      });
      expect(cartesianCoordinate.x).toBeCloseTo(-1, precision);
      expect(cartesianCoordinate.y).toBeCloseTo(-Math.sqrt(3), precision);
    });

    test("converts coordinate with origin", () => {
      expect(
        polarToCartesian({
          coordinate: {radius: 1, angle: Math.PI / 2},
          origin: {x: 10, y: 5}
        })
      ).toEqual({x: 10, y: 6});
    });
  });

  describe("radiansToDegrees", () => {
    test("converts radians to degrees", () => {
      expect(radiansToDegrees(Math.PI / 2)).toBe(90);
    });

    test("ensures degrees are always normalized by 360", () => {
      expect(radiansToDegrees(2 * Math.PI)).toBe(0);
    });

    test("ensures degrees are always positive", () => {
      expect(radiansToDegrees(-Math.PI / 2)).toBe(270);
    });
  });
});
