import React from "react";
import {render, screen} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";

import CategoryIcon from "./CategoryIcon";

import {TransactionCategory} from "../../types/transaction";

describe("CategoryIcon component", () => {
  const categoryData = [
    {
      category: TransactionCategory.BILLS,
      expectedBackgroundColor: "red"
    },
    {
      category: TransactionCategory.EATING_OUT,
      expectedBackgroundColor: "orange"
    },
    {
      category: TransactionCategory.ENTERTAINMENT,
      expectedBackgroundColor: "blue"
    },
    {
      category: TransactionCategory.SAVINGS,
      expectedBackgroundColor: "green"
    },
    {
      category: TransactionCategory.UNKNOWN,
      expectedBackgroundColor: "grey"
    }
  ];
  test.each(categoryData)(
    "renders all elements",
    ({category, expectedBackgroundColor}) => {
      render(<CategoryIcon category={category as TransactionCategory} />);

      const avatar = screen.getByTestId("category-avatar");
      expect(avatar).toBeVisible();
      expect(avatar).toHaveStyle({backgroundColor: expectedBackgroundColor});
    }
  );
});
