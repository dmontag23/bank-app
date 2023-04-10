export enum TransactionCategory {
  BILLS = "0",
  EATING_OUT = "1",
  ENTERTAINMENT = "2",
  SAVINGS = "3",
  UNKNOWN = "4"
}

export type Transaction = {
  id: string;
  name: string;
  description: string;
  amount: number;
  category: TransactionCategory;
};

export type TransactionIDToCategoryMapping = {
  [id: string]: TransactionCategory | null;
};
