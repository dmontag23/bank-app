import {by, element, expect} from "detox";
import {beforeEach, describe, it} from "@jest/globals";

import {logIn} from "./utils/utils";

describe("On log in", () => {
  beforeEach(async () => await logIn());

  it("the budget page is selected", async () => {
    await expect(element(by.text("Please select a budget"))).toBeVisible();
  });
});
