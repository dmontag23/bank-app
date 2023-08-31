import React, {useContext} from "react";
import {LayoutAnimation, StyleSheet, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import Toast from "./Toast";

import ToastContext from "../../store/toast-context";

const Toasts = () => {
  const insets = useSafeAreaInsets();
  const {toasts} = useContext(ToastContext);

  LayoutAnimation.easeInEaseOut();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom
        }
      ]}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // this styling is here to ensure all toasts always
  // appear at the bottom of the screen in ascending order
  container: {
    position: "absolute",
    bottom: 0,
    flexDirection: "column-reverse",
    width: "100%"
  }
});

export default Toasts;
