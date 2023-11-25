import React from "react";
import {render, screen} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";

import CategoryIcon from "./CategoryIcon";

describe("CategoryIcon component", () => {
  test("renders icon", () => {
    render(<CategoryIcon icon="video" color="red" />);

    const avatar = screen.getByTestId("category-avatar");
    expect(avatar).toBeVisible();
    expect(avatar).toHaveStyle({backgroundColor: "red"});
  });
});
