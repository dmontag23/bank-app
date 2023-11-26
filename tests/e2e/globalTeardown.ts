import {close} from "../../mock-server/server";

export default async () => {
  try {
    await close();
  } finally {
    await require("detox/runners/jest").globalTeardown();
  }
};
