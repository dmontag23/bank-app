import React from "react";
import {MD3LightTheme} from "react-native-paper";
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native";

import {trueLayerDataApi} from "../../../axiosConfig";
import Budget from "../../../components/Budgets/Budget";
import {Budget as BudgetType} from "../../../types/budget";
import {TransactionCategory} from "../../../types/transaction";
import {
  BUDGET_WITH_ONE_ITEM,
  BUDGET_WITH_TWO_ITEMS
} from "../../mocks/data/budgets";
import {
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
} from "../../mocks/trueLayer/dataAPI/data/cardData";
import {ComponentTestWrapper} from "../../mocks/utils";

jest.mock("../../../axiosConfig");

describe("Budgets", () => {
  // needed for animated components
  // see https://github.com/jestjs/jest/issues/6434
  // TODO: Should probably refactor this into setup file
  // beforeEach(() => jest.useFakeTimers());

  const EMPTY_BUDGET: BudgetType = {
    id: "1",
    name: "",
    window: {
      start: new Date("2023-01-01"),
      end: new Date("2023-01-31")
    },
    items: []
  };

  test("renders a loading spinner", () => {
    // TODO: Can probably refactor this across all tests to have a
    // helper where you just pass in the implementation for the data
    // mock
    (
      trueLayerDataApi as jest.MockedObject<typeof trueLayerDataApi>
    ).get.mockImplementation(async () => new Promise(() => {}));

    render(<Budget budget={EMPTY_BUDGET} />, {
      wrapper: ComponentTestWrapper
    });

    expect(screen.getByTestId("loadingSpinner")).toBeVisible();

    // TODO: This should be done at the end of every file, or
    // I should find a way of clearing the mocks after all tests
    // in the setup file
    (
      trueLayerDataApi as jest.MockedObject<typeof trueLayerDataApi>
    ).get.mockReset();
  });

  test("renders a budget with no items", async () => {
    render(<Budget budget={EMPTY_BUDGET} />, {
      wrapper: ComponentTestWrapper
    });

    await waitFor(() =>
      expect(
        screen.getByText("There are no items in this budget.")
      ).toBeVisible()
    );
  });

  test("renders a budget item with no transactions", async () => {
    render(<Budget budget={BUDGET_WITH_ONE_ITEM} />, {
      wrapper: ComponentTestWrapper
    });

    // Budget summary
    await waitFor(() => expect(screen.getByText("Bills")).toBeVisible());
    expect(screen.getByText("£500.00")).toBeVisible();
    expect(screen.getByText("left of £500.00")).toBeVisible();
    const progressBar = screen.getByTestId("budgetItemSummaryProgressBar");
    expect(progressBar).toBeVisible();
    expect(progressBar.children[0]).toHaveStyle({
      backgroundColor: MD3LightTheme.colors.primaryContainer
    });

    // Transactions
    expect(
      screen.getByText(
        "There are currently no transactions for this budget item."
      )
    ).toBeVisible();
  });

  test("renders a budget item with transactions over cap", async () => {
    // TODO: Can probably refactor this across all tests to have a
    // helper where you just pass in the implementation for the data
    // mock
    (
      trueLayerDataApi as jest.MockedObject<typeof trueLayerDataApi>
    ).get.mockImplementation(async () => [
      TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
    ]);

    render(
      <Budget
        budget={{
          ...BUDGET_WITH_ONE_ITEM,
          items: [{...BUDGET_WITH_ONE_ITEM.items[0], cap: 150}]
        }}
      />,
      {
        wrapper: ComponentTestWrapper
      }
    );

    // Budget summary
    await waitFor(() => expect(screen.getByText("Bills")).toBeVisible());
    expect(screen.getByText("£-42.52")).toBeVisible();
    expect(screen.getByText("left of £150.00")).toBeVisible();
    const progressBar = screen.getByTestId("budgetItemSummaryProgressBar");
    expect(progressBar).toBeVisible();
    expect(progressBar.children[0]).toHaveStyle({
      backgroundColor: MD3LightTheme.colors.errorContainer,
      borderColor: MD3LightTheme.colors.error,
      borderWidth: 1
    });

    // Transactions
    expect(screen.getByText("PAY OFF CREDIT CARD BILL")).toBeVisible();
    expect(screen.getByText("192.52")).toBeVisible();
    expect(screen.getByText(TransactionCategory.BILLS)).toBeVisible();
  });

  test("switches between budget items", async () => {
    render(<Budget budget={BUDGET_WITH_TWO_ITEMS} />, {
      wrapper: ComponentTestWrapper
    });

    await waitFor(() => expect(screen.getByText("Bills")).toBeVisible());

    // switch tabs
    const allTabs = screen.getAllByRole("tab");
    expect(allTabs.length).toBe(2);
    fireEvent.press(allTabs[1]);
    expect(screen.getByText("Fun")).toBeVisible();
  });
});