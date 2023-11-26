import {CardTransaction} from "../../../types/trueLayer/dataAPI/cards";

export const TRUELAYER_PAY_BILL_CARD_TRANSACTION_ALL_FIELDS: CardTransaction = {
  transaction_id: "a15d8156569ba848d84c07c34d291bca",
  normalised_provider_transaction_id: "txn-ajdifh38fheu5hgue",
  provider_transaction_id: "9882ks-00js",
  timestamp: "2023-01-01T00:00:00Z",
  description: "PAY OFF CREDIT CARD BILL",
  amount: 192.52,
  currency: "GBP",
  transaction_type: "CREDIT",
  transaction_category: "BILL_PAYMENT",
  transaction_classification: ["Bills and Utilities", "Payment"],
  merchant_name: "American Express",
  running_balance: {
    amount: 0.0,
    currency: "GBP"
  },
  meta: {
    provider_transaction_category: "Bills",
    provider_reference: "AMEX-234934535",
    provider_merchant_name: "AMER EXPR",
    provider_category: "CREDIT COMPANY",
    address: "1234 Love Lane, London SW11 3NG",
    provider_id: "2340-sdmvwdr",
    counter_party_preferred_name: "DAT PAYER",
    counter_party_iban: "IT12345678901234",
    user_comments: "This user is paying off his bill like a good boi",
    debtor_account_name: "Personal Acct",
    transaction_type: "CREDIT",
    provider_source: "Bank acct transfer",
    cardNumber: "1234-5678-9123-4556",
    location: "London"
  }
};

export const TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS: CardTransaction =
  {
    transaction_id: "1234094-shocking-chipotle",
    timestamp: "2013-02-24T14:00:00Z",
    description: "CHIPOTLE AIRPORT BLVD",
    amount: 36.71,
    currency: "USD",
    transaction_type: "DEBIT",
    transaction_category: "PURCHASE",
    transaction_classification: ["Food & Dining", "Restaurants"]
  };

export const TRUELAYER_EATING_OUT_MARCH_CARD_TRANSACTION_MINIMUM_FIELDS: CardTransaction =
  {
    transaction_id: "1234000-chai-pot",
    timestamp: "2023-03-23T14:00:00Z",
    description: "CHAI POT YUM",
    amount: 3.3,
    currency: "GBP",
    transaction_type: "DEBIT",
    transaction_category: "PURCHASE",
    transaction_classification: ["Food & Dining", "Restaurants"]
  };

export const TRUELAYER_ENTERTAINMENT_TRANSACTION_MINIMUM_FIELDS: CardTransaction =
  {
    transaction_id: "0402944-dem-clothes",
    timestamp: "2023-03-01T00:00:00Z",
    description: "ZARA",
    amount: 132,
    currency: "GBP",
    transaction_type: "DEBIT",
    transaction_category: "PURCHASE",
    transaction_classification: ["Shopping"]
  };

export const TRUELAYER_ENTERTAINMENT_TRANSACTION_MARCH_MINIMUM_FIELDS: CardTransaction =
  {
    transaction_id: "0402945-oppenheimer-barbie",
    timestamp: "2023-03-15T00:00:00Z",
    description: "DOUBLE FEATURE",
    amount: 15.52,
    currency: "GBP",
    transaction_type: "DEBIT",
    transaction_category: "PURCHASE",
    transaction_classification: ["Entertainment", "Movies & DVDs"]
  };
