import React from "react";
import {MD3LightTheme} from "react-native-paper";
import {fireEvent, render, screen, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import {NavigationContainer} from "@react-navigation/native";

import {trueLayerDataApi} from "../../../api/axiosConfig";
import Budget from "../../../components/Budgets/Budget";
import {Budget as BudgetType} from "../../../types/budget";
import {TransactionCategory} from "../../../types/transaction";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";
import {
  BUDGET_WITH_ONE_ITEM,
  BUDGET_WITH_TWO_ITEMS
} from "../../mocks/data/budgets";
import {
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
} from "../../mocks/trueLayer/dataAPI/data/cardData";

jest.mock("../../../api/axiosConfig");

describe("Budgets", () => {
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

    render(
      <NavigationContainer>
        <Budget budget={EMPTY_BUDGET} />
      </NavigationContainer>
    );

    expect(screen.getByTestId("loadingSpinner")).toBeVisible();
  });

  test("renders a budget with no items", async () => {
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    ).mockImplementation(async () => []);

    render(
      <NavigationContainer>
        <Budget budget={EMPTY_BUDGET} />
      </NavigationContainer>
    );

    await waitFor(() =>
      expect(
        screen.getByText("There are no items in this budget.")
      ).toBeVisible()
    );
  });

  test("renders a budget item with no transactions", async () => {
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    ).mockImplementation(async () => []);

    render(
      <NavigationContainer>
        <Budget budget={BUDGET_WITH_ONE_ITEM} />
      </NavigationContainer>
    );

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
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    ).mockImplementation(async () => [
      TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
      TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
    ]);

    render(
      <NavigationContainer>
        <Budget
          budget={{
            ...BUDGET_WITH_ONE_ITEM,
            items: [{...BUDGET_WITH_ONE_ITEM.items[0], cap: 150}]
          }}
        />
      </NavigationContainer>
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
    expect(screen.getByText("£192.52")).toBeVisible();
    expect(screen.getByText(TransactionCategory.BILLS)).toBeVisible();

    // check the transactions are filtered by the correct date
    expect(trueLayerDataApi.get).toBeCalledTimes(1);
    expect(trueLayerDataApi.get).toBeCalledWith(
      `v1/cards/2cbf9b6063102763ccbe3ea62f1b3e72/transactions?from=${new Date(
        "01-01-2023"
      ).toISOString()}&to=${new Date("01-02-2023").toISOString()}`
    );
  });

  test("switches between budget items", async () => {
    render(
      <NavigationContainer>
        <Budget budget={BUDGET_WITH_TWO_ITEMS} />
      </NavigationContainer>
    );

    await waitFor(() => expect(screen.getByText("Bills")).toBeVisible());

    // switch tabs
    const allTabs = screen.getAllByRole("tab");
    expect(allTabs.length).toBe(2);
    fireEvent.press(allTabs[1]);
    expect(screen.getByText("Fun")).toBeVisible();
  });
});
