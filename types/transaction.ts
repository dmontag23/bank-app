export enum Source {
  STARLING = "Starling",
  TRUELAYER = "Truelayer",
  UNKNOWN = "Unknown"
}

export enum Category {
  BILLS = "Bills",
  BUSINESS = "Business",
  CASH = "Cash",
  CHARITY = "Charity",
  CLOTHES = "Clothes",
  COFFEE = "Coffee",
  DRINKS = "Drinks",
  EATING_OUT = "Eating out",
  ENTERTAINMENT = "Entertainment",
  FITNESS = "Fitness",
  GAMING = "Gaming",
  GIFTS = "Gifts",
  GROCERIES = "Groceries",
  HOLIDAYS = "Holidays",
  HOME = "Home",
  INCOME = "Income",
  MEDICAL = "Medical",
  MORTGAGE = "Mortgage",
  RENT = "Rent",
  SAVINGS = "Savings",
  SHOPPING = "Shopping",
  TRANSPORT = "Transport",
  UNKNOWN = "Unknown"
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

export type DateRange = {
  from: Date;
  to: Date;
};
