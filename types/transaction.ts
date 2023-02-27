export enum TransactionCategory {
    BILLS = "BILLS",
    EATING_OUT = "EATING_OUT",
    ENTERTAINMENT = "ENTERTAINMENT",
    SAVINGS = "SAVINGS",
    UNKNOWN = "UNKNOWN"
}

export type Transaction = {
    amount: number;
    category: TransactionCategory
}