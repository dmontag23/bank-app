import React from "react";
import {SafeAreaView, StyleSheet} from "react-native";
import WebView from "react-native-webview";

import config from "../../../config.json";

const TruelayerWebAuth = () => (
  <SafeAreaView style={styles.container}>
    <WebView
      source={{uri: config.integrations.trueLayer.authLink}}
      hideKeyboardAccessoryView={true}
    />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {flex: 1}
});

export default TruelayerWebAuth;
