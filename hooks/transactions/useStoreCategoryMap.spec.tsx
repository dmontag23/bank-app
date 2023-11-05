import React, {ReactNode} from "react";
import {
  createQueryClient,
  renderHook,
  waitFor
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";

import useStoreCategoryMap from "./useStoreCategoryMap";

import ErrorContext, {defaultErrorContext} from "../../store/error-context";
import ToastContext, {ToastType} from "../../store/toast-context";
import {CategoryMap} from "../../types/transaction";

jest.mock("uuid", () => ({
  v4: () => "unique-id"
}));

describe("useStoreCategoryMap", () => {
  test("does nothing when called with an empty map", async () => {
    const mockAddToast = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ToastContext.Provider
        value={{
          toasts: [],
          addToast: mockAddToast,
          clearToast: () => {},
          clearAllToasts: () => {}
        }}>
        {children}
      </ToastContext.Provider>
    );

    const {result} = renderHook(() => useStoreCategoryMap(), {
      customWrapper
    });
    result.current.mutate({});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({});
    expect(AsyncStorage.getItem).toBeCalledTimes(1);
    expect(AsyncStorage.getItem).toBeCalledWith("category-map");
    expect(AsyncStorage.setItem).not.toBeCalled();
    expect(AsyncStorage.setItem).not.toBeCalled();
    expect(await AsyncStorage.getItem("category-map")).toBeNull();
    expect(mockAddToast).not.toBeCalled();
  });

  test("stores category correctly", async () => {
    // put some test data in the cache
    const queryClient = createQueryClient();
    const queryKey = ["categoryMap"];
    queryClient.setQueryData<CategoryMap>(queryKey, () => ({}));

    const mockRemoveError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, removeError: mockRemoveError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useStoreCategoryMap(), {
      customWrapper,
      queryClient
    });
    const newCategory: CategoryMap = {
      "New category": {icon: "new", color: "red"}
    };
    result.current.mutate(newCategory);

    // check the category is stored correctly
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(newCategory);
    expect(AsyncStorage.getItem).toBeCalledTimes(1);
    expect(AsyncStorage.getItem).toBeCalledWith("category-map");
    expect(AsyncStorage.setItem).toBeCalledTimes(1);
    expect(AsyncStorage.setItem).toBeCalledWith(
      "category-map",
      JSON.stringify(newCategory)
    );
    expect(await AsyncStorage.getItem("category-map")).toBe(
      JSON.stringify(newCategory)
    );

    // check that any previous errors are removed
    expect(mockRemoveError).toBeCalledTimes(1);
    expect(mockRemoveError).toBeCalledWith("useStoreCategoryMap");

    // check that the category map query is invalidated
    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);
  });

  test("category is appended to previous category map", async () => {
    const originalCategory: CategoryMap = {
      "Cardi B": {icon: "nails", color: "pink"}
    };
    await AsyncStorage.setItem(
      "category-map",
      JSON.stringify(originalCategory)
    );

    const {result} = renderHook(() => useStoreCategoryMap());
    const newCategory: CategoryMap = {
      "Lady Gaga": {icon: "microphone", color: "white"}
    };
    result.current.mutate(newCategory);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(newCategory);
    expect(await AsyncStorage.getItem("category-map")).toBe(
      JSON.stringify({...originalCategory, ...newCategory})
    );
  });

  test("does not store an existing category", async () => {
    const oldCategory: CategoryMap = {
      " Lady Gaga    ": {icon: "microphone", color: "white"}
    };
    await AsyncStorage.setItem("category-map", JSON.stringify(oldCategory));

    const mockAddToast = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ToastContext.Provider
        value={{
          toasts: [],
          addToast: mockAddToast,
          clearToast: () => {},
          clearAllToasts: () => {}
        }}>
        {children}
      </ToastContext.Provider>
    );

    const {result} = renderHook(() => useStoreCategoryMap(), {
      customWrapper
    });
    result.current.mutate({"  LADY GAgA  ": {icon: "star", color: "purple"}});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({});
    expect(await AsyncStorage.getItem("category-map")).toBe(
      JSON.stringify(oldCategory)
    );
    expect(mockAddToast).toBeCalledTimes(1);
    expect(mockAddToast).toBeCalledWith({
      id: "unique-id",
      message:
        "LADY GAgA already exist(s). Please choose unique category names.",
      type: ToastType.WARNING
    });
  });

  test("does not display toast when do not display warning is set", async () => {
    const oldCategory: CategoryMap = {
      " Lady Gaga    ": {icon: "microphone", color: "white"}
    };
    await AsyncStorage.setItem("category-map", JSON.stringify(oldCategory));

    const mockAddToast = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ToastContext.Provider
        value={{
          toasts: [],
          addToast: mockAddToast,
          clearToast: () => {},
          clearAllToasts: () => {}
        }}>
        {children}
      </ToastContext.Provider>
    );

    const {result} = renderHook(
      () => useStoreCategoryMap({showWarningOnDuplicateCategory: false}),
      {
        customWrapper
      }
    );
    result.current.mutate({"  LADY GAgA  ": {icon: "star", color: "purple"}});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({});
    expect(await AsyncStorage.getItem("category-map")).toBe(
      JSON.stringify(oldCategory)
    );
    expect(mockAddToast).not.toBeCalled();
  });

  test("stores multiple new categories", async () => {
    const oldCategoryMap: CategoryMap = {
      "Lady Gaga": {icon: "diva", color: "blonde"},
      "Beyoncé!": {icon: "boots", color: "red"}
    };
    await AsyncStorage.setItem("category-map", JSON.stringify(oldCategoryMap));

    const mockAddToast = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ToastContext.Provider
        value={{
          toasts: [],
          addToast: mockAddToast,
          clearToast: () => {},
          clearAllToasts: () => {}
        }}>
        {children}
      </ToastContext.Provider>
    );

    const {result} = renderHook(() => useStoreCategoryMap(), {
      customWrapper
    });
    const cardiBCategoryMap: CategoryMap = {
      "Cardi B": {icon: "nails", color: "pink"}
    };
    result.current.mutate({
      " Beyoncé! ": {icon: "block", color: "yellow"},
      "  LADY GAGA ": {icon: "hair", color: "black"},
      ...cardiBCategoryMap
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(cardiBCategoryMap);
    expect(await AsyncStorage.getItem("category-map")).toBe(
      JSON.stringify({...oldCategoryMap, ...cardiBCategoryMap})
    );
    expect(mockAddToast).toBeCalledTimes(1);
    expect(mockAddToast).toBeCalledWith({
      id: "unique-id",
      message:
        "Beyoncé! and LADY GAGA already exist(s). Please choose unique category names.",
      type: ToastType.WARNING
    });
  });

  test("errors on failed storage call", async () => {
    (
      AsyncStorage.multiSet as jest.MockedFunction<typeof AsyncStorage.multiSet>
    ).mockRejectedValueOnce("Cannot connect to async storage");

    // put some test data in the cache
    const queryClient = createQueryClient();
    const queryKey = ["categoryMap"];
    const previousCachedCategoryMap = ["Evanescence"];
    queryClient.setQueryData<string[]>(
      queryKey,
      () => previousCachedCategoryMap
    );

    const mockAddError = jest.fn();

    const customWrapper = (children: ReactNode) => (
      <ErrorContext.Provider
        value={{...defaultErrorContext, addError: mockAddError}}>
        {children}
      </ErrorContext.Provider>
    );

    const {result} = renderHook(() => useStoreCategoryMap(), {
      queryClient,
      customWrapper
    });
    result.current.mutate({"Within Temptation": {icon: "metal", color: "red"}});

    // check the hook is in an error state
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe("Cannot connect to async storage");

    // check the cached data has not changed but has been invalidated
    expect(queryClient.getQueryData(queryKey)).toEqual(
      previousCachedCategoryMap
    );
    expect(queryClient.getQueryState(queryKey)?.isInvalidated).toBe(true);

    // check the error has been added correctly
    expect(mockAddError).toBeCalledTimes(1);
    expect(mockAddError).toBeCalledWith({
      id: "useStoreCategoryMap",
      error: "AsyncStorage - Store category map",
      errorMessage:
        'There was a problem storing the category map in AsyncStorage: "Cannot connect to async storage"'
    });
  });
});
