enum Scope {
  ACCOUNTS = "accounts",
  BALANCE = "balance",
  CARDS = "cards",
  DIRECT_DEBITS = "direct_debits",
  INFO = "info",
  OFFLINE_ACCESS = "offline_access",
  STANDING_ORDERS = "standing_orders",
  TRANSACTIONS = "transactions"
}

export type ConnectTokenPostResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  scope: Scope;
};
