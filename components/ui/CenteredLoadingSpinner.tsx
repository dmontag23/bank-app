import React from "react";
import {StyleSheet, View} from "react-native";

import LoadingSpinner from "./LoadingSpinner";

const CenteredLoadingSpinner = () => (
  <View style={styles.container} testID="centeredLoadingSpinner">
    <LoadingSpinner />
  </View>
);

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: "center"}
});

export default CenteredLoadingSpinner;
