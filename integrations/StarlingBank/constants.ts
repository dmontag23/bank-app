import config from "../../config.json";

export const AUTH_TOKEN = config.integrations.useLiveUrls
  ? config.integrations.starling.productionAuthToken
  : config.integrations.starling.sandboxAuthToken;

export const BASE_URL = config.integrations.useLiveUrls
  ? config.integrations.starling.productionUrl
  : config.integrations.starling.sandboxUrl;
