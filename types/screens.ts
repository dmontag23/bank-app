import {AuthRedirectResponse} from "./trueLayer/authAPI/auth";

export type TruelayerAuthStackParamList = {
  ThirdPartyConnections: undefined;
  TruelayerWebAuth: undefined;
  TruelayerAuthValidation: AuthRedirectResponse;
};
