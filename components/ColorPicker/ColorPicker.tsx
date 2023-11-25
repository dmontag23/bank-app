import React, {useState} from "react";
import {StyleSheet, View} from "react-native";

import HueSelector from "./HueSelector";

import Slider from "../ui/Slider";

type ColorPickerProps = {
  iconName?: string;
  onColorChange?: (color: string) => void;
};

const ColorPicker = ({
  iconName,
  onColorChange = () => {}
}: ColorPickerProps) => {
  // note that state has to be used here instead of animated values
  // because the Stop component from the svg library cannot be animated yet
  // see https://github.com/software-mansion/react-native-reanimated/issues/1938
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);

  // ensures the color picker never exceeds the dimensions
  // of the container that it is in
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const minDimension = Math.min(width, height);

  return (
    <View
      accessibilityLabel="Outer hue selector"
      style={styles.container}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      {/* The idea behind getting the height of the nested view, i.e. the view
      that contains the hue selector, is to ensure the sliders always appear right 
      underneath the selector. If the width of the color picker container is less than
      the height, then the height of the container is set to the width to make the 
      container a square. If the width is greater than the height, then the height
      of the container should be as high as possible (e.g. flex 1). Whatever this height
      is becomes the new radius for the color picker. */}
      <View
        accessibilityLabel="Inner hue selector"
        style={
          width === minDimension
            ? {width: minDimension, height: minDimension}
            : styles.container
        }
        onLayout={event => setHeight(event.nativeEvent.layout.height)}>
        <HueSelector
          saturation={saturation}
          lightness={lightness}
          iconName={iconName}
          onColorChange={onColorChange}
        />
      </View>
      <View>
        <Slider value={saturation} setValue={setSaturation} />
        <Slider value={lightness} setValue={setLightness} />
      </View>
    </View>
  );
};

export default ColorPicker;

const styles = StyleSheet.create({
  container: {flex: 1}
});
