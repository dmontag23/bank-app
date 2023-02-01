import config from "./config.json";

export const BASE_URL = config.prodMode
  ? config.productionUrl
  : config.sandboxUrl;
export const AUTH_TOKEN = config.prodMode
  ? config.productionAuthToken
  : config.sandboxAuthToken;
