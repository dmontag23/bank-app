import React from "react";
import {render, screen} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";

import ReanimatedCircle from "./ReanimatedCircle";

describe("ReanimatedCircle component", () => {
  test("renders without optional props", () => {
    render(<ReanimatedCircle circle={{radius: 2, center: undefined}} />);

    const circle = screen.getByLabelText("circle");
    expect(circle).toBeVisible();
    expect(circle).toHaveAnimatedStyle({
      height: 4,
      width: 4,
      borderRadius: 2,
      left: -2,
      top: -2
    });

    expect(screen.queryByLabelText("circleIcon")).toBeNull();
  });

  test("renders with optional props", () => {
    render(
      <ReanimatedCircle
        circle={{radius: 2, center: {x: 10, y: 20}}}
        iconName="wall"
        style={{flex: 1}}
      />
    );

    const circle = screen.getByLabelText("circle");
    expect(circle).toBeVisible();
    expect(circle).toHaveAnimatedStyle({
      height: 4,
      width: 4,
      borderRadius: 2,
      left: 8,
      top: 18,
      flex: 1
    });

    const circleIcon = screen.getByLabelText("circleIcon");
    expect(circleIcon).toBeVisible();
    expect(circleIcon).toHaveStyle({
      position: "absolute",
      left: 9,
      top: 19,
      color: "white"
    });
  });
});
