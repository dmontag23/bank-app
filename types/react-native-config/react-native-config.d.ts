// needed for react-native-config
// see https://github.com/lugg/react-native-config
declare module "react-native-config" {
  export interface NativeConfig {
    STARLING_API_AUTH_TOKEN: string;
    STARLING_API_URL: string;
    TRUELAYER_AUTH_API_URL: string;
    TRUELAYER_CALLBACK_ENDPOINT: string;
    TRUELAYER_CLIENT_ID: string;
    TRUELAYER_CLIENT_SECRET: string;
    TRUELAYER_DATA_API_URL: string;
    TRUELAYER_OAUTH_URL: string;
    URI: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
