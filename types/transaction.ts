export enum TransactionCategory {
    BILLS = "BILLS",
    EATING_OUT = "EATING_OUT",
    ENTERTAINMENT = "ENTERTAINMENT",
    SAVINGS = "SAVINGS",
    UNKNOWN = "UNKNOWN"
}

export type Transaction = {
    name: string;
    description: string;
    amount: number;
    category: TransactionCategory
}