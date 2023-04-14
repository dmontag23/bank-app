import React from "react";
import {render, screen} from "@testing-library/react-native";

import LoadingSpinner from "./LoadingSpinner";

import {ComponentTestWrapper} from "../tests/mocks/utils";

describe("LoadingSpinner component", () => {
  test("renders a loading spinner correctly", () => {
    render(<LoadingSpinner />, {
      wrapper: ComponentTestWrapper
    });
    expect(screen.getByTestId("loadingSpinner")).toBeVisible();
  });
});
