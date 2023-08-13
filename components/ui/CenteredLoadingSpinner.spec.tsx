import React from "react";
import {describe, expect, jest, test} from "@jest/globals";
import {render, screen} from "@testing-library/react-native";

import CenteredLoadingSpinner from "./CenteredLoadingSpinner";
import LoadingSpinner from "./LoadingSpinner";

import {ComponentTestWrapper} from "../../tests/mocks/utils";

jest.mock("./LoadingSpinner");

describe("CenteredLoadingSpinner component", () => {
  test("renders a centered loading spinner correctly", () => {
    render(<CenteredLoadingSpinner />, {
      wrapper: ComponentTestWrapper
    });
    const centeredLoadingSpinnerComponent = screen.getByTestId(
      "centeredLoadingSpinner"
    );
    expect(centeredLoadingSpinnerComponent).toBeVisible();
    expect(centeredLoadingSpinnerComponent).toHaveStyle({
      flex: 1,
      justifyContent: "center"
    });
    expect(LoadingSpinner).toBeCalledTimes(1);
    expect(LoadingSpinner).toBeCalledWith({}, {});
  });
});
