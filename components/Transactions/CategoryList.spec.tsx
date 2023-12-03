import React from "react";
import {fireEvent, render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import CategoryList from "./CategoryList";

import {INITIAL_CATEGORY_MAP} from "../../constants";
import useGetCategoryMap from "../../hooks/transactions/useGetCategoryMap";
import {CategoryAssociations} from "../../types/transaction";
import CategoryIcon from "../ui/CategoryIcon";
import LoadingSpinner from "../ui/LoadingSpinner";

jest.mock("../../hooks/transactions/useGetCategoryMap");
jest.mock("../ui/CategoryIcon");
jest.mock("../ui/LoadingSpinner");

describe("CategoryList component", () => {
  test("renders loading spinner if loading the category map", () => {
    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: true,
      data: undefined
    });

    render(<CategoryList />);

    expect(LoadingSpinner).toBeCalledTimes(1);
    expect(LoadingSpinner).toBeCalledWith({}, {});
    expect(CategoryIcon).not.toBeCalled();
  });

  test("does not render a list of the category map is undefined", () => {
    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: undefined
    });

    render(<CategoryList />);

    expect(LoadingSpinner).not.toBeCalled();
    expect(CategoryIcon).not.toBeCalled();
  });

  test("renders all categories on the screen without an item press function", () => {
    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: INITIAL_CATEGORY_MAP
    });

    render(<CategoryList />);

    const categoryList = Object.keys(
      INITIAL_CATEGORY_MAP
    ) as (keyof typeof INITIAL_CATEGORY_MAP)[];
    categoryList.map(category => {
      expect(screen.getByText(category)).toBeVisible();
      expect(CategoryIcon).toBeCalledWith(INITIAL_CATEGORY_MAP[category], {});
    });

    expect(CategoryIcon).toBeCalledTimes(categoryList.length);
  });

  test("renders correctly with an item press function", () => {
    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: INITIAL_CATEGORY_MAP
    });

    const onItemPress = jest.fn();

    render(<CategoryList onItemPress={onItemPress} />);

    Object.keys(INITIAL_CATEGORY_MAP).map(category => {
      expect(screen.getByText(category)).toBeVisible();
    });

    fireEvent.press(screen.getByText("Savings"));

    expect(onItemPress).toBeCalledTimes(1);
    expect(onItemPress).toBeCalledWith("Savings");
  });

  test("sorts categories", () => {
    const creditCardCategoryAssociation: CategoryAssociations = {
      icon: "credit-card",
      color: "red"
    };
    (useGetCategoryMap as jest.MockedFunction<any>).mockReturnValueOnce({
      isLoading: false,
      data: {
        ...INITIAL_CATEGORY_MAP,
        "Credit card": creditCardCategoryAssociation
      }
    });

    render(<CategoryList />);
    // credit card should be 7th on the list
    expect(
      (CategoryIcon as jest.MockedFunction<typeof CategoryIcon>).mock
        .calls[6][0]
    ).toEqual(creditCardCategoryAssociation);
  });
});
