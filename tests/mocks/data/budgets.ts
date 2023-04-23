import {Budget} from "../../../types/budget";

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
