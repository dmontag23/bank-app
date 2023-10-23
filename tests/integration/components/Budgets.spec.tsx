import React from "react";
import {MD3LightTheme} from "react-native-paper";
import nock from "nock";
import {fireEvent, render, screen, waitFor} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import {NavigationContainer} from "@react-navigation/native";

import Budget from "../../../components/Budgets/Budget";
import config from "../../../config.json";
import {Budget as BudgetType} from "../../../types/budget";
import {TransactionCategory} from "../../../types/transaction";
import {
  BUDGET_WITH_ONE_ITEM,
  BUDGET_WITH_TWO_ITEMS
} from "../../mocks/data/budgets";
import {TRUELAYER_MASTERCARD} from "../../mocks/trueLayer/dataAPI/data/cardData";
import {
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
} from "../../mocks/trueLayer/dataAPI/data/cardTransactionData";

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
    nock(config.integrations.trueLayer.sandboxDataUrl)
      .get("/v1/cards")
      .reply(200, {
        results: [],
        status: "Succeeded"
      });

    render(
      <NavigationContainer>
        <Budget budget={EMPTY_BUDGET} setSelectedBudget={jest.fn()} />
      </NavigationContainer>
    );

    expect(screen.getByTestId("loadingSpinner")).toBeVisible();
  });

  test("renders a budget with no items", async () => {
    nock(config.integrations.trueLayer.sandboxDataUrl)
      .get("/v1/cards")
      .reply(200, {
        results: [],
        status: "Succeeded"
      });

    render(
      <NavigationContainer>
        <Budget budget={EMPTY_BUDGET} setSelectedBudget={jest.fn()} />
      </NavigationContainer>
    );

    await waitFor(() =>
      expect(
        screen.getByText("There are no items in this budget.")
      ).toBeVisible()
    );
  });

  test("renders a budget item with no transactions", async () => {
    nock(config.integrations.trueLayer.sandboxDataUrl)
      .get("/v1/cards")
      .reply(200, {
        results: [],
        status: "Succeeded"
      });

    render(
      <NavigationContainer>
        <Budget budget={BUDGET_WITH_ONE_ITEM} setSelectedBudget={jest.fn()} />
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
    nock(config.integrations.trueLayer.sandboxDataUrl)
      .get("/v1/cards")
      .reply(200, {
        results: [TRUELAYER_MASTERCARD],
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
      .reply(200, {
        results: [
          TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
          TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
        ],
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions/pending"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions\/pending/)
      .reply(200, {
        results: [],
        status: "Succeeded"
      });

    render(
      <NavigationContainer>
        <Budget
          budget={{
            ...BUDGET_WITH_ONE_ITEM,
            items: [{...BUDGET_WITH_ONE_ITEM.items[0], cap: 150}]
          }}
          setSelectedBudget={jest.fn()}
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
    expect(
      screen.getByText(`1 Jan 2023 at 00:00 - ${TransactionCategory.BILLS}`)
    ).toBeVisible();
  });

  test("switches between budget items", async () => {
    nock(config.integrations.trueLayer.sandboxDataUrl)
      .get("/v1/cards")
      .reply(200, {
        results: [],
        status: "Succeeded"
      });

    render(
      <NavigationContainer>
        <Budget budget={BUDGET_WITH_TWO_ITEMS} setSelectedBudget={jest.fn()} />
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
