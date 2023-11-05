import React, {ReactNode, useContext} from "react";
import {act, renderHook, waitFor} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";

import ToastContext, {
  Toast,
  ToastContextProvider,
  ToastType
} from "./toast-context";

describe("ToastContext", () => {
  const toast: Toast = {
    id: "dummy-id",
    message: "Toast message",
    type: ToastType.LOG
  };
  test("defaults values correctly", () => {
    const {result} = renderHook(() => useContext(ToastContext));

    expect(result.current.toasts).toEqual([]);
    expect(result.current.addToast).toEqual(expect.any(Function));
    expect(result.current.clearToast).toEqual(expect.any(Function));
    expect(result.current.clearAllToasts).toEqual(expect.any(Function));
    expect(result.current.addToast(toast)).toBeUndefined();
    expect(result.current.clearToast(toast.id)).toBeUndefined();
    expect(result.current.clearAllToasts()).toBeUndefined();
  });

  test("ToastContextProvider adds and clears a toast", async () => {
    const customWrapper = (children: ReactNode) => (
      <ToastContextProvider>{children}</ToastContextProvider>
    );

    const {result} = renderHook(() => useContext(ToastContext), {
      customWrapper
    });

    expect(result.current.toasts).toEqual([]);

    // add a toast
    act(() => result.current.addToast(toast));
    await waitFor(() => expect(result.current.toasts).toEqual([toast]));

    // clear a toast
    act(() => result.current.clearToast(toast.id));
    await waitFor(() => expect(result.current.toasts).toEqual([]));
  });

  test("ToastContextProvider clears all toasts", async () => {
    const customWrapper = (children: ReactNode) => (
      <ToastContextProvider>{children}</ToastContextProvider>
    );

    const {result} = renderHook(() => useContext(ToastContext), {
      customWrapper
    });

    expect(result.current.toasts).toEqual([]);

    // add 3 toasts
    const toasts = [
      toast,
      {...toast, id: "dummy-id-2"},
      {...toast, id: "dummy-id-3"}
    ];
    toasts.map(toastToAdd => act(() => result.current.addToast(toastToAdd)));
    await waitFor(() => expect(result.current.toasts).toEqual(toasts));

    // clear all toasts
    act(() => result.current.clearAllToasts());
    await waitFor(() => expect(result.current.toasts).toEqual([]));
  });
});
