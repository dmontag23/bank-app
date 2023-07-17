import {Budget, BudgetItem} from "../../../types/budget";
import {TransactionCategory} from "../../../types/transaction";

export const BUDGET_ITEM_BILLS: BudgetItem = {
  id: "item-1",
  name: "Bills",
  cap: 500,
  categories: [TransactionCategory.BILLS]
};

export const BUDGET_ITEM_FUN: BudgetItem = {
  id: "item-2",
  name: "Fun",
  cap: 50,
  categories: [TransactionCategory.ENTERTAINMENT]
};

export const BUDGET_NO_NAME_OR_ITEMS: Budget = {
  id: "1",
  name: "",
  items: [],
  window: {start: new Date(), end: new Date()}
};

export const BUDGET_WITH_NO_ITEMS: Budget = {
  id: "2",
  name: "Test budget 2",
  items: [],
  window: {start: new Date(), end: new Date()}
};

export const BUDGET_WITH_ONE_ITEM: Budget = {
  id: "3",
  name: "Bills",
  items: [BUDGET_ITEM_BILLS],
  window: {start: new Date(), end: new Date()}
};

export const BUDGET_WITH_TWO_ITEMS: Budget = {
  id: "4",
  name: "June",
  items: [BUDGET_ITEM_BILLS, BUDGET_ITEM_FUN],
  window: {start: new Date(), end: new Date()}
};
