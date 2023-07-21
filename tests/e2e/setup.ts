import {device} from "detox";
import {beforeAll, beforeEach} from "@jest/globals";

beforeAll(async () => {
  await device.launchApp();
});

beforeEach(async () => {
  await device.reloadReactNative();
});
