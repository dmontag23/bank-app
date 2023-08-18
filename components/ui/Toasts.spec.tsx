import React from "react";
import {describe, expect, jest, test} from "@jest/globals";
import {render} from "@testing-library/react-native";

import Toast from "./Toast";
import Toasts from "./Toasts";

import ToastContext, {
  Toast as ToastObjectType,
  ToastType
} from "../../store/toast-context";
import {ComponentTestWrapper} from "../../tests/mocks/utils";

jest.mock("./Toast");

describe("Toasts component", () => {
  test("renders toasts correctly", () => {
    const toast1: ToastObjectType = {
      id: "id-1",
      message: "First message",
      type: ToastType.LOG
    };

    const toast2: ToastObjectType = {
      id: "id-2",
      message: "Second message",
      type: ToastType.ERROR
    };

    render(
      <ToastContext.Provider
        value={{
          toasts: [toast1, toast2],
          addToast: () => {},
          clearToast: () => {},
          clearAllToasts: () => {}
        }}>
        <Toasts />
      </ToastContext.Provider>,
      {
        wrapper: ComponentTestWrapper
      }
    );

    expect(Toast).toBeCalledTimes(2);
    expect(Toast).toBeCalledWith({toast: toast1}, {});
    expect(Toast).toBeCalledWith({toast: toast2}, {});
  });
});
