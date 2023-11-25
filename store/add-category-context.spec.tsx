import React, {ReactNode, useContext} from "react";
import {act, renderHook, waitFor} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";

import AddCategoryContext, {
  AddCategoryContextProvider
} from "./add-category-context";

describe("AddCategoryContext", () => {
  test("defaults values correctly", () => {
    const {result} = renderHook(() => useContext(AddCategoryContext));

    expect(result.current.isVisible).toBe(false);
    expect(result.current.showModal).toEqual(expect.any(Function));
    expect(result.current.hideModal).toEqual(expect.any(Function));
    expect(result.current.showModal()).toBeUndefined();
    expect(result.current.hideModal()).toBeUndefined();
  });

  test("AddCategoryContextProvider shows and hides error modal", async () => {
    const customWrapper = (children: ReactNode) => (
      <AddCategoryContextProvider>{children}</AddCategoryContextProvider>
    );

    const {result} = renderHook(() => useContext(AddCategoryContext), {
      customWrapper
    });

    expect(result.current.isVisible).toBe(false);

    // show the modal
    act(() => result.current.showModal());
    await waitFor(() => expect(result.current.isVisible).toBe(true));

    // hide the modal
    act(() => result.current.hideModal());
    await waitFor(() => expect(result.current.isVisible).toBe(false));
  });
});
