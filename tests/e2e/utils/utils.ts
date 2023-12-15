import {device} from "detox";

import Config from "../../../config.json";

export const logIn = async () => {
  await device.launchApp({
    newInstance: true,
    url: `${Config.URI}${Config.TRUELAYER_CALLBACK_ENDPOINT}?code=dummy-truelayer-code&scope=accounts`
  });
};
