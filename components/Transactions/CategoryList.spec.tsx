import React from "react";
import {fireEvent, render, screen} from "@testing-library/react-native";

import CategoryList from "./CategoryList";

import {TransactionCategory} from "../../types/transaction";

describe("CategoryList component", () => {
  test("renders all categories on the screen without an item press function", () => {
    render(<CategoryList />);

    Object.keys(TransactionCategory).map(category => {
      expect(screen.getByText(category)).toBeVisible();
    });
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
