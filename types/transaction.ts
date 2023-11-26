export enum Source {
  STARLING = "starling",
  TRUELAYER = "truelayer"
}

export type Transaction = {
  id: string;
  name: string;
  description: string;
  amount: number;
  category: string;
  timestamp: Date;
  source: Source;
};

export type TransactionIDToCategoryMapping = {
  [id: string]: string | null;
};

export type CategoryAssociations = {icon: string; color: string};

export type CategoryMap = Record<string, CategoryAssociations>;
