import React from "react";
import {Text} from "react-native-paper";
import {fireEvent, render, screen} from "@testing-library/react-native";

import ExpandableAccordion from "./ExpandableAccordion";

import {ComponentTestWrapper} from "../../tests/mocks/utils";

describe("ExpandableAccordion component", () => {
  test("renders an expanded accordion", async () => {
    render(
      <ExpandableAccordion title="Test title">
        <Text>Expanded</Text>
      </ExpandableAccordion>,
      {
        wrapper: ComponentTestWrapper
      }
    );

    expect(screen.getByText("Test title")).toBeVisible();
    expect(screen.getByText("Expanded")).toBeVisible();
  });

  test("accordion closes when clicked", async () => {
    render(
      <ExpandableAccordion title="Test title">
        <Text>Expanded</Text>
      </ExpandableAccordion>,
      {
        wrapper: ComponentTestWrapper
      }
    );

    expect(screen.getByText("Test title")).toBeVisible();
    const accordionChild = screen.getByText("Expanded");
    expect(accordionChild).toBeOnTheScreen();
    fireEvent.press(screen.getByText("Test title"));
    expect(accordionChild).not.toBeOnTheScreen();
  });
});
