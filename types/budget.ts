import {Transaction, TransactionCategory} from "./transaction";

export type BudgetItem = {
  id: string;
  name: string;
  cap: number;
  categories: TransactionCategory[];
};

export type BudgetItemWithTransactions = BudgetItem & {
  spent: number;
  transactions: Transaction[];
};

type BudgetWindow = {
  start: Date;
  end: Date;
};

export type Budget = {
  id: string;
  name: string;
  items: BudgetItem[];
  window: BudgetWindow;
};

export type BudgetItemInput = Omit<BudgetItem, "cap"> & {
  cap: string;
};

export type BudgetInput = Omit<Budget, "items"> & {
  items: BudgetItemInput[];
};
