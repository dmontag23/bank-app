import React from "react";
import {ActivityIndicator} from "react-native-paper";

const LoadingSpinner = () => (
  <ActivityIndicator animating={true} size="large" testID="loadingSpinner" />
);

export default LoadingSpinner;
