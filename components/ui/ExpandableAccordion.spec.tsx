import React from "react";
import {MD3LightTheme, Text} from "react-native-paper";
import {describe, expect, test} from "@jest/globals";
import {fireEvent, render, screen} from "@testing-library/react-native";

import ExpandableAccordion from "./ExpandableAccordion";

import {ComponentTestWrapper} from "../../tests/mocks/utils";

// TODO: See if there's a good way to test the icon here
// Also see if its possible to test the colors (other than the text colors already tested)

describe("ExpandableAccordion component", () => {
  test("renders a closed accordion by default", async () => {
    render(
      <ExpandableAccordion title="Test title">
        <Text>Expanded</Text>
      </ExpandableAccordion>,
      {
        wrapper: ComponentTestWrapper
      }
    );

    const titleText = screen.getByText("Test title");
    expect(titleText).toBeVisible();
    expect(titleText).toHaveStyle({color: MD3LightTheme.colors.onSurface});

    expect(screen.queryByText("Expanded")).toBeNull();
  });

  test("renders an expanded accordion", async () => {
    render(
      <ExpandableAccordion title="Test title" isInitiallyExpanded>
        <Text>Expanded</Text>
      </ExpandableAccordion>,
      {
        wrapper: ComponentTestWrapper
      }
    );

    const titleText = screen.getByText("Test title");
    expect(titleText).toBeVisible();
    expect(titleText).toHaveStyle({color: MD3LightTheme.colors.primary});

    expect(screen.getByText("Expanded")).toBeVisible();
  });

  test("accordion opens when clicked", async () => {
    render(
      <ExpandableAccordion title="Test title">
        <Text>Expanded</Text>
      </ExpandableAccordion>,
      {
        wrapper: ComponentTestWrapper
      }
    );

    const accordionTitle = screen.getByText("Test title");
    expect(accordionTitle).toBeVisible();
    expect(screen.queryByText("Expanded")).toBeNull();

    fireEvent.press(accordionTitle);

    expect(screen.getByText("Expanded")).toBeVisible();
  });

  test("accordion closes when clicked", async () => {
    render(
      <ExpandableAccordion title="Test title" isInitiallyExpanded>
        <Text>Expanded</Text>
      </ExpandableAccordion>,
      {
        wrapper: ComponentTestWrapper
      }
    );

    const accordionTitle = screen.getByText("Test title");
    expect(accordionTitle).toBeVisible();
    const accordionChild = screen.getByText("Expanded");
    expect(accordionChild).toBeOnTheScreen();

    fireEvent.press(accordionTitle);

    expect(accordionChild).not.toBeOnTheScreen();
  });

  test("accordion uses different color scheme", async () => {
    render(
      <ExpandableAccordion
        title="Test title"
        unselectedColor="red"
        selectedColor="green">
        <Text>Expanded</Text>
      </ExpandableAccordion>,
      {
        wrapper: ComponentTestWrapper
      }
    );

    const accordionTitle = screen.getByText("Test title");
    expect(accordionTitle).toHaveStyle({color: "red"});

    fireEvent.press(accordionTitle);

    expect(accordionTitle).toHaveStyle({color: "green"});
  });
});
