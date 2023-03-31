import {listen} from "../mocks/server/server";

export default async () => {
  await require("detox/runners/jest").globalSetup();
  await listen();
};
