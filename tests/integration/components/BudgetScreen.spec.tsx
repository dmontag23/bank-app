import React from "react";
import {describe, expect, jest, test} from "@jest/globals";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react-native";

import {trueLayerDataApi} from "../../../api/axiosConfig";
import BudgetsScreen from "../../../components/Budgets/BudgetsScreen";
import {TransactionCategory} from "../../../types/transaction";
import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";
import {
  BUDGET_WITH_NO_ITEMS,
  BUDGET_WITH_ONE_ITEM,
  BUDGET_WITH_TWO_ITEMS
} from "../../mocks/data/budgets";
import {
  TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_ENTERTAINMENT_TRANSACTION_MINIMUM_FIELDS,
  TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
} from "../../mocks/trueLayer/dataAPI/data/cardData";
import {ComponentTestWrapper} from "../../mocks/utils";

jest.mock("../../../api/axiosConfig");

describe("Budget screen", () => {
  test("renders the default home page with no selected budget", () => {
    render(<BudgetsScreen />, {
      wrapper: ComponentTestWrapper
    });

    expect(screen.getByText("Please select a budget")).toBeVisible();

    // button to add a new budget
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(1);
  });

  test("can select a budget from the menu", async () => {
    // setup AsyncStorage with mock data
    await AsyncStorage.setItem(
      `budget-${BUDGET_WITH_NO_ITEMS.id}`,
      JSON.stringify(BUDGET_WITH_NO_ITEMS)
    );

    // setup mock transaction data
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    ).mockImplementation(async () => []);

    render(<BudgetsScreen />, {
      wrapper: ComponentTestWrapper
    });

    // select the budget from the menu
    await waitFor(() => {
      expect(screen.getByLabelText("Budget menu")).toBeVisible();
    });
    fireEvent.press(screen.getByLabelText("Budget menu"));
    const budgetMenuItem = screen.getByText(BUDGET_WITH_NO_ITEMS.name);
    // TODO: Investigate why toBeVisible() fails here
    // I think it's because the opacity of a parent is 0
    expect(budgetMenuItem).toBeOnTheScreen();
    fireEvent.press(budgetMenuItem);

    await waitFor(() =>
      expect(
        screen.getByText("There are no items in this budget.")
      ).toBeVisible()
    );
  });

  test("renders a budget without transactions", async () => {
    // setup AsyncStorage with mock data
    await AsyncStorage.setItem(
      `budget-${BUDGET_WITH_ONE_ITEM.id}`,
      JSON.stringify(BUDGET_WITH_ONE_ITEM)
    );

    // setup mock transaction data
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    ).mockImplementation(async () => []);

    render(<BudgetsScreen />, {
      wrapper: ComponentTestWrapper
    });

    // select the budget from the menu
    await waitFor(() => {
      expect(screen.getByLabelText("Budget menu")).toBeVisible();
    });
    fireEvent.press(screen.getByLabelText("Budget menu"));
    const budgetMenuItem = screen.getByText(BUDGET_WITH_ONE_ITEM.name);
    // TODO: Investigate why toBeVisible() fails here
    // I think it's because the opacity of a parent is 0
    expect(budgetMenuItem).toBeOnTheScreen();
    fireEvent.press(budgetMenuItem);

    await waitFor(() =>
      expect(
        screen.getByText(
          "There are currently no transactions for this budget item."
        )
      ).toBeVisible()
    );
  });

  test("deletes a budget", async () => {
    // setup AsyncStorage with mock data
    await AsyncStorage.setItem(
      `budget-${BUDGET_WITH_ONE_ITEM.id}`,
      JSON.stringify(BUDGET_WITH_ONE_ITEM)
    );

    // setup mock transaction data
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    ).mockImplementation(async () => []);

    render(<BudgetsScreen />, {
      wrapper: ComponentTestWrapper
    });

    // select the budget from the menu
    await waitFor(() => {
      expect(screen.getByLabelText("Budget menu")).toBeVisible();
    });
    const budgetMenuButton = screen.getByLabelText("Budget menu");
    fireEvent.press(budgetMenuButton);
    const budgetMenuItem = screen.getByText(BUDGET_WITH_ONE_ITEM.name);
    // TODO: Investigate why toBeVisible() fails here
    // I think it's because the opacity of a parent is 0
    expect(budgetMenuItem).toBeOnTheScreen();
    fireEvent.press(budgetMenuItem);
    await waitFor(() =>
      expect(screen.getByText("left of £500.00")).toBeVisible()
    );

    // delete the budget
    fireEvent.press(budgetMenuButton);
    const menuButtons = screen.getAllByRole("button");
    expect(menuButtons.length).toBe(2);
    fireEvent.press(menuButtons[1]);

    await waitFor(() =>
      expect(screen.getByText("Please select a budget")).toBeVisible()
    );
  });

  test("can change the budget category", async () => {
    // setup AsyncStorage with mock data
    await AsyncStorage.setItem(
      `budget-${BUDGET_WITH_TWO_ITEMS.id}`,
      JSON.stringify(BUDGET_WITH_TWO_ITEMS)
    );

    // setup mock transaction data
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    ).mockImplementation(async () => [
      TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS
    ]);

    render(<BudgetsScreen />, {
      wrapper: ComponentTestWrapper
    });

    // select the budget from the menu
    await waitFor(() => {
      expect(screen.getByLabelText("Budget menu")).toBeVisible();
    });
    const budgetMenuButton = screen.getByLabelText("Budget menu");
    fireEvent.press(budgetMenuButton);
    const budgetMenuItem = screen.getByText(BUDGET_WITH_TWO_ITEMS.name);
    // TODO: Investigate why toBeVisible() fails here
    // I think it's because the opacity of a parent is 0
    expect(budgetMenuItem).toBeOnTheScreen();
    fireEvent.press(budgetMenuItem);

    // check the home screen has updated accordingly
    await waitFor(() =>
      expect(screen.getByText("PAY OFF CREDIT CARD BILL")).toBeVisible()
    );
    expect(screen.getByText(TransactionCategory.BILLS)).toBeVisible();

    // change the transaction category
    fireEvent.press(screen.getByText("PAY OFF CREDIT CARD BILL"));
    await waitFor(() =>
      expect(screen.getByText("Select a category")).toBeVisible()
    );
    const newCategory = screen.getByText("ENTERTAINMENT");
    expect(newCategory).toBeVisible();
    fireEvent.press(newCategory);

    // check the home screen no longer contains the transaction
    await waitFor(() =>
      expect(
        screen.getByText(
          "There are currently no transactions for this budget item."
        )
      ).toBeVisible()
    );

    // check the next screen contains the transaction
    fireEvent.press(screen.getAllByRole("tab")[1]);
    expect(screen.getByText("PAY OFF CREDIT CARD BILL")).toBeVisible();
    expect(screen.getByText(TransactionCategory.ENTERTAINMENT)).toBeVisible();
  });

  test("cancels the new budget form", async () => {
    render(<BudgetsScreen />, {
      wrapper: ComponentTestWrapper
    });

    // press button to add a new budget
    const addBudgetButton = screen.getAllByRole("button")[0];
    fireEvent.press(addBudgetButton);

    // new budget form
    const newBudgetTitle = screen.getByText("New Budget");
    await waitFor(() => expect(newBudgetTitle).toBeVisible());

    // cancel the form
    const cancelButton = screen.getByText("Cancel");
    expect(cancelButton).toBeVisible();
    fireEvent.press(cancelButton);
    await waitFor(() => expect(newBudgetTitle).not.toBeOnTheScreen());
  });

  // TODO: Come back and update this test once transactions are filtered by
  // budget date range
  test("creates a budget", async () => {
    // setup mock transactions
    (
      trueLayerDataApi.get as jest.MockedFunction<
        typeof trueLayerDataApi.get<CardTransaction[]>
      >
    ).mockImplementation(async () => [
      TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS,
      TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS,
      TRUELAYER_ENTERTAINMENT_TRANSACTION_MINIMUM_FIELDS
    ]);

    render(<BudgetsScreen />, {
      wrapper: ComponentTestWrapper
    });

    // press button to add a new budget
    const addBudgetButton = screen.getAllByRole("button")[0];
    fireEvent.press(addBudgetButton);

    // new budget form
    const newBudgetTitle = screen.getByText("New Budget");
    await waitFor(() => expect(newBudgetTitle).toBeVisible());

    // set the budget name
    const nameField = screen.getByLabelText("Name");
    expect(nameField).toBeVisible();
    fireEvent.changeText(nameField, "My first budget!")!;

    // set the budget start date
    const startDate = new Date("2023-03-01");
    const startDateField = screen.getByLabelText("Start date");
    expect(startDateField).toBeVisible();
    fireEvent(
      startDateField,
      "onChange",
      {
        type: "set",
        nativeEvent: {
          timestamp: startDate.getTime()
        }
      },
      startDate
    );

    // set the budget end date
    const endDate = new Date("2023-04-01");
    const endDateField = screen.getByLabelText("Start date");
    expect(endDateField).toBeVisible();
    fireEvent(
      endDateField,
      "onChange",
      {
        type: "set",
        nativeEvent: {
          timestamp: endDate.getTime()
        }
      },
      endDate
    );

    // click the button to add an item
    const addItemButton = screen.getByText("Add item");
    expect(addItemButton).toBeVisible();
    fireEvent.press(addItemButton);
    expect(screen.getByText("Budget Item")).toBeVisible();

    // add an item name
    const itemNameField = screen.getAllByLabelText("Item name")[0];
    expect(itemNameField).toBeVisible();
    fireEvent.changeText(itemNameField, "Gifts for Cardi B");

    // add a cap for an item
    const itemCapField = screen.getAllByLabelText("Cap")[0];
    expect(itemCapField).toBeVisible();
    fireEvent.changeText(itemCapField, "4300.21");

    // set two categories
    const eatingOutOption = screen.getAllByLabelText("EATING_OUT")[0];
    expect(eatingOutOption).toBeVisible();
    expect(eatingOutOption).toBeEnabled();
    fireEvent.press(eatingOutOption);

    const entertainmentOption = screen.getAllByLabelText("ENTERTAINMENT")[0];
    expect(entertainmentOption).toBeVisible();
    expect(entertainmentOption).toBeEnabled();
    fireEvent.press(entertainmentOption);

    // click the button to add a second item
    expect(addItemButton).toBeVisible();
    fireEvent.press(addItemButton);
    expect(screen.getByText("Budget Item")).toBeVisible();

    // add an item name
    const secondItemNameField = screen.getAllByLabelText("Item name")[1];
    expect(secondItemNameField).toBeVisible();
    fireEvent.changeText(secondItemNameField, "No good bills");

    // add a cap for an item
    const secondItemCapField = screen.getAllByLabelText("Cap")[1];
    expect(secondItemCapField).toBeVisible();
    fireEvent.changeText(secondItemCapField, "2000");

    // check that already taken categories are disabled
    expect(screen.getAllByLabelText("EATING_OUT")[1]).toBeDisabled();
    expect(screen.getAllByLabelText("ENTERTAINMENT")[1]).toBeDisabled();

    // set a category
    const billsOption = screen.getAllByLabelText("BILLS")[1];
    expect(billsOption).toBeVisible();
    expect(billsOption).toBeEnabled();
    fireEvent.press(billsOption);

    // submit the form
    const createButton = screen.getByText("Create");
    expect(createButton).toBeVisible();
    fireEvent.press(createButton);
    await waitFor(() => expect(newBudgetTitle).not.toBeOnTheScreen());

    // check all first budget items are okay
    expect(screen.getByText("Gifts for Cardi B")).toBeVisible();
    expect(screen.getByText("£4164.91")).toBeVisible();
    expect(screen.getByText("left of £4300.21")).toBeVisible();
    expect(screen.getByText("CHAI POT YUM")).toBeVisible();
    // TODO: Uncomment the line below when you have proper categories displayed
    // expect(screen.getByText(TransactionCategory.EATING_OUT)).toBeVisible();
    expect(screen.getByText("£3.30")).toBeVisible();
    expect(screen.getByText("ZARA")).toBeVisible();
    // TODO: Uncomment the line below when you have proper categories displayed
    // expect(screen.getByText(TransactionCategory.ENTERTAINMENT)).toBeVisible();
    expect(screen.getByText("£132.00")).toBeVisible();

    // check second budget item
    const allTabButtons = screen.getAllByRole("tab");
    expect(allTabButtons.length).toBe(2);
    fireEvent.press(allTabButtons[1]);

    expect(screen.getByText("No good bills")).toBeVisible();
    expect(screen.getByText("£1807.48")).toBeVisible();
    expect(screen.getByText("left of £2000.00")).toBeVisible();
    expect(screen.getByText("PAY OFF CREDIT CARD BILL")).toBeVisible();
    // TODO: Uncomment the line below when you have proper categories displayed
    // expect(screen.getByText(TransactionCategory.BILLS)).toBeVisible();
    expect(screen.getByText("£192.52")).toBeVisible();

    // check the menu contains one budget
    const budgetMenuButton = screen.getByLabelText("Budget menu");
    expect(budgetMenuButton).toBeVisible();

    fireEvent.press(budgetMenuButton);
    // TODO: Investigate why toBeVisible() fails here
    // I think it's because the opacity of a parent is 0
    expect(screen.getByText("My first budget!")).toBeOnTheScreen();
  });
});
