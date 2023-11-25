export type CartesianCoordinate = {x: number; y: number};
export type PolarCoordinate = {radius: number; angle: number};

export const cartesianToPolar = ({
  coordinate,
  origin = {x: 0, y: 0}
}: {
  coordinate: CartesianCoordinate;
  origin?: CartesianCoordinate;
}): PolarCoordinate => {
  // the worklet is needed to run this function in the UI thread
  // for reanimated
  "worklet";
  const x = coordinate.x - origin.x;
  const y = coordinate.y - origin.y;
  return {radius: Math.hypot(x, y), angle: Math.atan2(y, x)};
};

export const polarToCartesian = ({
  coordinate,
  origin = {x: 0, y: 0}
}: {
  coordinate: PolarCoordinate;
  origin?: CartesianCoordinate;
}): CartesianCoordinate => {
  "worklet";
  return {
    x: origin.x + coordinate.radius * Math.cos(coordinate.angle),
    y: origin.y + coordinate.radius * Math.sin(coordinate.angle)
  };
};

export const radiansToDegrees = (radians: number) => {
  "worklet";
  const degrees = ((radians * 180) / Math.PI) % 360;
  return degrees < 0 ? degrees + 360 : degrees;
};
