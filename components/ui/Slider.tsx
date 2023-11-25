import React from "react";
import RNSlider from "@react-native-community/slider";

import {useAppTheme} from "../../hooks/utils/useAppTheme";

type SliderProps = {
  value: number;
  setValue: (value: number) => void;
};

const Slider = ({value, setValue}: SliderProps) => {
  const theme = useAppTheme();
  //TODO: Use an icon here to set the size of the thumb icon
  // see https://github.com/callstack/react-native-slider/issues/97  */}
  return (
    <RNSlider
      accessibilityLabel="slider"
      value={value}
      onValueChange={setValue}
      minimumValue={0}
      maximumValue={100}
      step={1}
      minimumTrackTintColor={theme.colors.primary}
      maximumTrackTintColor={theme.colors.inversePrimary}
      thumbTintColor={theme.colors.primary}
    />
  );
};

export default Slider;
