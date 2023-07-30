import {device} from "detox";
import {beforeEach} from "@jest/globals";

beforeEach(async () => {
  // Note: this is necessary in order to clear async storage
  // before each test
  await device.uninstallApp();
  await device.installApp();
  await device.launchApp();
});
