import React from "react";
import {render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import CenteredLoadingSpinner from "./CenteredLoadingSpinner";
import LoadingSpinner from "./LoadingSpinner";

jest.mock("./LoadingSpinner");

describe("CenteredLoadingSpinner component", () => {
  test("renders a centered loading spinner correctly", () => {
    render(<CenteredLoadingSpinner />);
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
