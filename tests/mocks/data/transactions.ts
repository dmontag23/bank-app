// TODO: Re-evaluate the need for testing data for internal data types
// It might be necessary for unit/integration tests but shouldn't be necessary
// for e2e tests, so it would be good to determine just how useful they are

import {Source, Transaction} from "../../../types/transaction";

// The transformed version of TRUELAYER_EATING_OUT_CARD_TRANSACTION_MINIMUM_FIELDS
// from the TrueLayer mocked card data
export const EATING_OUT_CARD_TRANSACTION: Transaction = {
  id: "truelayer-1234094-shocking-chipotle",
  name: "CHIPOTLE AIRPORT BLVD",
  description: "Food & Dining",
  amount: 36.71,
  category: "Eating out",
  timestamp: new Date("2013-02-24T14:00:00Z"),
  source: Source.TRUELAYER
};

export const PAY_BILL_CARD_TRANSACTION: Transaction = {
  id: "a15d8156569ba848d84c07c34d291bca",
  name: "PAY OFF CREDIT CARD BILL",
  description: "Bills and Utilities",
  amount: 192.52,
  category: "Bills",
  timestamp: new Date("2023-01-01T00:00:00Z"),
  source: Source.TRUELAYER
};

export const PAY_RENT_TRANSACTION: Transaction = {
  id: "b15d8156569ba848d84c07c34d291bcb",
  name: "RENT",
  description: "Bills and Utilities",
  amount: 10,
  category: "Bills",
  timestamp: new Date("2023-03-07T00:00:00Z"),
  source: Source.TRUELAYER
};
