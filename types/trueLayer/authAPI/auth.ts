import {AuthAPIErrorResponse} from "./serverResponse";

import {Permutations} from "../../utils";

export enum GrantType {
  AUTHORIZATION_CODE = "authorization_code",
  CLIENT_CREDS = "client_credentials",
  REFRESH = "refresh_token"
}

type ConnectTokenPostRequestOption1 = {
  client_id: string;
  client_secret: string;
  grant_type: GrantType;
  code: string;
  // only required if using PKCE flow
  code_verifier?: string;
  redirect_uri: string;
};

type ConnectTokenPostRequestOption2 = {
  client_id: string;
  client_secret: string;
  grant_type: GrantType;
  refresh_token: string;
};

enum RequestScope {
  PAYDIRECT = "paydirect",
  PAYMENTS = "payments",
  PAYOUTS = "payouts",
  RECURRING_PAYMENTS_COMMERCIAL = "recurring_payments:commercial",
  RECURRING_PAYMENTS_SWEEPING = "recurring_payments:sweeping",
  SIGNUP = "signupplus",
  TRACKING = "tracking"
}

type ConnectTokenPostRequestOption3 = {
  client_id: string;
  client_secret: string;
  grant_type: GrantType;
  // this string is made from permutations of values from RequestScope
  // that are space-delineated, e.g. "paydirect tracking" etc
  scope: Permutations<`${RequestScope}`>;
};

export type ConnectTokenPostRequest =
  | ConnectTokenPostRequestOption1
  | ConnectTokenPostRequestOption2
  | ConnectTokenPostRequestOption3;

type ResponseScope =
  | "accounts"
  | "balance"
  | "cards"
  | "direct_debits"
  | "info"
  | "offline_access"
  | "standing_orders"
  | "transactions";

export type ConnectTokenPostResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
  // this string is made from permutations of values from ResponseScope
  // that are space-delineated, e.g. "info accounts balance" etc
  scope: Permutations<`${ResponseScope}`>;
};

type AuthRedirectSuccessResponse = {
  code: string;
  scope: Permutations<`${ResponseScope}`>;
};

export type AuthRedirectResponse =
  | AuthRedirectSuccessResponse
  | AuthAPIErrorResponse;

// type guards for the auth redirect response
export const isAuthRedirectSuccess = (
  response: AuthRedirectResponse
): response is AuthRedirectSuccessResponse =>
  (response as AuthRedirectSuccessResponse).code !== undefined;

export const isAuthAPIErrorResponse = (
  response: AuthRedirectResponse
): response is AuthAPIErrorResponse =>
  (response as AuthAPIErrorResponse).error !== undefined;
