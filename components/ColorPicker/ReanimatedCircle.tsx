import React from "react";
import {StyleProp, StyleSheet, ViewStyle} from "react-native";
import Animated, {AnimatedStyle} from "react-native-reanimated";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import {CartesianCoordinate} from "./polarCoordinateConversions";

export type Circle = {radius: number; center?: CartesianCoordinate};
export type CircleWithCenter = Required<Circle>;

type ReanimatedCircleProps = {
  circle: Circle;
  iconName?: string;
  style?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
};

const ReanimatedCircle = ({circle, iconName, style}: ReanimatedCircleProps) => {
  const center = circle.center ?? {x: 0, y: 0};
  return (
    <>
      <Animated.View
        accessibilityLabel="circle"
        style={[
          {
            height: circle.radius * 2,
            width: circle.radius * 2,
            borderRadius: circle.radius,
            // the code below places the circle at the left top
            // point of the circle at the center, and so
            // adjusting by the radius gets the circle to its
            // proper center
            left: center.x - circle.radius,
            top: center.y - circle.radius
          },
          style
        ]}
      />
      {iconName && (
        <MaterialCommunityIcons
          accessibilityLabel="circleIcon"
          name={iconName}
          size={circle.radius}
          color="white"
          style={[
            styles.layeredElement,
            // the left and top props are for the topleft most
            // corner of the icon, so to place the icon in the center
            // of the circle, it needs to be offset by half its size
            // i.e. half the inner circle radius
            {
              left: center.x - circle.radius / 2,
              top: center.y - circle.radius / 2
            }
          ]}
        />
      )}
    </>
  );
};

export default ReanimatedCircle;

const styles = StyleSheet.create({
  layeredElement: {position: "absolute"}
});
