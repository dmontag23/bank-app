import React from "react";
import {render, screen} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";

import LoadingSpinner from "./LoadingSpinner";

describe("LoadingSpinner component", () => {
  test("renders a loading spinner correctly", () => {
    render(<LoadingSpinner />);
    expect(screen.getByTestId("loadingSpinner")).toBeVisible();
  });
});
