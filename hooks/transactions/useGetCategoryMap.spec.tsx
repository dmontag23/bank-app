import React, {ReactNode} from "react";
import {renderHook, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useGetCategoryMap from "./useGetCategoryMap";

import ErrorContext, {defaultErrorContext} from "../../store/error-context";
import {CategoryMap} from "../../types/transaction";

describe("useGetCategoryMap", () => {
  test("returns an empty array when called with no stored categories", async () => {
    const {result} = renderHook(() => useGetCategoryMap());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([]);
    expect(AsyncStorage.getItem).toBeCalledTimes(1);
    expect(AsyncStorage.getItem).toBeCalledWith("category-map");
  });

  test("returns stored categories", async () => {
    const categories: CategoryMap = {
      "Cardi B's Demands": {icon: "nail", color: "pink"},
      Boo: {icon: "ghost", color: "white"}
    };
    await AsyncStorage.setItem("category-map", JSON.stringify(categories));

    // setup error context mocks
    const mockRemoveError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, removeError: mockRemoveError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useGetCategoryMap(), {
      customWrapper
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(categories);
    expect(AsyncStorage.getItem).toBeCalledTimes(1);
    expect(AsyncStorage.getItem).toBeCalledWith("category-map");
    expect(mockRemoveError).toBeCalledTimes(1);
    expect(mockRemoveError).toBeCalledWith("useGetCategoryMap");
  });

  test("returns error on failed call to storage", async () => {
    // setup mock for async storage
    (
      AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>
    ).mockRejectedValueOnce("Cannot connect to async storage");

    // setup error context mocks
    const mockAddError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, addError: mockAddError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useGetCategoryMap(), {
      customWrapper
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe("Cannot connect to async storage");
    expect(mockAddError).toBeCalledTimes(1);
    expect(mockAddError).toBeCalledWith({
      id: "useGetCategoryMap",
      error: "AsyncStorage - Get category map",
      errorMessage:
        'There was a problem getting the category map from AsyncStorage: "Cannot connect to async storage"'
    });
  });
});
