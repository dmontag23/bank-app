import {Transaction, TransactionCategory} from "./transaction";

type BudgetWindow = {
  start: Date;
  end: Date;
};

export type BudgetItem = {
  name: string;
  cap: number;
  categories: TransactionCategory[];
  spent: number;
  transactions: Transaction[];
};

export type Budget = {
  name: string;
  items: BudgetItem[];
  window: BudgetWindow;
};
