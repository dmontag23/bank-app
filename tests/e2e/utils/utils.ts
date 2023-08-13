import {device} from "detox";

import config from "../../../config.json";

export const logIn = async () => {
  await device.launchApp({
    newInstance: true,
    url: `${config.uri}/${config.integrations.trueLayer.callbackEndpoint}?code=dummy-truelayer-code&scope=accounts`
  });
};
