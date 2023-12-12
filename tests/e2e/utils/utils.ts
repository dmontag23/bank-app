import Config from "react-native-config";
import {device} from "detox";

export const logIn = async () => {
  await device.launchApp({
    newInstance: true,
    url: `${Config.URI}/${Config.TRUELAYER_CALLBACK_ENDPOINT}?code=dummy-truelayer-code&scope=accounts`
  });
};
