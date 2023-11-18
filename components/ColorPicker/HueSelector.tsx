import React, {useState} from "react";
import {StyleSheet, View} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView
} from "react-native-gesture-handler";
import {useAnimatedStyle, useSharedValue} from "react-native-reanimated";

import ColorRing from "./ColorRing";
import {
  cartesianToPolar,
  polarToCartesian,
  radiansToDegrees
} from "./polarCoordinateConversions";
import ReanimatedCircle, {Circle, CircleWithCenter} from "./ReanimatedCircle";

const CONTAINER_TO_SELECTOR_RATIO = 1 / 17;
const INNER_TO_OUTER_CIRCLE_RADIUS_RATIO = 2 / 3;
const RING_TO_SELECTOR_RATIO = 1 / 2;

type HueSelectorProps = {
  saturation?: number;
  lightness?: number;
  iconName?: string;
};

const HueSelector = ({
  saturation = 100,
  lightness = 50,
  iconName
}: HueSelectorProps) => {
  const [{width, height}, setDimensions] = useState({width: 0, height: 0});
  const minDimension = Math.min(width, height);

  // define the circle used as the color selector,
  // the outer circle (from the center of the container to the middle of the color ring),
  // and the inner circle that contains the selected color (and icon)
  const selector: Circle = {radius: minDimension * CONTAINER_TO_SELECTOR_RATIO};
  const outerCircle: CircleWithCenter = {
    // the outer circle should not touch the edge of the screen, but needs to leave room
    // for the selector ball to touch the edge of the screen, which is why the radius is reduced
    // by the selector radius
    radius: minDimension / 2 - selector.radius,
    center: {x: width / 2, y: height / 2}
  };
  const innerCircle: CircleWithCenter = {
    radius: outerCircle.radius * INNER_TO_OUTER_CIRCLE_RADIUS_RATIO,
    center: {x: width / 2, y: height / 2}
  };

  const ringWidth = selector.radius * RING_TO_SELECTOR_RATIO;

  const hue = useSharedValue(0);

  const pan = Gesture.Pan()
    .onChange(event => {
      const oldCartesianCoords = polarToCartesian({
        coordinate: {radius: outerCircle.radius, angle: hue.value},
        origin: outerCircle.center
      });
      const {angle: newAngle} = cartesianToPolar({
        coordinate: {
          x: oldCartesianCoords.x + event.changeX,
          y: oldCartesianCoords.y + event.changeY
        },
        origin: outerCircle.center
      });
      hue.value = newAngle;
    })
    .withTestId("pan");

  const translation = useAnimatedStyle(() => {
    const cartesianCoords = polarToCartesian({
      coordinate: {radius: outerCircle.radius, angle: hue.value},
      origin: outerCircle.center
    });
    return {
      transform: [
        {translateX: cartesianCoords.x},
        {translateY: cartesianCoords.y}
      ]
    };
  });

  const color = useAnimatedStyle(() => ({
    backgroundColor: `hsl(${radiansToDegrees(
      hue.value
    )}, ${saturation}%, ${lightness}%)`
  }));

  return (
    <View
      onLayout={event =>
        setDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        })
      }
      accessibilityLabel="Hue selector">
      <ColorRing
        ringWidth={ringWidth}
        // the radius of the outer color ring, which includes the full color ring,
        // should include the full width of the ring. However, the outer
        // circle radius only goes to the middle of the ring, hence the adjustment
        // by half the ring width
        radius={outerCircle.radius + ringWidth / 2}
        center={outerCircle.center}
        saturation={saturation}
        lightness={lightness}
      />
      {/* Selector around color ring */}
      <GestureHandlerRootView style={[styles.layeredElement]}>
        <GestureDetector gesture={pan}>
          <ReanimatedCircle
            circle={selector}
            style={[styles.selectorCircle, color, translation]}
          />
        </GestureDetector>
      </GestureHandlerRootView>
      {/* Inner color circle */}
      <ReanimatedCircle
        circle={innerCircle}
        iconName={iconName}
        style={[styles.layeredElement, color]}
      />
    </View>
  );
};

export default HueSelector;

const styles = StyleSheet.create({
  layeredElement: {position: "absolute"},
  selectorCircle: {borderColor: "black", borderWidth: 1}
});
