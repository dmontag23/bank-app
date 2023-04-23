import {Budget, BudgetItem} from "../../../types/budget";
import {TransactionCategory} from "../../../types/transaction";

export const BUDGET_NO_NAME_OR_ITEMS: Budget = {
  id: "budget-1",
  name: "",
  items: [],
  window: {start: new Date(), end: new Date()}
};

export const BUDGET_WITH_NO_ITEMS: Budget = {
  id: "budget-2",
  name: "Test budget 2",
  items: [],
  window: {start: new Date(), end: new Date()}
};

export const BUDGET_ITEM_BILLS: BudgetItem = {
  id: "item-1",
  name: "Bills",
  cap: 500,
  categories: [TransactionCategory.BILLS]
};

export const BUDGET_WITH_ONE_ITEM: Budget = {
  id: "budget-2",
  name: "Bills",
  items: [BUDGET_ITEM_BILLS],
  window: {start: new Date(), end: new Date()}
};
