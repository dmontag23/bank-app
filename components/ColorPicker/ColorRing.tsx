import React from "react";
import Svg, {Defs, LinearGradient, Path, Stop} from "react-native-svg";

import {
  CartesianCoordinate,
  polarToCartesian,
  radiansToDegrees
} from "./polarCoordinateConversions";

const GRADIENT_REFINEMENT_FACTOR = 10;

type GenerateGradientStopValues = {
  isLowerSemicircle: boolean;
  saturation: number;
  lightness: number;
};

const generateGradientStopValues = ({
  isLowerSemicircle,
  saturation,
  lightness
}: GenerateGradientStopValues) => {
  const radianIntervals = Array.from(
    {length: GRADIENT_REFINEMENT_FACTOR + 1},
    (_, i) => {
      const radian = (i / GRADIENT_REFINEMENT_FACTOR) * Math.PI;
      return isLowerSemicircle ? radian : radian + Math.PI;
    }
  );
  return radianIntervals.map(radian => {
    const xCoordOnCircleWithUnitDiameter = polarToCartesian({
      coordinate: {radius: 0.5, angle: radian},
      origin: {x: 0.5, y: 0}
    }).x;
    const degree = radiansToDegrees(radian);
    return (
      <Stop
        key={radian}
        offset={xCoordOnCircleWithUnitDiameter}
        stopColor={`hsl(${degree}, ${saturation}%, ${lightness}%)`}
      />
    );
  });
};

type ColorRingProps = {
  ringWidth: number;
  radius: number;
  center?: CartesianCoordinate;
  saturation?: number;
  lightness?: number;
};

const ColorRing = ({
  ringWidth,
  radius,
  center,
  saturation = 100,
  lightness = 50
}: ColorRingProps) => {
  const origin = center ?? {x: radius, y: radius};
  const innerRadius = radius - ringWidth;
  const leftmostInsideStartOfRing = origin.x - innerRadius;
  const rightmostInsideEndOfRing = origin.x + innerRadius;

  const halfRingStart = polarToCartesian({
    coordinate: {radius: innerRadius + ringWidth / 2, angle: 0},
    origin
  });

  const halfRingEnd = polarToCartesian({
    coordinate: {radius: innerRadius + ringWidth / 2, angle: Math.PI},
    origin
  });

  return (
    <Svg>
      <Defs>
        {["Lower", "Upper"].map((section, i) => (
          <LinearGradient
            key={i}
            id={`grad${i}`}
            gradientUnits="userSpaceOnUse"
            x1={leftmostInsideStartOfRing}
            y1="0"
            x2={rightmostInsideEndOfRing}
            y2="0">
            {generateGradientStopValues({
              isLowerSemicircle: section === "Lower",
              saturation,
              lightness
            })}
          </LinearGradient>
        ))}
      </Defs>
      {["Lower", "Upper"].map((section, i) => (
        <Path
          key={i}
          accessibilityLabel={`${section} semicircle`}
          d={`M ${section === "Lower" ? halfRingStart.x : halfRingEnd.x} ${
            section === "Lower" ? halfRingStart.y : halfRingEnd.y
          } A${innerRadius} ${innerRadius} 1 0 1 ${
            section === "Lower" ? halfRingEnd.x : halfRingStart.x
          } ${section === "Lower" ? halfRingEnd.y : halfRingStart.y}`}
          stroke={`url(#grad${i})`}
          strokeWidth={ringWidth}
          fill="none"
        />
      ))}
    </Svg>
  );
};

export default ColorRing;
