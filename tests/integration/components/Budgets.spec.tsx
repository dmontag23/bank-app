import React from "react";
import {MD3LightTheme} from "react-native-paper";
import nock from "nock";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from "testing-library/extension";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {NavigationContainer} from "@react-navigation/native";

import Budget from "../../../components/Budgets/Budget";
import Config from "../../../config.json";
import {INITIAL_CATEGORY_MAP} from "../../../constants";
import {STARLING_ACCOUNT_1} from "../../../mock-server/starling/data/accountData";
import {
  STARLING_FEED_ITEM_1,
  STARLING_FEED_ITEM_2
} from "../../../mock-server/starling/data/feedData";
import {TRUELAYER_MASTERCARD} from "../../../mock-server/truelayer/data/cardData";
import {
  TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
} from "../../../mock-server/truelayer/data/cardTransactionData";
import {Budget as BudgetType} from "../../../types/budget";
import {Category} from "../../../types/transaction";
import {
  BUDGET_WITH_ONE_ITEM,
  BUDGET_WITH_TWO_ITEMS
} from "../../mocks/data/budgets";

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
    nock(Config.STARLING_API_URL)
      .get("/v2/accounts")
      .reply(200, {accounts: []});

    nock(Config.TRUELAYER_DATA_API_URL).get("/v1/cards").reply(200, {
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
    nock(Config.STARLING_API_URL)
      .get("/v2/accounts")
      .reply(200, {accounts: []});

    nock(Config.TRUELAYER_DATA_API_URL).get("/v1/cards").reply(200, {
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
    nock(Config.STARLING_API_URL)
      .get("/v2/accounts")
      .reply(200, {accounts: []});

    nock(Config.TRUELAYER_DATA_API_URL).get("/v1/cards").reply(200, {
      results: [],
      status: "Succeeded"
    });

    render(
      <NavigationContainer>
        <Budget budget={BUDGET_WITH_ONE_ITEM} setSelectedBudget={jest.fn()} />
      </NavigationContainer>
    );

    // Budget summary
    await waitFor(() => expect(screen.getByText("Bill Item")).toBeVisible());
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
    nock(Config.STARLING_API_URL)
      .get("/v2/accounts")
      .reply(200, {accounts: [STARLING_ACCOUNT_1]})
      // matches any url of the form "v2/feed/account/<uuid>/category/<uuid>/transactions-between"
      .get(
        /\/v2\/feed\/account\/([0-9a-z-]+)\/category\/([0-9a-z-]+)\/transactions-between/
      )
      .reply(200, {feedItems: [STARLING_FEED_ITEM_2]});

    nock(Config.TRUELAYER_DATA_API_URL)
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
    await waitFor(() => expect(screen.getByText("Bill Item")).toBeVisible());
    expect(screen.getByText("£-43.02")).toBeVisible();
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
    expect(screen.getByText("Jan 01 2023 at 00:00 - Bills")).toBeVisible();
    expect(
      screen.getByText(STARLING_FEED_ITEM_2.counterPartyName)
    ).toBeVisible();
    expect(screen.getByText("£0.50")).toBeVisible();
    expect(screen.getByText("Jan 01 2020 at 00:00 - Bills")).toBeVisible();
  });

  test("switches between budget items", async () => {
    nock(Config.STARLING_API_URL)
      .get("/v2/accounts")
      .reply(200, {accounts: []});

    nock(Config.TRUELAYER_DATA_API_URL).get("/v1/cards").reply(200, {
      results: [],
      status: "Succeeded"
    });

    render(
      <NavigationContainer>
        <Budget budget={BUDGET_WITH_TWO_ITEMS} setSelectedBudget={jest.fn()} />
      </NavigationContainer>
    );

    await waitFor(() => expect(screen.getByText("Bill Item")).toBeVisible());

    // switch tabs
    const allTabs = screen.getAllByRole("tab");
    expect(allTabs.length).toBe(2);
    fireEvent.press(allTabs[1]);
    expect(screen.getByText("Fun")).toBeVisible();
  });

  test("can edit a budget", async () => {
    await AsyncStorage.setItem(
      "category-map",
      JSON.stringify(INITIAL_CATEGORY_MAP)
    );

    nock(Config.STARLING_API_URL)
      .get("/v2/accounts")
      .reply(200, {accounts: []});

    nock(Config.TRUELAYER_DATA_API_URL)
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

    const mockSetSelectedBudget = jest.fn();

    render(
      <NavigationContainer>
        <Budget
          budget={BUDGET_WITH_ONE_ITEM}
          setSelectedBudget={mockSetSelectedBudget}
        />
      </NavigationContainer>
    );

    // check the initial transactions for the bills budget item
    await waitFor(() => expect(screen.getByText("£307.48")).toBeVisible());
    expect(screen.getByText("left of £500.00")).toBeVisible();

    const editButton = screen.getAllByRole("button")[0];
    expect(editButton).toBeVisible();

    fireEvent.press(editButton);

    // check the budget is pre-populated with the correct values
    await waitFor(() => expect(screen.getByText("Edit Budget")).toBeVisible());
    const nameField = screen.getByLabelText("Name");
    const startDateField = screen.getByLabelText("Start date");
    const endDateField = screen.getByLabelText("End date");
    const itemNameField = screen.getByLabelText("Item name");
    const capField = screen.getByLabelText("Cap");
    const billsField = screen.getByLabelText("Bills");

    expect(nameField).toBeVisible();
    expect(nameField.props).toMatchObject({
      value: BUDGET_WITH_ONE_ITEM.name
    });

    expect(startDateField).toBeVisible();
    expect(startDateField.props).toMatchObject({
      date: BUDGET_WITH_ONE_ITEM.window.start.getTime()
    });

    expect(endDateField).toBeVisible();
    expect(endDateField.props).toMatchObject({
      date: BUDGET_WITH_ONE_ITEM.window.end.getTime()
    });

    expect(itemNameField).toBeVisible();
    expect(itemNameField.props).toMatchObject({
      value: BUDGET_WITH_ONE_ITEM.items[0].name
    });

    expect(capField).toBeVisible();
    expect(capField.props).toMatchObject({
      value: BUDGET_WITH_ONE_ITEM.items[0].cap.toString()
    });

    expect(billsField).toBeVisible();
    expect(billsField).toHaveAccessibilityState({checked: true});

    // change the form values and save
    fireEvent.changeText(nameField, "New name");
    const newStartDate = new Date("2013-01-01");
    fireEvent(
      startDateField,
      "onChange",
      {
        type: "set",
        nativeEvent: {
          timestamp: newStartDate.getTime()
        }
      },
      newStartDate
    );
    const newEndDate = new Date("2013-05-01");
    fireEvent(
      endDateField,
      "onChange",
      {
        type: "set",
        nativeEvent: {
          timestamp: newEndDate.getTime()
        }
      },
      newEndDate
    );

    fireEvent.changeText(itemNameField, "New item name");
    fireEvent.changeText(capField, "50");
    fireEvent.press(billsField);
    fireEvent.press(screen.getByLabelText("Eating out"));

    fireEvent.press(screen.getByText("Save"));

    // check all the new values are correct
    await waitFor(() => expect(mockSetSelectedBudget).toBeCalledTimes(1));
    expect(mockSetSelectedBudget).toBeCalledWith({
      id: BUDGET_WITH_ONE_ITEM.id,
      name: "New name",
      window: {
        start: newStartDate,
        end: newEndDate
      },
      items: [
        {
          id: BUDGET_WITH_ONE_ITEM.items[0].id,
          name: "New item name",
          cap: 50,
          categories: ["Eating out"]
        }
      ]
    });
  }, 10000);

  test("can refetch transactions", async () => {
    nock(Config.STARLING_API_URL)
      .get("/v2/accounts")
      .twice()
      .reply(200, {accounts: [STARLING_ACCOUNT_1]})
      // matches any url of the form "v2/feed/account/<uuid>/category/<uuid>/transactions-between"
      .get(
        /\/v2\/feed\/account\/([0-9a-z-]+)\/category\/([0-9a-z-]+)\/transactions-between/
      )
      .reply(200, {feedItems: [STARLING_FEED_ITEM_1]})
      // second call
      .get(
        /\/v2\/feed\/account\/([0-9a-z-]+)\/category\/([0-9a-z-]+)\/transactions-between/
      )
      .reply(200, {feedItems: [STARLING_FEED_ITEM_2]});

    nock(Config.TRUELAYER_DATA_API_URL)
      .get("/v1/cards")
      .twice()
      .reply(200, {
        results: [TRUELAYER_MASTERCARD],
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
      .reply(200, {
        results: [],
        status: "Succeeded"
      })
      // matches any url of the form "v1/cards/<uuid>/transactions/pending"
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions\/pending/)
      .reply(200, {
        results: [],
        status: "Succeeded"
      })
      // second call
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions/)
      .reply(200, {
        results: [],
        status: "Succeeded"
      })
      .get(/\/v1\/cards\/([0-9a-z-]+)\/transactions\/pending/)
      .reply(200, {
        results: [TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS],
        status: "Succeeded"
      });

    render(
      <NavigationContainer>
        <Budget
          budget={{
            ...BUDGET_WITH_ONE_ITEM,
            items: [
              {
                ...BUDGET_WITH_ONE_ITEM.items[0],
                categories: [Category.BILLS, Category.TRANSPORT]
              }
            ]
          }}
          setSelectedBudget={jest.fn()}
        />
      </NavigationContainer>
    );

    await waitFor(() =>
      expect(screen.getByLabelText("Transaction list")).toBeVisible()
    );

    // refetch transactions
    const transactionList = screen.getByLabelText("Transaction list");
    expect(transactionList).toBeDefined();
    const {refreshControl} = transactionList.props;
    await act(async () => {
      refreshControl.props.onRefresh();
    });

    await waitFor(() =>
      expect(
        screen.getByText(
          TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS.description
        )
      ).toBeVisible()
    );
    expect(
      screen.getByText(STARLING_FEED_ITEM_2.counterPartyName)
    ).toBeVisible();
  });
});
