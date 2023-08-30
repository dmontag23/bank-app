import React from "react";
import {fireEvent, render, screen} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";

import ErrorItem from "./ErrorItem";
import ErrorModal from "./ErrorModal";

import ErrorContext from "../../store/error-context";
import {AppError} from "../../types/errors";

jest.mock("./ErrorItem");

// TODO: maybe find a way of testing you can click off a modal to close it

describe("ErrorModal component", () => {
  const defaultErrorContextValue = {
    errors: [],
    addError: () => {},
    removeError: () => {},
    errorModal: {
      isVisible: true,
      showModal: () => {},
      hideModal: () => {}
    }
  };

  test("does not render the modal if it is not visible", () => {
    render(
      <ErrorContext.Provider
        value={{
          ...defaultErrorContextValue,
          errorModal: {...defaultErrorContextValue.errorModal, isVisible: false}
        }}>
        <ErrorModal />
      </ErrorContext.Provider>
    );

    expect(screen.queryByText("Errors")).toBeNull();
  });

  test("renders no errors message", () => {
    render(
      <ErrorContext.Provider value={defaultErrorContextValue}>
        <ErrorModal />
      </ErrorContext.Provider>
    );

    expect(screen.getByText("Errors")).toBeVisible();
    expect(screen.getByText("No detected errors in the app 🥳")).toBeVisible();
  });

  test("renders error items", () => {
    const testError1: AppError = {id: "id-1", error: "Test error"};
    const testError2: AppError = {id: "id-2", error: "Test error 2"};

    render(
      <ErrorContext.Provider
        value={{
          ...defaultErrorContextValue,
          errors: [testError1, testError2],
          errorModal: {
            ...defaultErrorContextValue.errorModal,
            selectedErrorId: "id-2"
          }
        }}>
        <ErrorModal />
      </ErrorContext.Provider>
    );

    expect(screen.getByText("Errors")).toBeVisible();
    expect(ErrorItem).toBeCalledTimes(2);
    expect(ErrorItem).toBeCalledWith(
      {error: testError1, isSelected: false},
      {}
    );
    expect(ErrorItem).toBeCalledWith({error: testError2, isSelected: true}, {});
  });

  // TODO: Maybe come back and test styles on button and container somehow?
  test("can close modal via button", () => {
    const mockHideModal = jest.fn();
    render(
      <ErrorContext.Provider
        value={{
          ...defaultErrorContextValue,
          errorModal: {
            ...defaultErrorContextValue.errorModal,
            hideModal: mockHideModal
          }
        }}>
        <ErrorModal />
      </ErrorContext.Provider>
    );

    const closeButton = screen.getByText("Close");
    expect(closeButton).toBeVisible();

    fireEvent.press(closeButton);

    expect(mockHideModal).toBeCalledTimes(1);
    expect(mockHideModal).toBeCalledWith();
  });
});
