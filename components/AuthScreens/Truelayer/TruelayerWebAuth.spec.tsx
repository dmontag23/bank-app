import React from "react";
import WebView from "react-native-webview";
import {render} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";

import TruelayerWebAuth from "./TruelayerWebAuth";

import config from "../../../config.json";

describe("TruelayerWebAuth component", () => {
  test("renders components", () => {
    render(<TruelayerWebAuth />);

    expect(WebView).toBeCalledTimes(1);
    expect(WebView).toBeCalledWith(
      {
        source: {uri: config.integrations.trueLayer.authLink},
        hideKeyboardAccessoryView: true
      },
      {}
    );
  });
});
