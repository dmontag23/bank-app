import React from "react";
import {fireEvent, render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import CategoryList from "./CategoryList";

import {TransactionCategory} from "../../types/transaction";
import CategoryIcon from "../ui/CategoryIcon";

jest.mock("../ui/CategoryIcon");

describe("CategoryList component", () => {
  test("renders all categories on the screen without an item press function", () => {
    render(<CategoryList />);

    const categoryList = Object.keys(TransactionCategory);
    categoryList.map(category => {
      expect(screen.getByText(category)).toBeVisible();
      expect(CategoryIcon).toBeCalledWith(
        {
          category:
            TransactionCategory[category as keyof typeof TransactionCategory]
        },
        {}
      );
    });

    expect(CategoryIcon).toBeCalledTimes(categoryList.length);
  });

  test("renders correctly with an item press function", () => {
    const onItemPress = jest.fn();

    render(<CategoryList onItemPress={onItemPress} />);

    Object.keys(TransactionCategory).map(category => {
      expect(screen.getByText(category)).toBeVisible();
    });

    fireEvent.press(screen.getByText("SAVINGS"));

    expect(onItemPress).toBeCalledTimes(1);
    expect(onItemPress).toBeCalledWith(TransactionCategory.SAVINGS);
  });
});
