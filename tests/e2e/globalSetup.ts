import {listen} from "../../mock-server/server";

export default async () => {
  await require("detox/runners/jest").globalSetup();
  await listen();
};
