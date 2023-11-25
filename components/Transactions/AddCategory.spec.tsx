import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import AddCategory from "./AddCategory";

import useStoreCategoryMap from "../../hooks/transactions/useStoreCategoryMap";
import AddCategoryContext from "../../store/add-category-context";
import ColorPicker from "../ColorPicker/ColorPicker";
import FilterableIconList from "../Icons/FilterableIconList";

jest.mock("../../hooks/transactions/useStoreCategoryMap");
jest.mock("../ColorPicker/ColorPicker");
jest.mock("../Icons/FilterableIconList");

describe("AddCategory component", () => {
  test("modal is not visible", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useStoreCategoryMap as jest.MockedFunction<any>).mockReturnValue({
      mutate: jest.fn()
    });

    render(
      <AddCategoryContext.Provider
        value={{isVisible: false, showModal: jest.fn(), hideModal: jest.fn()}}>
        <AddCategory />
      </AddCategoryContext.Provider>
    );

    expect(screen.queryByText("Add category")).toBeNull();
  });

  test("initial form elements are rendered", () => {
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useStoreCategoryMap as jest.MockedFunction<any>).mockReturnValue({
      mutate: jest.fn()
    });

    render(
      <AddCategoryContext.Provider
        value={{isVisible: true, showModal: jest.fn(), hideModal: jest.fn()}}>
        <AddCategory />
      </AddCategoryContext.Provider>
    );

    expect(screen.getByText("Add category")).toBeVisible();
    expect(screen.getByLabelText("Category name")).toBeVisible();
    expect(FilterableIconList).toBeCalledTimes(1);
    expect(FilterableIconList).toBeCalledWith(
      {onIconPress: expect.any(Function)},
      {}
    );
    expect(ColorPicker).toBeCalledTimes(1);
    expect(ColorPicker).toBeCalledWith(
      {iconName: "", onColorChange: expect.any(Function)},
      {}
    );
    expect(screen.getByText("Cancel")).toBeVisible();
    expect(screen.getByText("Save")).toBeVisible();
  });

  test("can cancel a category creation", async () => {
    const mockStoreCategory = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useStoreCategoryMap as jest.MockedFunction<any>).mockReturnValue({
      mutate: mockStoreCategory
    });
    const mockHideModal = jest.fn();

    render(
      <AddCategoryContext.Provider
        value={{
          isVisible: true,
          showModal: jest.fn(),
          hideModal: mockHideModal
        }}>
        <AddCategory />
      </AddCategoryContext.Provider>
    );

    // set the category name
    const categoryNameField = screen.getByLabelText("Category name");
    fireEvent.changeText(categoryNameField, "Boyfriend");
    expect(categoryNameField).toHaveProp("value", "Boyfriend");

    // set the icon
    expect(FilterableIconList).toBeCalledTimes(1);
    const iconChangeHandler =
      (FilterableIconList as jest.MockedFunction<typeof FilterableIconList>)
        .mock.calls[0][0].onIconPress ?? jest.fn();
    act(() => {
      iconChangeHandler("wall");
    });

    // set the color
    expect(ColorPicker).toBeCalledTimes(2);
    const colorPickerProps = (
      ColorPicker as jest.MockedFunction<typeof ColorPicker>
    ).mock.calls[1][0];
    expect(colorPickerProps.iconName).toBe("wall");
    act(() => {
      (colorPickerProps.onColorChange ?? jest.fn())("green");
    });

    // cancel the form
    const cancelButton = screen.getByText("Cancel");
    expect(cancelButton).toBeVisible();
    fireEvent.press(cancelButton);

    // check that the modal is hidden
    expect(mockHideModal).toBeCalledTimes(1);
    expect(mockHideModal).toBeCalledWith();

    // check the values are reset
    const saveButton = screen.getByText("Save");
    expect(saveButton).toBeVisible();
    fireEvent.press(saveButton);
    await waitFor(() => expect(mockStoreCategory).toBeCalledTimes(1));
    expect(mockStoreCategory).toBeCalledWith({
      [""]: {icon: "", color: "hsl(0, 100%, 50%)"}
    });
  });

  test("can save a new category", async () => {
    const mockStoreCategory = jest.fn();
    // TODO: any should probably not be used as a type here, but since a
    // query from tanstack query returns a whole bunch of non-optional things,
    // it's quicker than returning all those things for now
    (useStoreCategoryMap as jest.MockedFunction<any>).mockReturnValue({
      mutate: mockStoreCategory
    });
    const mockHideModal = jest.fn();

    render(
      <AddCategoryContext.Provider
        value={{
          isVisible: true,
          showModal: jest.fn(),
          hideModal: mockHideModal
        }}>
        <AddCategory />
      </AddCategoryContext.Provider>
    );

    // set the category name
    const categoryNameField = screen.getByLabelText("Category name");
    fireEvent.changeText(categoryNameField, "Boyfriend");
    expect(categoryNameField).toHaveProp("value", "Boyfriend");

    // set the icon
    expect(FilterableIconList).toBeCalledTimes(1);
    const iconChangeHandler =
      (FilterableIconList as jest.MockedFunction<typeof FilterableIconList>)
        .mock.calls[0][0].onIconPress ?? jest.fn();
    act(() => {
      iconChangeHandler("wall");
    });

    // set the color
    expect(ColorPicker).toBeCalledTimes(2);
    const colorPickerProps = (
      ColorPicker as jest.MockedFunction<typeof ColorPicker>
    ).mock.calls[1][0];
    expect(colorPickerProps.iconName).toBe("wall");
    act(() => {
      (colorPickerProps.onColorChange ?? jest.fn())("green");
    });

    // submit the form
    const saveButton = screen.getByText("Save");
    expect(saveButton).toBeVisible();
    fireEvent.press(saveButton);
    await waitFor(() => expect(mockStoreCategory).toBeCalledTimes(1));
    expect(mockStoreCategory).toBeCalledWith({
      ["Boyfriend"]: {icon: "wall", color: "green"}
    });

    // check that the modal is hidden
    expect(mockHideModal).toBeCalledTimes(1);
    expect(mockHideModal).toBeCalledWith();

    // check the values are reset
    fireEvent.press(saveButton);
    await waitFor(() => expect(mockStoreCategory).toBeCalledTimes(2));
    expect(mockStoreCategory).toBeCalledWith({
      [""]: {icon: "", color: "hsl(0, 100%, 50%)"}
    });
  });
});
