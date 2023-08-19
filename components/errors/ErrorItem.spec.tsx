import React from "react";
import {MD3LightTheme} from "react-native-paper";
import {describe, expect, jest, test} from "@jest/globals";
import {render, screen} from "@testing-library/react-native";

import ErrorItem from "./ErrorItem";

import {ComponentTestWrapper} from "../../tests/mocks/utils";
import {AppError} from "../../types/errors";
import ExpandableAccordion from "../ui/ExpandableAccordion";

jest.mock("../ui/ExpandableAccordion");

describe("ErrorItem component", () => {
  test("renders divider", () => {
    const testError: AppError = {id: "id-1", error: "Test error"};

    render(<ErrorItem error={testError} isSelected={false} />, {
      wrapper: ComponentTestWrapper
    });

    const divider = screen.getByTestId("error-item-divider");
    expect(divider).toBeVisible();
    expect(divider).toHaveStyle({
      backgroundColor: MD3LightTheme.colors.onErrorContainer
    });
  });

  test("renders accordion", () => {
    const testError: AppError = {id: "id-1", error: "Test error"};

    render(<ErrorItem error={testError} isSelected={false} />, {
      wrapper: ComponentTestWrapper
    });

    expect(ExpandableAccordion).toBeCalledTimes(1);
    expect(ExpandableAccordion).toBeCalledWith(
      expect.objectContaining({
        title: "Error: Test error",
        isInitiallyExpanded: false,
        icon: "exclamation-thick",
        unselectedColor: MD3LightTheme.colors.onErrorContainer,
        selectedColor: MD3LightTheme.colors.error,
        children: expect.any(Array)
      }),
      {}
    );

    const accordionChildren = (
      ExpandableAccordion as jest.MockedFunction<typeof ExpandableAccordion>
    ).mock.calls[0][0].children as JSX.Element;

    render(accordionChildren, {
      wrapper: ComponentTestWrapper
    });

    const errorDetailsText = screen.getByText("Error details:");
    expect(errorDetailsText).toBeVisible();
    expect(errorDetailsText).toHaveStyle({
      color: MD3LightTheme.colors.onErrorContainer
    });
    expect(screen.getByText(JSON.stringify(testError, null, 4))).toBeVisible();
  });
});
