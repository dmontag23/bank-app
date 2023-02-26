enum CardTransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT"
}

enum CardTransactionCategory {
  ATM = "ATM",
  BILL_PAYMENT = "BILL_PAYMENT",
  CASH = "CASH",
  CASHBACK = "CASHBACK",
  CHEQUE = "CHEQUE",
  CORRECTION = "CORRECTION",
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
  DIRECT_DEBIT = "DIRECT_DEBIT",
  DIVIDEND = "DIVIDEND",
  FEE_CHARGE = "FEE_CHARGE",
  INTEREST = "INTEREST",
  OTHER = "OTHER",
  PURCHASE = "PURCHASE",
  STANDING_ORDER = "STANDING_ORDER",
  TRANSFER = "TRANSFER",
  UNKNOWN = "UNKNOWN"
}

enum CardCurrency {
  AUSTRALIAN_DOLLARS = "AUD",
  DOLLARS = "USD",
  EUROS = "EUR",
  POUNDS = "GBP"
}

type RunningBalance = {
  amount: number;
  currency: CardCurrency;
};

type Metadata = {
  provider_transaction_category: string;
  provider_reference: string;
  provider_merchant_name: string;
  provider_category: string;
  address: string;
  provider_id: string;
  counter_party_preferred_name: string;
  counter_party_iban: string;
  user_comments: string;
  debtor_account_name: string;
  transaction_type: string;
  provider_source: string;
  cardNumber: string;
  location: string;
};

export type CardTransaction = {
  transaction_id: string;
  normalised_provider_transaction_id: string;
  provider_transaction_id: string;
  timestamp: string;
  description: string;
  amount: number;
  currency: CardCurrency;
  transaction_type: CardTransactionType;
  transaction_category: CardTransactionCategory;
  transaction_classification: string[];
  merchant_name: string;
  running_balance: RunningBalance;
  meta: Metadata;
};
