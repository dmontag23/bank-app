import React from "react";
import WebView from "react-native-webview";
import {describe, expect, test} from "@jest/globals";
import {render} from "@testing-library/react-native";

import TruelayerWebAuth from "./TruelayerWebAuth";

import config from "../../../config.json";
import {ComponentTestWrapper} from "../../../tests/mocks/utils";

describe("TruelayerWebAuth component", () => {
  test("renders components", () => {
    render(<TruelayerWebAuth />, {
      wrapper: ComponentTestWrapper
    });

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
