export type Transaction = {
  id: string;
  name: string;
  description: string;
  amount: number;
  category: string;
  timestamp: Date;
};

export type TransactionIDToCategoryMapping = {
  [id: string]: string | null;
};

export type CategoryMap = Record<string, {icon: string; color: string}>;
