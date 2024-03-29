import React from "react";
import {MD3LightTheme, Text} from "react-native-paper";
import {fireEvent, render, screen} from "testing-library/extension";
import {describe, expect, test} from "@jest/globals";

import ExpandableAccordion from "./ExpandableAccordion";

describe("ExpandableAccordion component", () => {
  test("renders a closed accordion by default", async () => {
    render(
      <ExpandableAccordion title="Test title">
        <Text>Expanded</Text>
      </ExpandableAccordion>
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
      </ExpandableAccordion>
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
      </ExpandableAccordion>
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
      </ExpandableAccordion>
    );

    const accordionTitle = screen.getByText("Test title");
    expect(accordionTitle).toBeVisible();
    const accordionChild = screen.getByText("Expanded");
    expect(accordionChild).toBeOnTheScreen();

    fireEvent.press(accordionTitle);

    expect(accordionChild).not.toBeOnTheScreen();
  });

  // TODO: See if its possible to test the colors (other than the text colors already tested)
  test("accordion uses different color scheme", async () => {
    render(
      <ExpandableAccordion
        title="Test title"
        unselectedColor="red"
        selectedColor="green">
        <Text>Expanded</Text>
      </ExpandableAccordion>
    );

    const accordionTitle = screen.getByText("Test title");
    expect(accordionTitle).toHaveStyle({color: "red"});

    fireEvent.press(accordionTitle);

    expect(accordionTitle).toHaveStyle({color: "green"});
  });

  // TODO: See if there's a good way to test the icon here
  test("renders an accordion with an icon", async () => {
    render(
      <ExpandableAccordion title="Test title" icon="folder">
        <Text>Expanded</Text>
      </ExpandableAccordion>
    );

    expect(screen.getByText("Test title")).toBeVisible();
  });

  test("can add a custom header style", async () => {
    const customStyle = {backgroundColor: "green"};

    render(
      <ExpandableAccordion title="" headerStyle={customStyle}>
        <></>
      </ExpandableAccordion>
    );

    const accordion = screen.getByRole("button");
    expect(accordion).toBeVisible();
    expect(accordion).toHaveStyle(customStyle);
  });
});
