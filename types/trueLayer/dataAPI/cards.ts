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

// Note that Truelayer breaks down classifications into categories and subcategories
// Only the categories are represented in this enum for simplicity, so the transaction_classification
// field below is still a string[]. See https://docs.truelayer.com/docs/transaction-data-reference
export enum TruelayerTransactionClassification {
  AUTO_AND_TRANSPORT = " Auto & Transport",
  BILLS_AND_UTILITIES = "Bills and Utilities",
  BUSINESS_SERVICES = "Business Services",
  EDUCATION = "Education",
  ENTERTAINMENT = "Entertainment",
  FEES_AND_CHARGES = "Fees & Charges",
  FOOD_AND_DINING = "Food & Dining",
  GAMBLING = "Gambling",
  GIFTS_AND_DONATIONS = "Gifts & Donations",
  HEALTH_AND_FITNESS = "Health & Fitness",
  HOME = "Home",
  INVESTMENTS = "Investments",
  PENSIONS_AND_INSURANCES = "Pensions and insurances",
  PERSONAL_CARE = "Personal Care",
  PERSONAL_SERVICES = "Personal Services",
  SHOPPING = "Shopping",
  TAXES = "Taxes",
  TRAVEL = "Travel",
  UNCATEGORIZED = "Uncategorized"
}

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

type Provider = {
  display_name: string;
  provider_id: string;
  logo_uri: string;
};

export type Card = {
  account_id: string;
  card_network: string;
  card_type: string;
  currency: CardCurrency;
  display_name: string;
  partial_card_number: string;
  name_on_card: string;
  valid_from?: string;
  valid_to?: string;
  update_timestamp: string;
  provider: Provider;
};
