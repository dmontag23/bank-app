type CardTransactionType = "CREDIT" | "DEBIT";

type CardTransactionCategory =
  | "ATM"
  | "BILL_PAYMENT"
  | "CASH"
  | "CASHBACK"
  | "CHEQUE"
  | "CORRECTION"
  | "CREDIT"
  | "DEBIT"
  | "DIRECT_DEBIT"
  | "DIVIDEND"
  | "FEE_CHARGE"
  | "INTEREST"
  | "OTHER"
  | "PURCHASE"
  | "STANDING_ORDER"
  | "TRANSFER"
  | "UNKNOWN";

type CardCurrency = "AUD" | "USD" | "EUR" | "GBP";

type RunningBalance = {
  amount?: number;
  currency?: CardCurrency;
};

type Metadata = {
  provider_transaction_category?: string;
  provider_reference?: string;
  provider_merchant_name?: string;
  provider_category?: string;
  address?: string;
  provider_id?: string;
  counter_party_preferred_name?: string;
  counter_party_iban?: string;
  user_comments?: string;
  debtor_account_name?: string;
  transaction_type?: string;
  provider_source?: string;
  cardNumber?: string;
  location?: string;
};

export type CardTransaction = {
  transaction_id: string;
  normalised_provider_transaction_id?: string;
  provider_transaction_id?: string;
  timestamp: string;
  description: string;
  amount: number;
  currency: CardCurrency;
  transaction_type: CardTransactionType;
  transaction_category: CardTransactionCategory;
  transaction_classification: string[];
  merchant_name?: string;
  running_balance?: RunningBalance;
  meta?: Metadata;
};
