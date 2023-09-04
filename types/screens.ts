import {AuthRedirectResponse} from "./trueLayer/authAPI/auth";

export type LoggedInTabParamList = {
  Budgets: undefined;
  Transactions: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  AppViews: undefined;
  TruelayerWebAuth: undefined;
  TruelayerAuthValidation: AuthRedirectResponse;
};
