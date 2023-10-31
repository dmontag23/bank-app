import {by, element, expect} from "detox";
import {beforeEach, describe, it} from "@jest/globals";

import {Budget} from "../../../types/budget";
import {TransactionCategory} from "../../../types/transaction";
import {logIn} from "../utils/utils";

/* TODO: find a way to remove this function
With Detox, you cannot interact with AsyncStorage directly
because Detox runs in its own separate node process. This means
it is impossible to pre-seed any data into AsyncStorage for a test,
such as budget data. There are a few options to get around this
that should be explored:
  1. Mock AsyncStorage (using a module proxy) using the mock
     server (i.e. add endpoints to the mock server in a way that
     behaves like AsyncStorage).
  2. Use a different testing library like Appium that might allow
     for easier mocking or pre-seeding of AsyncStorage
  3. Start the app for the test with something that signals to the
     app that pre-seeded data should be created (e.g. create a launch
     URL that contains the information needed to seed AsyncStorage).
*/
const createBudget = async (budget: Budget) => {
  await element(by.id("addBudgetButton")).tap();

  // add budget summary
  const budgetNameInput = element(by.id("budgetNameInput"));
  await budgetNameInput.typeText(budget.name);
  await budgetNameInput.tapReturnKey();
  await element(by.label("Start date")).tap();
  await element(
    by.type("UIDatePicker").withAncestor(by.type("_UIDatePickerContainerView"))
  ).setDatePickerDate(budget.window.start.toISOString(), "ISO8601");
  await element(by.type("_UIDatePickerContainerView")).tap(); // dismiss the modal
  await element(by.label("End date")).tap();
  await element(
    by.type("UIDatePicker").withAncestor(by.type("_UIDatePickerContainerView"))
  ).setDatePickerDate(budget.window.end.toISOString(), "ISO8601");
  await element(by.type("_UIDatePickerContainerView")).tap(); // dismiss the modal

  // create budget items
  // have to use a for loop because array iterators don't know how to await a promise
  // before continuing to the next item in the array
  for (const [i, item] of budget.items.entries()) {
    await element(by.text("Add item")).tap();
    await waitFor(element(by.text("Add item")))
      .toBeVisible()
      .whileElement(by.id("budgetFormScrollView"))
      .scroll(400, "down");
    await expect(
      element(by.id("budgetItemNameInput")).atIndex(i)
    ).toBeVisible();
    await element(by.id("budgetItemNameInput")).atIndex(i).typeText(item.name);
    const capInputElement = element(by.id("budgetItemCapInput")).atIndex(i);
    await capInputElement.typeText(item.cap.toString());
    await capInputElement.tapReturnKey();
    for (const category of item.categories) {
      await element(by.text(Object.keys(TransactionCategory)[category]))
        .atIndex(i)
        .tap();
    }
  }

  // create the budget
  await element(by.text("Create")).tap();
};

describe("Budget page", () => {
  beforeEach(async () => {
    await logIn();
    // Note: Tap does not currently work on android API 33.
    // See https://github.com/wix/Detox/issues/3762
    await element(by.id("budgetsBottomNavButton")).tap();
  });

  it("should ask to select a budget", async () => {
    await expect(element(by.text("Please select a budget"))).toBeVisible();
  });

  it("should cancel the creation of a budget", async () => {
    const addBudgetButton = await element(by.id("addBudgetButton"));
    await expect(addBudgetButton).toBeVisible();
    await addBudgetButton.tap();
    await expect(element(by.text("New Budget"))).toBeVisible();

    // cancel the budget form
    const cancelButton = await element(by.text("Cancel"));
    await expect(cancelButton).toBeVisible();
    await cancelButton.tap();
    await expect(element(by.text("Please select a budget"))).toBeVisible();
  });

  it("should create a budget", async () => {
    const addBudgetButton = await element(by.id("addBudgetButton"));
    await expect(addBudgetButton).toBeVisible();
    await addBudgetButton.tap();
    await expect(element(by.text("New Budget"))).toBeVisible();

    // add budget summary
    const nameInput = await element(by.id("budgetNameInput"));
    await expect(nameInput).toBeVisible();
    await nameInput.typeText("Budget for Barbie");
    await nameInput.tapReturnKey();

    // set the start date
    const startDate = await element(by.label("Start date"));
    await expect(startDate).toBeVisible();
    await startDate.tap();
    const dateTimePickerElementStartDate = await element(
      by
        .type("UIDatePicker")
        .withAncestor(by.type("_UIDatePickerContainerView"))
    );
    await expect(dateTimePickerElementStartDate).toBeVisible();
    await dateTimePickerElementStartDate.setDatePickerDate(
      "2023-07-01",
      "yyyy-MM-dd"
    );
    await element(by.type("_UIDatePickerContainerView")).tap(); // dismiss the modal

    //set the end date
    const endDate = await element(by.label("End date"));
    await expect(endDate).toBeVisible();
    await endDate.tap();
    const dateTimePickerElementEndDate = await element(
      by
        .type("UIDatePicker")
        .withAncestor(by.type("_UIDatePickerOverlayPlatterView"))
    );
    await expect(dateTimePickerElementEndDate).toBeVisible();
    await dateTimePickerElementEndDate.setDatePickerDate(
      "2023-07-31",
      "yyyy-MM-dd"
    );
    await element(by.type("_UIDatePickerContainerView")).tap(); // dismiss the modal

    // create the first budget item
    const addItemButton = await element(by.text("Add item"));
    await expect(addItemButton).toBeVisible();
    await addItemButton.tap();

    // add item name
    const itemNameInput = await element(by.id("budgetItemNameInput"));
    await expect(itemNameInput).toBeVisible();
    await itemNameInput.typeText("Pink stuff");

    // add item cap
    const itemCapInput = await element(by.id("budgetItemCapInput"));
    await expect(itemCapInput).toBeVisible();
    await itemCapInput.typeText("300");
    await itemCapInput.tapReturnKey();

    // select the entertainment category
    const firstCategoryButton = await element(by.text("ENTERTAINMENT"));
    await expect(firstCategoryButton).toBeVisible();
    await firstCategoryButton.tap();

    // select the unknown category
    await waitFor(element(by.text("Add item")))
      .toBeVisible()
      .whileElement(by.id("budgetFormScrollView"))
      .scroll(100, "down");
    const secondCategoryButton = await element(by.text("UNKNOWN"));
    await expect(secondCategoryButton).toBeVisible();
    await secondCategoryButton.tap();

    // create the budget
    await element(by.text("Create")).tap();
    await expect(element(by.text("Pink stuff"))).toBeVisible();
    await expect(element(by.text("£300.00"))).toBeVisible();
    await expect(element(by.text("left of £300.00"))).toBeVisible();
    await expect(
      element(
        by.text("There are currently no transactions for this budget item.")
      )
    ).toBeVisible();
    await expect(element(by.text("Bud"))).toBeVisible(); // menu
  });

  it("should swipe between budget scenes", async () => {
    const budget: Budget = {
      id: "first-budget",
      name: "My first budget",
      items: [
        {
          id: "item-1",
          name: "Bills",
          cap: 150,
          categories: [TransactionCategory.BILLS]
        },
        {
          id: "item-2",
          name: "Eating out",
          cap: 500,
          categories: [TransactionCategory.EATING_OUT]
        }
      ],
      window: {start: new Date("2013-01-01"), end: new Date("2023-03-01")}
    };

    await createBudget(budget);

    await expect(element(by.text("Bills"))).toBeVisible();
    await expect(element(by.text("£-42.52"))).toBeVisible();
    await expect(element(by.text("left of £150.00"))).toBeVisible();
    await expect(element(by.text("PAY OFF CREDIT CARD BILL"))).toBeVisible();
    await expect(
      element(by.text(`1 Jan 2023 at 00:00  -  ${TransactionCategory.BILLS}`))
    ).toBeVisible();
    await expect(element(by.text("£192.52"))).toBeVisible();

    // swipe to next budget item
    await element(by.text("Bills")).swipe("left");

    await expect(element(by.text("Eating out"))).toBeVisible();
    await expect(element(by.text("£463.29"))).toBeVisible();
    await expect(element(by.text("left of £500.00"))).toBeVisible();
    await expect(element(by.text("CHIPOTLE AIRPORT BLVD"))).toBeVisible();
    await expect(
      element(
        by.text(`24 Feb 2013 at 14:00  -  ${TransactionCategory.EATING_OUT}`)
      )
    ).toBeVisible();
    await expect(element(by.text("£36.71"))).toBeVisible();
  });

  it("should delete a budget", async () => {
    const budget: Budget = {
      id: "first-budget",
      name: "My first budget",
      items: [
        {
          id: "item-1",
          name: "Bills",
          cap: 150,
          categories: [TransactionCategory.BILLS]
        }
      ],
      window: {start: new Date("2023-01-01"), end: new Date("2023-02-01")}
    };

    await createBudget(budget);

    // open the menu
    const menuItem = element(by.text("My "));
    await expect(menuItem).toBeVisible();
    await menuItem.tap();

    // delete the budget
    const deleteBudgetButton = element(by.id("deleteBudgetButton"));
    await expect(deleteBudgetButton).toBeVisible();
    await deleteBudgetButton.tap();

    // ensure the budget is deleted
    await expect(menuItem).not.toExist();
    await expect(element(by.text("Please select a budget"))).toBeVisible();
  });

  it("can change budgets via the menu", async () => {
    const firstBudget: Budget = {
      id: "first-budget",
      name: "First budget",
      items: [],
      window: {start: new Date("2023-01-01"), end: new Date("2023-02-01")}
    };

    const secondBudget: Budget = {
      id: "second-budget",
      name: "Second budget",
      items: [
        {
          id: "item-1",
          name: "Fun",
          cap: 150,
          categories: [TransactionCategory.SAVINGS]
        }
      ],
      window: {start: new Date("2023-02-01"), end: new Date("2023-03-01")}
    };

    await createBudget(firstBudget);
    await createBudget(secondBudget);

    // expect the second budget to be visible
    await expect(element(by.text("Fun"))).toBeVisible();

    // open the menu and choose the first budget
    await element(by.text("Sec")).tap();
    const firstBudgetMenu = element(by.text("First budget"));
    await expect(firstBudgetMenu).toBeVisible();
    await firstBudgetMenu.tap();

    // check that the budget has switched
    await expect(
      element(by.text("There are no items in this budget."))
    ).toBeVisible();
  });

  it("can change a transaction category on a budget", async () => {
    const firstBudget: Budget = {
      id: "first-budget",
      name: "First budget",
      items: [
        {
          id: "item-1",
          name: "Bills",
          cap: 500,
          categories: [TransactionCategory.BILLS]
        },
        {
          id: "item-2",
          name: "Savings",
          cap: 150,
          categories: [TransactionCategory.SAVINGS]
        }
      ],
      window: {start: new Date("2023-01-01"), end: new Date("2023-02-01")}
    };

    await createBudget(firstBudget);

    // check the transaction exists for the bills budget item
    await expect(element(by.text("Bills"))).toBeVisible();
    await expect(element(by.text("£307.48"))).toBeVisible();
    await expect(element(by.text("left of £500.00"))).toBeVisible();
    const transaction = element(by.text("PAY OFF CREDIT CARD BILL"));
    await expect(transaction).toBeVisible();
    await expect(element(by.text("£192.52"))).toBeVisible();
    await expect(
      element(by.text(`1 Jan 2023 at 00:00  -  ${TransactionCategory.BILLS}`))
    ).toBeVisible();

    // click the transaction
    await transaction.tap();
    await expect(element(by.text("Select a category"))).toBeVisible();
    await expect(
      element(by.text("PAY OFF CREDIT CARD BILL")).atIndex(0)
    ).toBeVisible();
    const savingsOption = element(by.text("SAVINGS"));
    await expect(savingsOption).toBeVisible();

    // click the savings option
    await savingsOption.tap();
    const billsTitle = element(by.text("Bills"));
    await expect(billsTitle).toBeVisible();
    await expect(element(by.text("£500.00"))).toBeVisible();
    await expect(
      element(
        by.text("There are currently no transactions for this budget item.")
      )
    ).toBeVisible();

    // swipe to the next screen
    await billsTitle.swipe("left");

    // check the transaction exists for the savings budget item
    await expect(element(by.text("Savings"))).toBeVisible();
    await expect(element(by.text("£-42.52"))).toBeVisible();
    await expect(element(by.text("left of £150.00"))).toBeVisible();
    await expect(element(by.text("PAY OFF CREDIT CARD BILL"))).toBeVisible();
    await expect(element(by.text("£192.52"))).toBeVisible();
    await expect(
      element(by.text(`1 Jan 2023 at 00:00  -  ${TransactionCategory.SAVINGS}`))
    ).toBeVisible();
  });

  it("filters transactions by the time window", async () => {
    const firstBudget: Budget = {
      id: "first-budget",
      name: "First budget",
      items: [
        {
          id: "item-1",
          name: "Everything",
          cap: 30000,
          categories: Object.values(TransactionCategory)
        }
      ],
      window: {start: new Date("2023-01-01"), end: new Date("2023-02-01")}
    };

    await createBudget(firstBudget);

    // check the transaction exists for the bills budget item
    await expect(element(by.text("PAY OFF CREDIT CARD BILL"))).toBeVisible();
    await expect(element(by.text("CHIPOTLE AIRPORT BLVD"))).not.toExist();
    await expect(element(by.text("CHAI POT YUM"))).not.toExist();

    // navigate to the transactions screen to ensure all transactions are present
    await element(by.id("transactionsBottomNavButton")).tap();
    await expect(element(by.text("PAY OFF CREDIT CARD BILL"))).toBeVisible();
    await expect(element(by.text("CHIPOTLE AIRPORT BLVD"))).toBeVisible();
    await expect(element(by.text("CHAI POT YUM"))).toBeVisible();
  });

  it("can cancel an edit to a budget", async () => {
    const budget: Budget = {
      id: "first-budget",
      name: "My first budget",
      items: [
        {
          id: "item-1",
          name: "Bills",
          cap: 150,
          categories: [TransactionCategory.BILLS]
        }
      ],
      window: {start: new Date("2023-01-01"), end: new Date("2023-02-01")}
    };

    await createBudget(budget);

    // ensure the correct elements initially appear
    await expect(element(by.text("Bills"))).toBeVisible();
    await expect(element(by.text("£-42.52"))).toBeVisible();
    await expect(element(by.text("left of £150.00"))).toBeVisible();

    // tap the edit button
    const editButton = element(by.label("Edit budget")).atIndex(1);
    await editButton.tap();

    // edit one field, and then cancel the edit
    const nameField = element(by.label("Name")).atIndex(1);
    await expect(nameField).toHaveText(budget.name);
    await nameField.replaceText("Cancel meeeeeee!");
    await element(by.text("Cancel")).tap();

    // tap the edit button to ensure all values are populated correctly in the form
    await editButton.tap();

    // set new budget values
    await expect(nameField).toHaveText(budget.name);
  });

  it("can edit a budget", async () => {
    const budget: Budget = {
      id: "first-budget",
      name: "My first budget",
      items: [
        {
          id: "item-1",
          name: "Bills",
          cap: 150,
          categories: [TransactionCategory.BILLS]
        }
      ],
      window: {start: new Date("2023-01-01"), end: new Date("2023-02-01")}
    };

    await createBudget(budget);

    // ensure the correct elements initially appear
    await expect(element(by.text("My "))).toBeVisible(); // menu button
    await expect(element(by.text("Bills"))).toBeVisible();
    await expect(element(by.text("£-42.52"))).toBeVisible();
    await expect(element(by.text("left of £150.00"))).toBeVisible();

    // tap the edit button
    const editButton = element(by.label("Edit budget")).atIndex(1);
    await editButton.tap();

    // set new budget values
    const nameField = element(by.label("Name")).atIndex(1);
    await nameField.replaceText("March");
    await element(by.label("Start date")).tap();
    await element(
      by
        .type("UIDatePicker")
        .withAncestor(by.type("_UIDatePickerContainerView"))
    ).setDatePickerDate(new Date("2023-03-01").toISOString(), "ISO8601");
    await nameField.tap(); // dismiss the modal
    await element(by.label("End date")).tap();
    await element(
      by
        .type("UIDatePicker")
        .withAncestor(by.type("_UIDatePickerContainerView"))
    ).setDatePickerDate(new Date("2023-04-01").toISOString(), "ISO8601");
    await nameField.tap(); // dismiss the modal
    await element(by.label("Item name")).atIndex(0).replaceText("Fun");
    await element(by.label("Cap")).atIndex(0).replaceText("500");
    await element(
      by.text(Object.keys(TransactionCategory)[TransactionCategory.BILLS])
    ).tap();
    await element(
      by.text(
        Object.keys(TransactionCategory)[TransactionCategory.ENTERTAINMENT]
      )
    ).tap();
    await element(by.text("Save")).tap();

    // check the new values have taken effect
    await expect(element(by.text("Mar"))).toBeVisible(); // menu button
    await expect(element(by.text("Fun"))).toBeVisible();
    await expect(element(by.text("£352.48"))).toBeVisible();
    await expect(element(by.text("left of £500.00"))).toBeVisible();
  });

  it("shows and hides budget categories", async () => {
    const firstBudget: Budget = {
      id: "first-budget",
      name: "First budget",
      items: [
        {
          id: "item-1",
          name: "Bills",
          cap: 1000,
          categories: [TransactionCategory.BILLS]
        }
      ],
      window: {start: new Date("2023-01-01"), end: new Date("2023-02-01")}
    };

    await createBudget(firstBudget);

    // twirl down the categories and check they all exist on the screen
    const categoriesButton = element(by.text("Categories"));
    await categoriesButton.tap();
    const billsCategory = element(by.text("BILLS"));
    await expect(billsCategory).toBeVisible();

    // twirl up the categories and check they are no longer visible
    await categoriesButton.tap();
    await expect(billsCategory).not.toBeVisible();
  });
});
