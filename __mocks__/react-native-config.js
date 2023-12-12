// needed for react native config
// see https://github.com/lugg/react-native-config

// the values here should be the same as .env.local
export default {
  STARLING_API_AUTH_TOKEN: "good-starling-auth-token",
  STARLING_API_URL: "http://localhost:3000/starling",
  TRUELAYER_AUTH_API_URL: "http://localhost:3000/truelayer/auth",
  TRUELAYER_CALLBACK_ENDPOINT: "truelayer-callback",
  TRUELAYER_CLIENT_ID: "truelayer-client-id",
  TRUELAYER_CLIENT_SECRET: "truelayer-client-secret",
  TRUELAYER_DATA_API_URL: "http://localhost:3000/truelayer/data",
  // TODO: Change this url to one on the mock server
  TRUELAYER_OAUTH_URL:
    "https://auth.truelayer-sandbox.com/?response_type=code&client_id=sandbox-bankapp-995411&scope=info%20accounts%20balance%20cards%20transactions%20direct_debits%20standing_orders%20offline_access&redirect_uri=bankapp://truelayer-callback&providers=uk-cs-mock%20uk-ob-all%20uk-oauth-all",
  URI: "bankapp://"
};
