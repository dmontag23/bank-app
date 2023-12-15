import React from "react";
import {SafeAreaView, StyleSheet} from "react-native";
import WebView from "react-native-webview";

import Config from "../../../config.json";

const TruelayerWebAuth = () => (
  <SafeAreaView style={styles.container}>
    <WebView
      source={{uri: Config.TRUELAYER_OAUTH_URL}}
      hideKeyboardAccessoryView={true}
    />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {flex: 1}
});

export default TruelayerWebAuth;
