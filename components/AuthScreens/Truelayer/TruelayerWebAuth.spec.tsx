import React from "react";
import Config from "react-native-config";
import WebView from "react-native-webview";
import {render} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";

import TruelayerWebAuth from "./TruelayerWebAuth";

describe("TruelayerWebAuth component", () => {
  test("renders components", () => {
    render(<TruelayerWebAuth />);

    expect(WebView).toBeCalledTimes(1);
    expect(WebView).toBeCalledWith(
      {
        source: {uri: Config.TRUELAYER_OAUTH_URL},
        hideKeyboardAccessoryView: true
      },
      {}
    );
  });
});
